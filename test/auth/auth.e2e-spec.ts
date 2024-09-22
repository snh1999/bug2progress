import { HttpStatus, INestApplication } from '@nestjs/common';
import { bootstrapTestServer } from '../utils/bootstrap';
import { THttpServer } from '../utils/types';
import request from 'supertest';
import { getRegisterDto } from './auth.test-data';
import { getLoginExpectedStructure } from './auth.expected-structure';
import { PrismaService } from '@/prisma/prisma.service';
import { RegisterDto } from '@/auth/dto';
import { faker } from '@faker-js/faker/.';

describe('App e2e', () => {
  let app: INestApplication;
  let httpServer: THttpServer;
  let dbService: PrismaService;

  beforeAll(async () => {
    const { appInstance, httpServerInstance, dbServiceInstance } =
      await bootstrapTestServer();
    app = appInstance;
    httpServer = httpServerInstance;
    dbService = dbServiceInstance;
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
  });
});
