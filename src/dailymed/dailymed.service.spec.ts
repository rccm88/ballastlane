import { Test, TestingModule } from '@nestjs/testing';
import { DailyMedService } from './dailymed.service';
import { ConfigService } from '@nestjs/config';
import { DrugIndicationsService } from '../drug-indications/drug-indications.service';
import { OpenAiService } from '../openai/openai.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DailyMedService - getIndicationsFromSetId', () => {
  let service: DailyMedService;
  const mockLogger = { error: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyMedService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
        {
          provide: DrugIndicationsService,
          useValue: { create: jest.fn() },
        },
        {
          provide: OpenAiService,
          useValue: { mapIndicationsToICD10: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<DailyMedService>(DailyMedService);
    (service as any).logger = mockLogger;
  });

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

    await expect(service.getIndicationsFromSetId('sample-id')).rejects.toThrow(
      'Network Error',
    );
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error fetching Indications for SET ID sample-id: Network Error',
    );
  });
});
