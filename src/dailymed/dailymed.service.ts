import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { DrugIndicationsService } from '../drug-indications/drug-indications.service';
import * as xml2js from 'xml2js';
import { OpenAiService } from '../openai/openai.service';
import { CreateDrugIndicationDto } from 'src/drug-indications/dto/create-drug-indication.dto';
import { DrugIndication } from 'src/drug-indications/entities/drug-indication.entity';
import { ILike } from 'typeorm';
import { RedisService } from '../redis/redis.service';

const DAILYMED_API_URL = 'https://dailymed.nlm.nih.gov/dailymed/services/v2';

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
  private readonly CACHE_PREFIX = 'dailymed:';
  private readonly CACHE_TTL = 86400; // 24 hours in seconds

  constructor(
    private readonly configService: ConfigService,
    private readonly drugIndicationsService: DrugIndicationsService,
    private readonly openAiService: OpenAiService,
    private readonly redisService: RedisService,
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

  private getCacheKey(drugName: string): string {
    return `${this.CACHE_PREFIX}${drugName.toLowerCase()}`;
  }

  /**
   * Search for a drug name and return the first matching SET ID
   * @param name Drug name to search for
   * @returns First matching SET ID as a string (or empty array if not found)
   */
  async searchDrugLabel(name: string): Promise<DrugIndication[]> {
    try {
      const cacheKey = this.getCacheKey(name);
      const cached = await this.redisService.get<DrugIndication[]>(cacheKey);

      if (cached) {
        this.logger.log(`Cache hit for drug: ${name}`);
        return cached;
      }

      const endpoint = `${this.baseUrl}/spls.json`;
      const response = await axios.get(endpoint, {
        params: {
          drug_name: name,
          pagesize: 1,
          page: 1,
        },
      });

      const firstMatch = response.data?.data?.[0];

      if (!firstMatch || !firstMatch.setid) {
        return [];
      }

      const indications = await this.getIndicationsFromSetId(firstMatch.setid);
      const mappedIndications =
        await this.openAiService.mapIndicationsToICD10(indications);

      if (mappedIndications.length > 0) {
        const indicationsWithDrugName = mappedIndications.map((indication) => ({
          ...indication,
          drugName: name,
        }));

        await this.drugIndicationsService.removeBulk({
          where: { drugName: ILike(name.toLowerCase()) },
        });

        const savedIndications = await this.drugIndicationsService.createBulk({
          indications: indicationsWithDrugName as CreateDrugIndicationDto[],
        });

        await this.redisService.set(cacheKey, savedIndications, this.CACHE_TTL);
        return savedIndications;
      }

      return [];
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
          currentTitle =
            typeof paragraph.content === 'string'
              ? paragraph.content
              : paragraph.content._;
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
}
