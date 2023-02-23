import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private bookmark: BookmarkService) {}
  @Post()
  createBookmark(
    @GetUser('id') userId: number,
    @Body() dto: CreateBookmarkDto,
  ) {
    return this.bookmark.createBookmark(userId, dto);
  }

  @Get()
  getBookmarks(@GetUser('id') userId: number) {
    return this.bookmark.getBookmarks(userId);
  }
  @Get(':id')
  getBookmaekById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmaekId: number,
  ) {
    return this.bookmark.getBookmarkById(userId, bookmaekId);
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmaekId: number,
  ) {
    return this.bookmark.deleteBookmarkById(userId, bookmaekId);
  }

  @Patch(':id')
  editBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmaekId: number,
    @Body() dto: EditBookmarkDto,
  ) {
    return this.bookmark.editBookmarkById(userId, bookmaekId, dto);
  }
}
