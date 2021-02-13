import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, Verification } from 'src/users';
import * as request from 'supertest';
import { getConnection, Repository } from 'typeorm';
import { AppModule } from '../src/app.module';

const GRAPHQL_ENDPOINT = '/graphql';
const EMAIL = 'new5@gmail.com';
const PASSWORD = 'PASSWORD';

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let verificationsRepository: Repository<Verification>;
  let jwtToken: string;

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string) =>
    baseTest().set('X-JWT', jwtToken).send({ query });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    verificationsRepository = module.get<Repository<Verification>>(
      getRepositoryToken(Verification),
    );
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase(); // delete database
    app.close();
  });

  describe('createAccount', () => {
    const query = `
      mutation {
        createAccount(input: {
          email: "${EMAIL}",
          password: "${PASSWORD}",
          role: CLIENT
        }) {
          ok
          error
        }
      }
    `;

    it('should create account', () => {
      return publicTest(query)
        .expect(200)
        .expect(res => {
          expect(res.body.data.createAccount.ok).toEqual(true);
          expect(res.body.data.createAccount.error).toEqual(null);
        });
    });

    it('should fail if account already exists', () => {
      return publicTest(query)
        .expect(200)
        .expect(res => {
          expect(res.body.data.createAccount.ok).toEqual(false);
          expect(res.body.data.createAccount.error).toEqual(expect.any(String));
        });
    });
  });

  describe('logIn', () => {
    const getQuery = (password = PASSWORD) => `
        mutation {
          logIn(input: {
            email: "${EMAIL}",
            password: "${password}",
          }) {
            error
            ok
            token
          }
        }
      `;

    it('should login with correct credentials', () => {
      return publicTest(getQuery())
        .expect(200)
        .expect(res => {
          const { logIn } = res.body.data;

          expect(logIn.ok).toEqual(true);
          expect(logIn.error).toEqual(null);
          expect(logIn.token).toEqual(expect.any(String));
          jwtToken = logIn.token;
        });
    });

    it('should not be able to login with wrong credentials', () => {
      return publicTest(getQuery('121212'))
        .expect(200)
        .expect(res => {
          const { logIn } = res.body.data;

          expect(logIn.ok).toEqual(false);
          expect(logIn.error).toEqual('Wrong password');
          expect(logIn.token).toEqual(null);
        });
    });
  });

  describe('userProfile', () => {
    let userId: number;
    beforeAll(async () => {
      const [user] = await usersRepository.find();
      userId = user.id;
    });

    it("should see user's profile", () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: ` {
              userProfile(userId: ${userId}){
                ok
                error
                user {
                  id
                }
              }
            }
          `,
        })
        .expect(200)
        .expect(res => {
          const {
            ok,
            error,
            user: { id },
          } = res.body.data.userProfile;

          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(id).toBe(userId);
        });
    });

    it('should not find user', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: ` {
              userProfile(userId: 1111){
                ok
                error
                user {
                  id
                }
              }
            }
          `,
        })
        .expect(200)
        .expect(res => {
          const { ok, error } = res.body.data.userProfile;

          expect(ok).toBe(false);
          expect(error).toBe('user not found');
        });
    });
  });

  describe('me', () => {
    it('should find my profile', () => {
      return privateTest('{ me { email } }')
        .expect(200)
        .expect(res => {
          expect(res.body.data.me.email).toBe(EMAIL);
        });
    });

    it('should not allow logged out users', () => {
      return publicTest('{ me { email } }')
        .expect(200)
        .expect(res => {
          expect(res.body.errors[0].message).toBe('Forbidden resource');
        });
    });
  });

  describe('editProfile', () => {
    it('should change email', () => {
      return privateTest(`
          mutation {
            editProfile(input: { email: "newemail@mail.com" }) {
              error
              ok
            }
          }`)
        .expect(200)
        .expect(res => {
          const { ok, error } = res.body.data.editProfile;

          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
  });

  describe('verifyEmail', () => {
    let verificationCode: string;
    beforeAll(async () => {
      const [verification] = await verificationsRepository.find();
      verificationCode = verification.code;
    });

    it('should verify email', () => {
      return publicTest(
        `mutation {
            verifyEmail(input: {code: "${verificationCode}"}){
              ok
              error
            }
          }`,
      )
        .expect(200)
        .expect(res => {
          const { ok, error } = res.body.data.verifyEmail;

          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });

    it('should fail in wrong verification code', () => {
      return publicTest(
        `mutation {
            verifyEmail(input: {code: "xxxx"}){
              ok
              error
            }
          }`,
      )
        .expect(200)
        .expect(res => {
          const { ok, error } = res.body.data.verifyEmail;

          expect(ok).toBe(false);
          expect(error).toBe('Verification not found');
        });
    });
  });
});
