import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { DrugIndicationsService } from '../drug-indications/drug-indications.service';
import * as xml2js from 'xml2js';
import * as fs from 'fs';
import * as path from 'path';

const DAILYMED_API_URL = 'https://dailymed.nlm.nih.gov/dailymed/services/v2';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface Indication {
  title: string;
  text: string;
}

interface MappedIndication {
  title: string;
  text: string;
  icd10_code: string | null;
  icd10_description: string | null;
}

@Injectable()
export class DailyMedService {
  private readonly logger = new Logger(DailyMedService.name);
  private readonly baseUrl: string;
  private readonly parser: xml2js.Parser;

  constructor(
    private readonly configService: ConfigService,
    private readonly drugIndicationsService: DrugIndicationsService,
  ) {
    this.baseUrl = DAILYMED_API_URL;
    this.parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      explicitChildren: false,
      explicitRoot: true,
      tagNameProcessors: [xml2js.processors.stripPrefix],
      valueProcessors: [
        xml2js.processors.parseBooleans,
        xml2js.processors.parseNumbers,
      ],
    });
  }

  /**
   * Search for a drug name and return the first matching SET ID
   * @param name Drug name to search for
   * @returns First matching SET ID as a string (or null if not found)
   */
  async searchDrugSetId(name: string): Promise<string | null> {
    try {
      const endpoint = `${this.baseUrl}/spls.json`;

      const response = await axios.get(endpoint, {
        params: {
          drug_name: name,
          pagesize: 1,
          page: 1,
        },
      });

      const firstMatch = response.data?.data?.[0];

      if (firstMatch.setid) {
        const indications = await this.getIndicationsFromSetId(
          firstMatch.setid,
        );
        console.log(indications);

        const mappedIndications = await this.mapIndicationsToICD10(indications);

        console.log(mappedIndications);
      }

      return firstMatch?.setid || null;
    } catch (error) {
      this.logger.error(
        `Error fetching SET ID for drug "${name}": ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Fetch the Indications and Usage section from the SPL XML using the SET ID
   * @param setId The SET ID for the drug
   * @returns The Indications and Usage section text or null if not found
   */
  async getIndicationsFromSetId(
    setId: string,
  ): Promise<Array<{ title: string; text: string }> | null> {
    try {
      const endpoint = `${this.baseUrl}/spls/${setId}.xml`;

      // Fetch the raw XML
      const response = await axios.get(endpoint, {
        responseType: 'text', // Ensure we get raw XML as text
      });

      // Save the XML response to a file
      const xmlDir = path.join(process.cwd(), 'data', 'xml');
      const xmlPath = path.join(xmlDir, `${setId}.xml`);

      // Ensure the directory exists
      if (!fs.existsSync(xmlDir)) {
        fs.mkdirSync(xmlDir, { recursive: true });
      }

      // Write the XML to file
      fs.writeFileSync(xmlPath, response.data);
      this.logger.log(`XML saved to ${xmlPath}`);

      // Parse the XML response into a JavaScript object
      const parsedXml = await this.parser.parseStringPromise(response.data);

      // The root element should be 'document' based on the XML structure
      const document = parsedXml.document;
      if (!document) {
        this.logger.error('No document found in XML');
        return null;
      }

      // Navigate through the document structure to find sections
      const components = document.component?.structuredBody?.component;
      if (!components) {
        this.logger.error('No components found in document');
        return null;
      }

      // Handle both array and single component cases
      const sections = Array.isArray(components) ? components : [components];

      // Find the section with ID S1 (INDICATIONS AND USAGE)
      const mainSection = sections.find((item) => item.section?.ID === 'S1');

      if (!mainSection) {
        this.logger.error('No indications section found');
        return null;
      }

      // Extract the paragraphs from the excerpt
      const paragraphs = mainSection.section.excerpt.highlight.text.paragraph;

      // Process the paragraphs to extract indications
      const indications = [];
      let currentIndication = '';
      let currentTitle = '';

      for (const paragraph of paragraphs) {
        if (typeof paragraph === 'string') {
          // Skip the first line which is the general description
          if (paragraph.includes('interleukin-4 receptor alpha antagonist')) {
            continue;
          }
          currentIndication += paragraph + ' ';
        } else if (paragraph.content) {
          // This is a title (underlined content)
          if (currentIndication) {
            indications.push({
              title: currentTitle,
              text: currentIndication.trim(),
            });
          }
          currentTitle = paragraph.content._;
          currentIndication = '';
        } else if (paragraph._) {
          // This is the indication text
          currentIndication += paragraph._ + ' ';
        }
      }

      // Add the last indication if exists
      if (currentIndication) {
        indications.push({
          title: currentTitle,
          text: currentIndication.trim(),
        });
      }

      return indications;
    } catch (error) {
      this.logger.error(
        `Error fetching Indications for SET ID ${setId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Maps a list of drug indications to ICD-10 codes using OpenAI's GPT API.
   * Handles synonyms, multiple indications, and unmappable cases.
   *
   * @param indications Array of drug indications with title and text
   * @returns Array of mapped indications with ICD-10 codes and descriptions
   */
  async mapIndicationsToICD10(
    indications: Indication[],
  ): Promise<MappedIndication[]> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables.');
    }

    const prompt = getPrompt(indications);

    try {
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-4-turbo',
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content:
                'You are a medical coding assistant who maps drug indications to ICD-10 codes.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const message = response.data.choices?.[0]?.message?.content;
      if (!message) {
        throw new Error('No response from OpenAI.');
      }

      // Clean up the response by removing markdown code block markers
      const cleanedMessage = message
        .replace(/```json\n?/, '') // Remove opening ```json
        .replace(/```\n?$/, '') // Remove closing ```
        .trim(); // Remove any extra whitespace

      const parsed = JSON.parse(cleanedMessage);
      return parsed;
    } catch (error) {
      console.error('Error mapping indications to ICD-10:', error.message);
      throw error;
    }
  }
}

const getPrompt = (indications: Indication[]) => {
  return `
  You are a medical coding expert.
  
  Given the following drug indications, map each to the most relevant ICD-10 code and description.
  If there is no clear ICD-10 match, set the code and description to null.
  
  Output as a JSON array in this format:
  [
    {
      "title": "...",
      "text": "...",
      "icd10_code": "...",
      "icd10_description": "..."
    },
    ...
  ]
  
  Indications:
  ${JSON.stringify(indications, null, 2)}
  `;
};
