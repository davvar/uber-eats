import { Test, TestingModule } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            from: 'test-from',
            user: 'test-user',
            pass: 'test-pass',
            port: 'test-port',
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

});
