import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { inspect } from 'util';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';
describe('App e2e test', () => {
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
    await app.listen(3000);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3000');
  });
  afterAll(async () => {
    await app.close();
  });
  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'aa@gmail.com',
      password: '123456',
    };
    describe('Signup', () => {
      it('should signup a user', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withJson(dto)
          .expectStatus(201);
      });
      it('should not signup a user with empty email', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withJson({ ...dto, email: '' })
          .expectStatus(400);
      });
      it('should not signup a user with empty password', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withJson({ ...dto, password: '' })
          .expectStatus(400);
      });
      it('should not signup a user with empty body', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withJson({})
          .expectStatus(400);
      });
    });
    describe('Signin', () => {
      it('should signin a user', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withJson(dto)
          .inspect()
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
      it('should not signin a user with empty email', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withJson({ ...dto, email: '' })
          .expectStatus(400);
      });
      it('should not signin a user with empty password', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withJson({ ...dto, password: '' })
          .expectStatus(400);
      });
      it('should not signin a user with empty body', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withJson({})
          .expectStatus(400);
      });
    });
    describe('User', () => {
      describe('Get me', () => {
        it('should get current user', () => {
          return pactum
            .spec()
            .get('/users/me')
            .withHeaders({ Authorization: 'Bearer $S{userAt}' })
            .expectStatus(200);
        });
      });
      describe('Edit user', () => {
        const dto: EditUserDto = {
          firstName: 'bbb',
          email: 'vvv@aaa.com',
        };
        it('should edit user', () => {
          return pactum
            .spec()
            .patch('/users')
            .withHeaders({
              Authorization: 'Bearer $S{userAt}',
            })
            .withJson(dto)
            .expectBodyContains(dto.email)
            .expectBodyContains(dto.firstName)
            .expectStatus(200);
        });
      });
    });
    describe('Bookmark', () => {
      describe('Get empty bookmark', () => {
        it('should get bookmark', () => {
          return pactum
            .spec()
            .get('/bookmarks')
            .withHeaders({ Authorization: 'Bearer $S{userAt}' })
            .expectBody([])
            .expectStatus(200);
        });
      });
      describe('Create bookmark', () => {
        const dto: CreateBookmarkDto = {
          title: 'first',
          link: 'http://aaa.com',
        };
        it('should create bookmark', () => {
          return pactum
            .spec()
            .post('/bookmarks')
            .withHeaders({ Authorization: 'Bearer $S{userAt}' })
            .withBody(dto)
            .expectStatus(201)
            .stores('bookmarkId', 'id');
        });
      });
      describe('Get bookmarks', () => {
        it('should get bookmark', () => {
          return pactum
            .spec()
            .get('/bookmarks')
            .withHeaders({ Authorization: 'Bearer $S{userAt}' })
            .expectStatus(200)
            .expectJsonLength(1);
        });
      });
      describe('Get bookmark by id', () => {
        it('should get bookmark', () => {
          return pactum
            .spec()
            .get('/bookmarks/{id}')
            .withPathParams({ id: '$S{bookmarkId}' })
            .withHeaders({ Authorization: 'Bearer $S{userAt}' })
            .expectBodyContains('$S{bookmarkId}')
            .expectStatus(200);
        });
      });
      describe('Edit bookmark', () => {
        const dto: EditBookmarkDto = {
          title: 'second',
        };
        it('should get edited bookmark', () => {
          return pactum
            .spec()
            .patch('/bookmarks/{id}')
            .withPathParams({ id: '$S{bookmarkId}' })
            .withHeaders({ Authorization: 'Bearer $S{userAt}' })
            .withBody(dto)
            .expectBodyContains(dto.title)
            .expectStatus(200);
        });
      });
      describe('Delete bookmark', () => {
        it('should delete bookmark', () => {
          return pactum
            .spec()
            .delete('/bookmarks/{id}')
            .withPathParams({ id: '$S{bookmarkId}' })
            .withHeaders({ Authorization: 'Bearer $S{userAt}' })
            .expectStatus(204);
        });
      });
      describe('Get empty bookmark', () => {
        it('should get empty bookmark', () => {
          return pactum
            .spec()
            .get('/bookmarks')
            .withHeaders({ Authorization: 'Bearer $S{userAt}' })
            .expectStatus(200)
            .expectJsonLength(0);
        });
      });
    });
  });
});
