import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AuthDto, RegisterDto } from '../src/auth/dto';

describe('App e2e', () => {
  let app: INestApplication;
  beforeAll(async () => {
    // compiles module for integration testing
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init(); // initiate nestjs context
    await app.listen(3000);
    pactum.request.setBaseUrl('http://localhost:3000');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    // ################################ REGISTRATION ###############################
    describe('register', () => {
      // =============================  valid case #1
      it('should register', () => {
        const dto: RegisterDto = {
          email: 'jrfjsdalkjf@gmail.com',
          password: 'al',
          name: 'mamjadro',
          username: 'fsadjhfsd',
          photo: 'sdfsd',
          country: ' ',
        };
        return pactum.spec().post('/register').withBody(dto).expectStatus(201);
        // .inspect();
      });
      // =============================  valid case #2
      it('should register', () => {
        const dto: RegisterDto = {
          email: 'jrfjsdjf@gmail.com',
          password: 'al',
          name: 'mamjadro',
          username: 'fshfsd',
          photo: 'sdfsd',
          country: ' ',
        };
        return pactum.spec().post('/register').withBody(dto).expectStatus(201);
      });
      // =============================  invalid case #1 (empty email)
      it('email empty, invalid registration #1', () => {
        const dto: RegisterDto = {
          email: '',
          password: 'al',
          name: 'mamjadro',
          username: 'fsadjs',
          photo: 'sdfsd',
          country: ' ',
        };
        return pactum.spec().post('/register').withBody(dto).expectStatus(400);
      });
      // =============================  invalid case #2 (duplicate email-username)
      it('duplicate email-username, invalid registration #2', () => {
        const dto: RegisterDto = {
          email: 'jrfjsdjf@gmail.com',
          password: 'al',
          name: 'mamjadro',
          username: 'fsadjhfsd',
          photo: 'sdfsd',
          country: ' ',
        };
        return pactum.spec().post('/register').withBody(dto).expectStatus(403);
      });
      // =============================  invalid case #3 (duplicate email)
      it('duplicate email, invalid registration #3', () => {
        const dto: RegisterDto = {
          email: 'jrfjsdjf@gmail.com',
          password: 'al',
          name: 'mamjadro',
          username: 'dhfsd',
          photo: 'sdfsd',
          country: ' ',
        };
        return pactum.spec().post('/register').withBody(dto).expectStatus(403);
      });
      // =============================  invalid case #4 (duplicate username)
      it('duplicate username, invalid registration #4', () => {
        const dto: RegisterDto = {
          email: 'jdjf@gmail.com',
          password: 'al',
          name: 'mamjadro',
          username: 'fshfsd',
          photo: 'sdfsd',
          country: ' ',
        };
        return pactum.spec().post('/register').withBody(dto).expectStatus(403);
      });
      // =============================  invalid case #5 (no body)
      it('no body, invalid registration #5', () => {
        return pactum.spec().post('/register').expectStatus(400);
      });
    });
    describe('login', () => {
      it('should login', () => {
        const dto: AuthDto = {
          email: 'jrfjsdalkjf@gmail.com',
          password: 'al',
        };
        return pactum
          .spec()
          .post('/login')
          .withBody(dto)
          .expectStatus(201)
          .stores('user_auth', 'token');
        // .inspect();
      });
      // =============================  invalid case #1 (no body)
      it('no body, invalid login #5', () => {
        return pactum.spec().post('/register').expectStatus(400);
      });
      // =============================  invalid case #2 (wrong password)
      it('wrong password, failed login', () => {
        const dto: AuthDto = {
          email: 'jrfjsdalkjf@gmail.com',
          password: 'sfsdfasdfd',
        };
        return pactum.spec().post('/login').withBody(dto).expectStatus(403);
      });
      // =============================  invalid case #2 (wrong email)
      it('wrong email, failed login', () => {
        const dto: AuthDto = {
          email: 'jrfjddddsdalkjf@gmail.com',
          password: 'sfsdfasdfd',
        };
        return pactum.spec().post('/login').withBody(dto).expectStatus(403);
      });
      // =============================  invalid case #2 (wrong password)
      it('no password, failed login', () => {
        const dto = {
          email: 'jrfjddddsdalkjf@gmail.com',
        };
        return pactum.spec().post('/login').withBody(dto).expectStatus(400);
      });
    });
  });
  describe('User ', () => {
    it('no header, should fail as unauthorized', () => {
      return pactum.spec().get('/user/me').expectStatus(401);
    });
    it('header, should fail', () => {
      return pactum
        .spec()
        .get('/user/me')
        .withHeaders({
          Authorization: 'Bearer $S{user_auth}',
        })
        .expectStatus(200);
    });
  });
});
