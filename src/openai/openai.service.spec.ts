import { Test, TestingModule } from '@nestjs/testing';
import { OpenAiService } from './openai.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OpenAiService', () => {
  let service: OpenAiService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAiService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<OpenAiService>(OpenAiService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('mapIndicationsToICD10', () => {
    const mockApiKey = 'test-api-key';
    const mockIndications = [
      {
        title: 'Hypertension',
        text: 'Used for the treatment of high blood pressure',
      },
      {
        title: 'Type 2 Diabetes',
        text: 'Used for the treatment of type 2 diabetes mellitus',
      },
    ];

    const mockOpenAiResponse = {
      data: {
        choices: [
          {
            message: {
              content: JSON.stringify([
                {
                  title: 'Hypertension',
                  text: 'Used for the treatment of high blood pressure',
                  icd10_code: 'I10',
                  icd10_description: 'Essential (primary) hypertension',
                },
                {
                  title: 'Type 2 Diabetes',
                  text: 'Used for the treatment of type 2 diabetes mellitus',
                  icd10_code: 'E11',
                  icd10_description: 'Type 2 diabetes mellitus',
                },
              ]),
            },
          },
        ],
      },
    };

    beforeEach(() => {
      mockConfigService.get.mockReturnValue(mockApiKey);
      mockedAxios.post.mockResolvedValue(mockOpenAiResponse);
    });

    it('should successfully map indications to ICD-10 codes', async () => {
      const result = await service.mapIndicationsToICD10(mockIndications);

      expect(result).toEqual([
        {
          title: 'Hypertension',
          text: 'Used for the treatment of high blood pressure',
          icd10_code: 'I10',
          icd10_description: 'Essential (primary) hypertension',
        },
        {
          title: 'Type 2 Diabetes',
          text: 'Used for the treatment of type 2 diabetes mellitus',
          icd10_code: 'E11',
          icd10_description: 'Type 2 diabetes mellitus',
        },
      ]);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
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
              content: expect.stringMatching(
                /You are a medical coding expert\.\s+Given the following drug indications.*Indications:/s,
              ),
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${mockApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should handle unmappable indications', async () => {
      const unmappableResponse = {
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify([
                  {
                    title: 'Unknown Condition',
                    text: 'Used for an unknown condition',
                    icd10_code: null,
                    icd10_description: null,
                  },
                ]),
              },
            },
          ],
        },
      };

      mockedAxios.post.mockResolvedValue(unmappableResponse);

      const result = await service.mapIndicationsToICD10([
        {
          title: 'Unknown Condition',
          text: 'Used for an unknown condition',
        },
      ]);

      expect(result).toEqual([
        {
          title: 'Unknown Condition',
          text: 'Used for an unknown condition',
          icd10_code: null,
          icd10_description: null,
        },
      ]);
    });

    it('should throw error when API key is not set', async () => {
      mockConfigService.get.mockReturnValue(null);

      await expect(
        service.mapIndicationsToICD10(mockIndications),
      ).rejects.toThrow('OPENAI_API_KEY is not set in environment variables.');
    });

    it('should throw error when OpenAI API returns no response', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          choices: [],
        },
      });

      await expect(
        service.mapIndicationsToICD10(mockIndications),
      ).rejects.toThrow('No response from OpenAI.');
    });

    it('should handle OpenAI API errors', async () => {
      const error = new Error('API Error');
      mockedAxios.post.mockRejectedValue(error);

      await expect(
        service.mapIndicationsToICD10(mockIndications),
      ).rejects.toThrow('API Error');
    });

    it('should handle malformed JSON response', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          choices: [
            {
              message: {
                content: 'invalid json',
              },
            },
          ],
        },
      });

      await expect(
        service.mapIndicationsToICD10(mockIndications),
      ).rejects.toThrow();
    });

    it('should clean up markdown code block markers from response', async () => {
      const responseWithMarkdown = {
        data: {
          choices: [
            {
              message: {
                content:
                  '```json\n' +
                  JSON.stringify([
                    {
                      title: 'Hypertension',
                      text: 'Used for the treatment of high blood pressure',
                      icd10_code: 'I10',
                      icd10_description: 'Essential (primary) hypertension',
                    },
                    {
                      title: 'Type 2 Diabetes',
                      text: 'Used for the treatment of type 2 diabetes mellitus',
                      icd10_code: 'E11',
                      icd10_description: 'Type 2 diabetes mellitus',
                    },
                  ]) +
                  '\n```',
              },
            },
          ],
        },
      };

      mockedAxios.post.mockResolvedValue(responseWithMarkdown);

      const result = await service.mapIndicationsToICD10(mockIndications);

      expect(result).toEqual([
        {
          title: 'Hypertension',
          text: 'Used for the treatment of high blood pressure',
          icd10_code: 'I10',
          icd10_description: 'Essential (primary) hypertension',
        },
        {
          title: 'Type 2 Diabetes',
          text: 'Used for the treatment of type 2 diabetes mellitus',
          icd10_code: 'E11',
          icd10_description: 'Type 2 diabetes mellitus',
        },
      ]);
    });
  });
});
