import { HttpStatus, INestApplication } from '@nestjs/common';
import { bootstrapTestServer } from '../utils/bootstrap';
import { THttpServer } from '../utils/types';
import request from 'supertest';
import { getRegisterDto } from './auth.test-data';
import { getLoginExpectedStructure } from './auth.expected-structure';
import { PrismaService } from '@/prisma/prisma.service';
import { RegisterDto } from '@/auth/dto';
import { faker } from '@faker-js/faker/.';
import { EmailService } from '@/auth/email.service';

describe('Auth e2e', () => {
  let app: INestApplication;
  let httpServer: THttpServer;
  let dbService: PrismaService;
  let mockEmailService: jest.Mocked<EmailService>;

  beforeAll(async () => {
    const { appInstance, httpServerInstance, dbServiceInstance } =
      await bootstrapTestServer();
    app = appInstance;
    httpServer = httpServerInstance;
    dbService = dbServiceInstance;
    appInstance.get<EmailService>(EmailService).sendEmail = jest
      .fn()
      .mockResolvedValue('');
    mockEmailService = app.get(EmailService);
  });

  afterAll(async () => {
    await httpServer.close();
    await app.close();
  });

  beforeEach(async () => {
    await dbService.clearDB();
  });

  describe('Authentication', () => {
    describe('POST /register', () => {
      it('should return with CREATED(201) with new user', async () => {
        const registerDto = getRegisterDto();
        await request(httpServer)
          .post('/register')
          .send(registerDto)
          .expect(HttpStatus.CREATED)
          .expect(({ body }) =>
            expect(body.data).toEqual(getLoginExpectedStructure()),
          );
      });

      it('should return with BAD_REQUEST(400) when email is empty', async () => {
        const dto = getRegisterDto();
        dto.email = '';

        await request(httpServer)
          .post('/register')
          .send(dto)
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should return with CONFLICT(409) when user tries to register with duplicate email', async () => {
        const registerDto = getRegisterDto();
        await request(httpServer)
          .post('/register')
          .send(registerDto)
          .expect(HttpStatus.CREATED);

        registerDto.username = registerDto.username + '1';

        await request(httpServer)
          .post('/register')
          .send(registerDto)
          .expect(HttpStatus.CONFLICT);
      });

      it('should return with CONFLICT(409) when user tries to register with duplicate username', async () => {
        const registerDto = getRegisterDto();
        await request(httpServer)
          .post('/register')
          .send(registerDto)
          .expect(HttpStatus.CREATED);

        registerDto.email = '1' + registerDto.email;

        await request(httpServer)
          .post('/register')
          .send(registerDto)
          .expect(HttpStatus.CONFLICT);
      });

      it('should return BAD_REQUEST(400) when requested without register dto ', async () => {
        await request(httpServer)
          .post('/register')
          .expect(HttpStatus.BAD_REQUEST);
      });
    });

    describe('POST /login', () => {
      let registerDto: RegisterDto;

      beforeEach(async () => {
        registerDto = getRegisterDto();
        await request(httpServer)
          .post('/register')
          .send(registerDto)
          .expect(HttpStatus.CREATED)
          .expect(({ body }) =>
            expect(body.data).toEqual(getLoginExpectedStructure()),
          );
      });
      it('should return BAD_REQUEST(400) when requested without login dto ', async () => {
        await request(httpServer).post('/login').expect(HttpStatus.BAD_REQUEST);
      });

      it('should return with CREATED(201) when requested with  correct email and password', async () => {
        await request(httpServer)
          .post('/login')
          .send({ email: registerDto.email, password: registerDto.password })
          .expect(HttpStatus.CREATED)
          .expect(({ body }) =>
            expect(body.data).toEqual(getLoginExpectedStructure()),
          );
      });

      it('should return with FORBIDDEN(403) when requested with  incorrect password', async () => {
        await request(httpServer)
          .post('/login')
          .send({
            email: registerDto.email,
            password: faker.internet.password(),
          })
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return with NOT_FOUND(404) when requested with  incorrect email', async () => {
        await request(httpServer)
          .post('/login')
          .send({
            email: faker.internet.email(),
            password: registerDto.password,
          })
          .expect(HttpStatus.NOT_FOUND);
      });
      it('should return with NOT_FOUND(404) when requested with empty email', async () => {
        await request(httpServer)
          .post('/login')
          .send({
            password: registerDto.password,
          })
          .expect(HttpStatus.BAD_REQUEST);
      });
    });

    describe('POST /forgot-password', () => {
      let registerDto: RegisterDto;

      beforeEach(async () => {
        registerDto = getRegisterDto();
        await request(httpServer)
          .post('/register')
          .send(registerDto)
          .expect(HttpStatus.CREATED)
          .expect(({ body }) =>
            expect(body.data).toEqual(getLoginExpectedStructure()),
          );
      });

      it('should return with NOT_FOUND(404) when invalid email is provided', async () => {
        const forgotPasswordDto = { email: faker.internet.email() };

        await request(httpServer)
          .post('/forgot-password')
          .send(forgotPasswordDto)
          .expect(HttpStatus.NOT_FOUND);

        expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(0);
      });

      it('should return with CREATED(200) and success message when valid email is provided', async () => {
        const forgotPasswordDto = { email: registerDto.email };

        await request(httpServer)
          .post('/forgot-password')
          .send(forgotPasswordDto)
          .expect(HttpStatus.CREATED)
          .expect(({ body }) =>
            expect(body.data).toEqual(
              'Email sent Successfully, Please check your email',
            ),
          );
        expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(1);
      });
    });

    describe('POST /reset-password/:token', () => {
      it('should return NOT_FOUND(404) if no token is provided', () =>
        request(httpServer)
          .post('reset-password')
          .expect(HttpStatus.NOT_FOUND));

      it('should return NOT_FOUND(404) if an invalid token is provided', () =>
        request(httpServer)
          .post('/reset-password/invalid_token')
          .send(`{password=${faker.internet.password()}}`)
          .expect(HttpStatus.NOT_FOUND));

      it('should return BAD_REQUEST(400) if no password is provided', () =>
        request(httpServer)
          .post('/auth/reset-password/invalid_token')
          .expect(HttpStatus.BAD_REQUEST));

      // it("fails with BAD_REQUEST(400) if the provided token is EXPIRED", async () => {
      //   const verificationRequest = new VerificationRequestFactory(dbService).makeOne({
      //     status: EVerificationRequestStatus.EXPIRED,
      //     type: EVerificationRequestType.RESET_PASSWORD,
      //   });

      //   await dbService.persistAndFlush([verificationRequest]);

      //   await request(httpServer)
      //     .post(`/auth/reset-password/${verificationRequest.token}`)
      //     .send(`password=${faker.internet.password()}`)
      //     .expect(HttpStatus.BAD_REQUEST);
      // });

      // it("fails with BAD_REQUEST(400) if the provided token is ACTIVE but its past its expiry date", async () => {
      //   const verificationRequest = new VerificationRequestFactory(dbService).makeOne({
      //     expiresAt: dayjs().subtract(2, "day").toDate(),
      //     type: EVerificationRequestType.RESET_PASSWORD,
      //   });

      //   await dbService.persistAndFlush(verificationRequest);

      //   await request(httpServer)
      //     .post(`/auth/reset-password/${verificationRequest.token}`)
      //     .expect(HttpStatus.BAD_REQUEST)
      //     .send(`password=${faker.internet.password()}`);

      //   const updatedVerificationRequest = await dbService.findOne(
      //     VerificationRequest,
      //     { id: verificationRequest.id, token: verificationRequest.token },
      //     { disableIdentityMap: true },
      //   );

      //   expect(updatedVerificationRequest?.status).toEqual(EVerificationRequestStatus.EXPIRED);
      // });

      // it("should return with CREATED(201) if an ACTIVE token is provided", async () => {
      //   const email = faker.internet.email();
      //   const password = "password";
      //   const user = new UserFactory(dbService).makeOne({
      //     email,
      //     password,
      //     userProfile: {
      //       role: {
      //         name: EUserRole.LANDLORD,
      //       },
      //     },
      //   });

      //   const verificationRequest = new VerificationRequestFactory(dbService).makeOne({
      //     user,
      //     status: EVerificationRequestStatus.ACTIVE,
      //     type: EVerificationRequestType.RESET_PASSWORD,
      //   });

      //   user.verificationRequests.add(verificationRequest);
      //   await dbService.persistAndFlush([verificationRequest, user]);

      //   const newPassword = "new_password";

      //   await request(httpServer)
      //     .post(`/auth/reset-password/${verificationRequest.token}`)
      //     .send(`password=${newPassword}`)
      //     .expect(HttpStatus.CREATED)
      //     .expect(({ body }) => {
      //       expect(body.data?.id).toEqual(user.id);
      //     });

      //   const updatedVerificationRequest = await dbService.findOne(
      //     VerificationRequest,
      //     { id: verificationRequest.id, token: verificationRequest.token },
      //     { disableIdentityMap: true },
      //   );

      //   expect(updatedVerificationRequest?.status).toEqual(EVerificationRequestStatus.EXPIRED);
      // });

      // it("should return with CREATED(201) if logged in with new password and UNAUTHORIZED(401) for old password", async () => {
      //   const email = faker.internet.email();
      //   const password = "password";
      //   const user = new UserFactory(dbService).makeOne({
      //     email,
      //     password,
      //     userProfile: {
      //       role: {
      //         name: EUserRole.LANDLORD,
      //       },
      //     },
      //   });

      //   const verificationRequest = new VerificationRequestFactory(dbService).makeOne({
      //     user,
      //     status: EVerificationRequestStatus.ACTIVE,
      //     type: EVerificationRequestType.RESET_PASSWORD,
      //   });

      //   user.verificationRequests.add(verificationRequest);
      //   await dbService.persistAndFlush([verificationRequest, user]);

      //   const newPassword = "new_password";

      //   await request(httpServer)
      //     .post(`/auth/reset-password/${verificationRequest.token}`)
      //     .send(`password=${newPassword}`);

      //   await request(httpServer)
      //     .post("/auth/login")
      //     .send(`email=${email}&password=${password}`)
      //     .expect(HttpStatus.UNAUTHORIZED);

      //   await request(httpServer)
      //     .post("/auth/login")
      //     .send(`email=${email}&password=${newPassword}`)
      //     .expect(HttpStatus.CREATED);
      // });
    });

    describe('POST /change-password', () => {
      let registerDto: RegisterDto;

      beforeEach(async () => {
        registerDto = getRegisterDto();
        await request(httpServer)
          .post('/register')
          .send(registerDto)
          .expect(HttpStatus.CREATED)
          .expect(({ body }) =>
            expect(body.data).toEqual(getLoginExpectedStructure()),
          );
      });
      it('should return BAD_REQUEST(400) when requested without any access token', async () => {
        await request(httpServer)
          .post('/change-password')
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return with CREATED(201) when requested with  correct email and password', async () => {
        await request(httpServer)
          .post('/login')
          .send({ email: registerDto.email, password: registerDto.password })
          .expect(HttpStatus.CREATED)
          .expect(({ body }) =>
            expect(body.data).toEqual(getLoginExpectedStructure()),
          );
      });

      it('should return with FORBIDDEN(403) when requested with  incorrect password', async () => {
        await request(httpServer)
          .post('/login')
          .send({
            email: registerDto.email,
            password: faker.internet.password(),
          })
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return with NOT_FOUND(404) when requested with  incorrect email', async () => {
        await request(httpServer)
          .post('/login')
          .send({
            email: faker.internet.email(),
            password: registerDto.password,
          })
          .expect(HttpStatus.NOT_FOUND);
      });
      it('should return with NOT_FOUND(404) when requested with empty email', async () => {
        await request(httpServer)
          .post('/login')
          .send({
            password: registerDto.password,
          })
          .expect(HttpStatus.BAD_REQUEST);
      });
    });
  });
});
