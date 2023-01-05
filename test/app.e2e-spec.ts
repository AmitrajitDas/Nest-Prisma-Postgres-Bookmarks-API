import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { AuthDto } from './../src/auth/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });
  it.todo('should pass');

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'abcd@gmail.com',
      password: '1234',
    };
    describe('Signup', () => {
      it('should throw if body is empty', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400).inspect();
      });
      it('should throw if email is empty', () => {
        const { password } = dto;
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password })
          .expectStatus(400)
          .inspect();
      });
      it('should throw if password is empty', () => {
        const { email } = dto;
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email })
          .expectStatus(400)
          .inspect();
      });
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
          .inspect();
      });
    });
    describe('Logain', () => {
      it('should throw if body is empty', () => {
        return pactum.spec().post('/auth/login').expectStatus(400).inspect();
      });
      it('should throw if email is empty', () => {
        const { password } = dto;
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ password })
          .expectStatus(400)
          .inspect();
      });
      it('should throw if password is empty', () => {
        const { email } = dto;
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ email })
          .expectStatus(400)
          .inspect();
      });
      it('should login', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAT', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get current user', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/user/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .expectStatus(200)
          .inspect();
      });
    });
    describe('Edit user', () => {});
  });

  describe('Bookmark', () => {
    describe('Get all bookmarks', () => {});
    describe('Get bookmark by id', () => {});
    describe('Create bookmark', () => {});
    describe('Edit bookmark by id', () => {});
    describe('Delete bookmark by id', () => {});
  });
});
