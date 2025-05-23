import { Test, TestingModule } from '@nestjs/testing';
import { DailyMedService } from './dailymed.service';
import { ConfigService } from '@nestjs/config';
import { DrugIndicationsService } from '../drug-indications/drug-indications.service';
import { OpenAiService } from '../openai/openai.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DailyMedService', () => {
  let service: DailyMedService;
  const mockLogger = { error: jest.fn() };
  let mockDrugIndicationsService: jest.Mocked<DrugIndicationsService>;
  let mockOpenAiService: jest.Mocked<OpenAiService>;

  beforeEach(async () => {
    mockDrugIndicationsService = {
      create: jest.fn(),
      createBulk: jest.fn(),
      removeBulk: jest.fn(),
    } as any;

    mockOpenAiService = {
      mapIndicationsToICD10: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyMedService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
        {
          provide: DrugIndicationsService,
          useValue: mockDrugIndicationsService,
        },
        {
          provide: OpenAiService,
          useValue: mockOpenAiService,
        },
      ],
    }).compile();

    service = module.get<DailyMedService>(DailyMedService);
    (service as any).logger = mockLogger;
  });

  describe('searchDrugLabel', () => {
    it('should successfully search and process drug indications', async () => {
      // Mock the initial search response
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: [{ setid: 'test-set-id' }],
        },
      });

      // Mock the XML response for getIndicationsFromSetId
      mockedAxios.get.mockResolvedValueOnce({
        data: `
          <document>
            <component>
              <structuredBody>
                <component>
                  <section>
                    <ID>S1</ID>
                    <excerpt>
                      <highlight>
                        <text>
                          <paragraph>{"interleukin-4 receptor alpha antagonist"}</paragraph>
                          <paragraph><content>Indication One</content></paragraph>
                          <paragraph>Used for treatment A.</paragraph>
                        </text>
                      </highlight>
                    </excerpt>
                  </section>
                </component>
              </structuredBody>
            </component>
          </document>
        `,
      });

      // Mock the OpenAI service response
      const mappedIndications = [
        {
          id: '12345678-1234-1234-1234-123456789012',
          title: 'Indication One',
          text: 'Used for treatment A.',
          icd10_code: 'A01',
          icd10_description: 'Test Description',
          createdAt: new Date(),
          updatedAt: new Date(),
          transformDrugName: jest.fn(),
        },
      ];
      mockOpenAiService.mapIndicationsToICD10.mockResolvedValue(
        mappedIndications,
      );

      // Mock the database operations
      mockDrugIndicationsService.removeBulk.mockResolvedValue(undefined);
      mockDrugIndicationsService.createBulk.mockResolvedValue([
        { ...mappedIndications[0], drugName: 'test-drug' },
      ]);

      const result = await service.searchDrugLabel('test-drug');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('drugName', 'test-drug');
      expect(mockDrugIndicationsService.removeBulk).toHaveBeenCalled();
      expect(mockDrugIndicationsService.createBulk).toHaveBeenCalled();
    });

    it('should return empty array when no drug is found', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: [null],
        },
      });

      const result = await service.searchDrugLabel('non-existent-drug');

      expect(result).toEqual([]);
      expect(mockDrugIndicationsService.removeBulk).not.toHaveBeenCalled();
      expect(mockDrugIndicationsService.createBulk).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('API Error');
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(service.searchDrugLabel('test-drug')).rejects.toThrow(
        'API Error',
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error fetching SET ID for drug "test-drug"'),
      );
    });

    it('should handle empty mapped indications', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: [{ setid: 'test-set-id' }],
        },
      });

      mockedAxios.get.mockResolvedValueOnce({
        data: `
          <document>
            <component>
              <structuredBody>
                <component>
                  <section>
                    <ID>S1</ID>
                    <excerpt>
                      <highlight>
                        <text>
                          <paragraph>{"interleukin-4 receptor alpha antagonist"}</paragraph>
                        </text>
                      </highlight>
                    </excerpt>
                  </section>
                </component>
              </structuredBody>
            </component>
          </document>
        `,
      });

      mockOpenAiService.mapIndicationsToICD10.mockResolvedValue([]);

      const result = await service.searchDrugLabel('test-drug');

      expect(result).toEqual([]);
      expect(mockDrugIndicationsService.removeBulk).not.toHaveBeenCalled();
      expect(mockDrugIndicationsService.createBulk).not.toHaveBeenCalled();
    });
  });

  describe('getIndicationsFromSetId', () => {
    it('should return parsed indications from valid XML', async () => {
      const xml = `
        <document>
          <component>
            <structuredBody>
              <component>
                <section>
                  <ID>S1</ID>
                  <excerpt>
                    <highlight>
                      <text>
                        <paragraph>{"interleukin-4 receptor alpha antagonist"}</paragraph>
                        <paragraph><content>Indication One</content></paragraph>
                        <paragraph>Used for treatment A.</paragraph>
                        <paragraph><content>Indication Two</content></paragraph>
                        <paragraph>Used for treatment B.</paragraph>
                      </text>
                    </highlight>
                  </excerpt>
                </section>
              </component>
            </structuredBody>
          </component>
        </document>
      `;

      mockedAxios.get.mockResolvedValue({ data: xml });

      const result = await service.getIndicationsFromSetId('sample-id');

      expect(result).toEqual([
        { title: 'Indication One', text: 'Used for treatment A.' },
        { title: 'Indication Two', text: 'Used for treatment B.' },
      ]);
    });

    it('should return null and log error if document is missing', async () => {
      const xml = `<notdocument></notdocument>`;
      mockedAxios.get.mockResolvedValue({ data: xml });

      const result = await service.getIndicationsFromSetId('sample-id');

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith('No document found in XML');
    });

    it('should return null and log error if components are missing', async () => {
      const xml = `<document><component><structuredBody></structuredBody></component></document>`;
      mockedAxios.get.mockResolvedValue({ data: xml });

      const result = await service.getIndicationsFromSetId('sample-id');

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'No components found in document',
      );
    });

    it('should return null and log error if S1 section is missing', async () => {
      const xml = `
        <document>
          <component>
            <structuredBody>
              <component>
                <section>
                  <ID>S2</ID>
                </section>
              </component>
            </structuredBody>
          </component>
        </document>
      `;
      mockedAxios.get.mockResolvedValue({ data: xml });

      const result = await service.getIndicationsFromSetId('sample-id');

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'No indications section found',
      );
    });

    it('should log and rethrow if axios throws', async () => {
      const error = new Error('Network Error');
      mockedAxios.get.mockRejectedValue(error);

      await expect(
        service.getIndicationsFromSetId('sample-id'),
      ).rejects.toThrow('Network Error');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error fetching Indications for SET ID sample-id: Network Error',
      );
    });
  });
});
