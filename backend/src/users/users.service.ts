import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreOutput } from 'src/common';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  LogInInput,
  LogInOutput,
  UserProfileOutput
} from './dtos';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CoreOutput> {
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        return { ok: false, error: 'User with that email already exists' };
      }

      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );

      const { code } = await this.verifications.save(
        this.verifications.create({ user }),
      );
      await this.mailService.sendVerificationEmail(user.email, code);

      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Couldn't create account" };
    }
  }

  async logIn({ email, password }: LogInInput): Promise<LogInOutput> {
    try {
      const user = await this.users.findOne(
        { email },
        { select: ['password', 'id'] },
      );
      if (!user) {
        return { ok: false, error: 'User not found' };
      }

      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return { ok: false, error: 'Wrong password' };
      }

      const token = this.jwtService.sign(user.id);

      return { ok: true, token };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ id });

      return { ok: true, user };
    } catch (error) {
      return { ok: false, error: 'user not found' };
    }
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne(userId);

      if (email) {
        if (user.email === email) {
          return { ok: true };
        }

        const emailAlreadyTaken = await this.users.findOne({ email });
        if (emailAlreadyTaken) {
          throw new Error('Email already taken.');
        }

        user.verified = false;
        user.email = email;

        await this.verifications.delete({ user: { id: user.id } });
        const { code } = await this.verifications.save(
          this.verifications.create({ user }),
        );
        await this.mailService.sendVerificationEmail(user.email, code);
      }

      if (password) user.password = password;

      await this.users.save(user);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: `Could not update account. ${error.message}` };
    }
  }

  async verifyEmail(code: string): Promise<CoreOutput> {
    try {
      const verification = await this.verifications.findOne(
        { code },
        { relations: ['user'] },
      );

      if (!verification) {
        throw new Error();
      }

      verification.user.verified = true;
      await this.users.save(verification.user);
      await this.verifications.delete(verification.id);

      return { ok: true };
    } catch {
      return { ok: false, error: 'Verification not found' };
    }
  }
}
