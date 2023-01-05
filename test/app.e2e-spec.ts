import { EditBookmarkDto } from './../src/bookmark/dto/edit-bookmark.dto';
import { CreateBookmarkDto } from './../src/bookmark/dto/create-bookmark.dto';
import { EditUserDto } from './../src/user/dto/edit-user.dto';
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
    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstName: 'Amitrajit Das',
          email: 'amitrajitdas31@gmail.com',
        };
        return pactum
          .spec()
          .patch('/user/update/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email)
          .inspect();
      });
    });
  });

  describe('Bookmark', () => {
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .expectStatus(200)
          .expectBodyContains([]);
      });
    });
    describe('Get all bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .expectStatus(200);
      });
    });
    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });
    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'First Bookmark',
        link: 'https://www.youtube.com/watch?v=d6WC5n9G_sM',
      };
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });
    describe('Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        title:
          'Kubernetes Course - Full Beginners Tutorial (Containerize Your Apps!)',
        description:
          'Learn how to use Kubernetes in this complete course. Kubernetes makes it possible to containerize applications and simplifies app deployment to production.',
      };
      it('should edit bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });
    describe('Delete bookmark by id', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .expectStatus(204);
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
