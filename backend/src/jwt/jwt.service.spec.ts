import { Test, TestingModule } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { CONFIG_OPTIONS } from 'src/common';
import { JwtService } from './jwt.service';

const privateKey = 'privateKey'
const userId = 1

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'token 🥸'),
  verify: jest.fn(() => ({ id: userId })),
}));

describe('JwtService', () => {
  let service: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        { provide: CONFIG_OPTIONS, useValue: { privateKey } },
      ],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sign', () => {
    it('should return new JWT token', () => {
      expect(typeof service.sign(userId)).toBe('string');
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith({ id: userId }, privateKey);
    })
  })

  describe('verify', () => {
    it('should return the decoded JWT token', () => {
      const token = 'token'
      expect(service.verify(token)).toEqual({ id: userId });
      expect(jwt.verify).toHaveBeenCalledTimes(1)
      expect(jwt.verify).toHaveBeenCalledWith(token, privateKey)
    })
  })
});
