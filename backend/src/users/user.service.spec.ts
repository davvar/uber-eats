import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt';
import { MailService } from 'src/mail';
import { Repository } from 'typeorm';
import { User, Verification } from '.';
import { UsersService } from './users.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(() => 'mock-signed-token'),
  verify: jest.fn(),
});

const mockMailService = () => ({ sendVerificationEmail: jest.fn() });

type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UsersService;
  let usersRepository: MockRepository<User>;
  let verificationsRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepository() },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        { provide: JwtService, useValue: mockJwtService() },
        { provide: MailService, useValue: mockMailService() },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationsRepository = module.get(getRepositoryToken(Verification));
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountArgs = {
      email: '',
      password: '',
      role: 0,
    };

    it('should fail if user already exists', async () => {
      usersRepository.findOne.mockResolvedValue({
        email: 'foo@bar.com',
        id: 1,
      });

      const result = await service.createAccount(createAccountArgs);

      expect(result).toMatchObject({
        ok: false,
        error: 'User with that email already exists',
      });
    });

    it('should create a new user', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);
      verificationsRepository.create.mockReturnValue({
        user: createAccountArgs,
      });
      verificationsRepository.save.mockResolvedValue({ code: 'any-code' });

      const result = await service.createAccount(createAccountArgs);

      expect(usersRepository.create).toHaveBeenCalled();
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);
      expect(usersRepository.save).toHaveBeenCalled();
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

      expect(verificationsRepository.create).toHaveBeenCalled();
      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });
      expect(verificationsRepository.save).toHaveBeenCalled();
      expect(verificationsRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(mailService.sendVerificationEmail).toHaveBeenCalled();
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );

      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());

      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({ ok: false, error: "Couldn't create account" });
    });
  });

  describe('login', () => {
    const logInArgs = { email: '', password: '' };

    it('should fail if user does not exists', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await service.logIn(logInArgs);
      expect(usersRepository.findOne).toHaveBeenCalled();
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(result).toEqual({ ok: false, error: 'User not found' });
    });

    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };

      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.logIn(logInArgs);
      expect(result).toEqual({ ok: false, error: 'Wrong password' });
    });

    it('should return token if password is correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };

      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.logIn(logInArgs);
      expect(jwtService.sign).toBeCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({ ok: true, token: 'mock-signed-token' });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());

      const result = await service.logIn(logInArgs);
      expect(result).toEqual({ ok: false, error: expect.any(Error) });
    });
  });

  describe('findById', () => {
    it('should return user', async () => {
      usersRepository.findOneOrFail.mockResolvedValue(new User());
      const result = await service.findById(1);
      expect(result).toEqual({ ok: true, user: expect.any(User) });
    });

    it('should fail on exception', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findById(1);
      expect(result).toEqual({ ok: false, error: 'user not found' });
    });
  });

  describe('editProfile', () => {

    it('should change email', async () => {
      const oldUser = {
        email: 'oldEmail',
        verified: true,
      };
      const args = {id: 1, input:{ email: 'newEmail' }};
      const newVerification = { code: 'any-code' };

      const newUser = {
        verified: false,
        email: args.input.email,
      };

      usersRepository.findOne.mockResolvedValue(oldUser);
      verificationsRepository.create.mockReturnValue(newVerification);
      verificationsRepository.save.mockResolvedValue(newVerification);

      const result = await service.editProfile(args.id, args.input);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.save).toHaveBeenCalledTimes(1);

      expect(usersRepository.findOne).toHaveBeenCalledWith(args.id);
      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });
      expect(verificationsRepository.save).toHaveBeenCalledWith(
        newVerification,
      );
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        args.input.email,
        newVerification.code,
      );

      expect(result).toEqual({ ok: true });
    });

    it('should change password', async () => {
      const args = { id: 1, input: { password: 'newPassword' } };

      const oldUser = {
        password: 'oldPassword',
        verified: true,
      };

      const newUser = {
        password: 'newPassword',
        verified: true,
      }

      usersRepository.findOne.mockResolvedValue(oldUser);
      const result = await service.editProfile(args.id, args.input);
      expect(usersRepository.save).toHaveBeenCalledTimes(1)
      expect(usersRepository.save).toHaveBeenCalledWith(newUser);

      expect(result).toEqual({ ok: true })
    })

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.editProfile(1, { email: '' });
      expect(result).toEqual({ ok: false, error: 'Could not update account' });
    })
  });

  describe('verifyEmail', () => {
    it('should verify email', async () => {
      const mockedVerification = {
        user: { verified: false },
        id: 1,
      };
      verificationsRepository.findOne.mockResolvedValue(mockedVerification);
      const result = await service.verifyEmail('code');

      expect(verificationsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.delete).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);

      expect(verificationsRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(usersRepository.save).toHaveBeenCalledWith({ verified: true });
      expect(verificationsRepository.delete).toHaveBeenCalledWith(
        mockedVerification.id,
      );

      expect(result).toEqual({ ok: true });
    });

    it('should fail verification not found', async () => {
      verificationsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.verifyEmail('')
      expect(result).toEqual({ ok: false, error:'Verification not found' })
    })

    it('should fail on exception', async () => {
      verificationsRepository.findOne.mockRejectedValue(undefined);
      const result = await service.verifyEmail('')
      expect(result).toEqual({ ok: false, error:'Verification not found' })
    })
  });
});
