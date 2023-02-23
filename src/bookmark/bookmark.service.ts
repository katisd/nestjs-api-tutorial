import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}
  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    const bookmark = await this.prisma.bookmark.create({
      data: {
        ...dto,
        userId,
      },
    });
    return bookmark;
  }

  getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    });
  }

  getBookmarkById(userId: number, bookmarkId: number) {
    return this.prisma.bookmark.findFirst({
      where: {
        userId,
        id: bookmarkId,
      },
    });
  }

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ) {
    // get bookmark by Id
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });
    // check owner of user
    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    // edit bookmark
    return this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    // get bookmark by Id
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });
    // check owner of user
    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    // delete bookmark
    await this.prisma.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });
  }
}
