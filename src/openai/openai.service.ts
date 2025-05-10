import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

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
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);

  constructor(private readonly configService: ConfigService) {}

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
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables.');
    }

    const prompt = this.getPrompt(indications);

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
            Authorization: `Bearer ${apiKey}`,
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
      this.logger.error('Error mapping indications to ICD-10:', error.message);
      throw error;
    }
  }

  private getPrompt(indications: Indication[]): string {
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
  }
}
