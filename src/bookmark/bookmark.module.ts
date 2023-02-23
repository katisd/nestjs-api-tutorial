import { Module } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { BookmarkController } from './bookmark.controller';

@Module({
  providers: [BookmarkService],
  exports: [BookmarkService],
  controllers: [BookmarkController],
})
export class BookmarkModule {}
