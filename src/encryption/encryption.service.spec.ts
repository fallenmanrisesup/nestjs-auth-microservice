import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  let service: EncryptionService;
  const testPassword = 'testPassword';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [EncryptionService],
    }).compile();

    service = module.get<EncryptionService>(EncryptionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hash password each time in the same way', async () => {
    const hashed = await service.hash(testPassword);

    expect(testPassword).not.toEqual(hashed);
  });

  it('should correctly compare hashed and pure password', async () => {
    const hashed = await service.hash(testPassword);

    const isPasswordCorrect = await service.compare(testPassword, hashed);

    expect(isPasswordCorrect).toBeTruthy();
  });

  it('should not match the hashed password', async () => {
    const wrongPassword = 'wrongPassword';

    const hashed = await service.hash(testPassword);

    const isPasswordCorrect = await service.compare(wrongPassword, hashed);

    expect(isPasswordCorrect).toBeFalsy();
  });
});
