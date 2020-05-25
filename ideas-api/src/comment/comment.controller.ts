import { Controller, Get, Param, Post, UseGuards, UsePipes, Body, Delete } from '@nestjs/common';

import { CommentService } from './comment.service';
import { AuthGuard } from '../shared/auth.guard';
import { ValidationPipe } from '../shared/validation.pipe';
import { CommentDTO } from './comment.dto';
import { User } from 'src/user/user.decorator';

@Controller('api/comments')
export class CommentController {
    constructor(
        private commentService: CommentService
    ){}

    @Get('idea/:id')
    showCommentsByIdea(@Param('id') idea: string){
        return this.commentService.showByIdea(idea);
    }

    @Get('user/:id')
    showCommentsByUser(@Param('id') user: string){
        return this.commentService.showByUser(user);
    }

    @Get(':id')
    showComment(@Param('id') id: string){
        return this.commentService.show(id);
    }

    @Post('idea/:id')
    @UseGuards(new AuthGuard())
    @UsePipes(new ValidationPipe())
    createComment(@Param('id') id: string, @User('id') user: string, @Body() data: CommentDTO){
        return this.commentService.create(id, user, data);
    }

    @Delete(':id')
    @UseGuards(new AuthGuard())
    destroyComment(@Param('id') id: string, @User('id') user: string){
        return this.commentService.destroy(id, user);
    }
}
