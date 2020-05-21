import { Controller, Get, Post, Put, Delete, Body, Param, UsePipes, Logger, UseGuards } from '@nestjs/common';

import { IdeaService } from './idea.service';
import { IdeaDTO } from './idea.dto';
import { ValidationPipe } from '../shared/validation.pipe';
import { AuthGuard } from '../shared/auth.guard';
import { User } from '../user/user.decorator';

@Controller('api/ideas')
export class IdeaController {
    private logger = new Logger('IdeasController');
    constructor(private ideaService: IdeaService) {}

    private logData(options: any){
        options.user && Logger.log('User '+ JSON.stringify(options.user));
        options.body && Logger.log('Data '+ JSON.stringify(options.data));
        options.id && Logger.log('Id '+ JSON.stringify(options.id));
    }

    @Get()
    showAllIdea(){
        return this.ideaService.showAll();
    }

    @Post()
    @UseGuards(new AuthGuard())
    @UsePipes(new ValidationPipe())
    creatIdea(@User('id') user,@Body() data: IdeaDTO){
        this.logData({user, data});
        return this.ideaService.create(user, data);
    }

    @Get(':id')
    readIdea(@Param('id') id: string){
        return this.ideaService.read(id);
    }

    @Put(':id')
    @UseGuards(new AuthGuard())
    @UsePipes(new ValidationPipe())
    updateIdea(@Param('id') id: string, @User('id') user: string, @Body() data: Partial<IdeaDTO>){
        this.logData({id, user, data});
        return this.ideaService.update(id, user, data);
    }

    @Delete(':id')
    @UseGuards(new AuthGuard())
    destroyIdea(@Param('id') id: string, @User('id') user: string){
        this.logData({id, user});
        return this.ideaService.destroy(id, user);
    }

    @Post(':id/upvote')
    @UseGuards(new AuthGuard())
    upvoteIdea(@Param('id') id: string, @User('id') user: string){
        this.logData({id, user});
        return this.ideaService.upvoteIdea(id, user);
    }

    @Post(':id/downvote')
    @UseGuards(new AuthGuard())
    downvoteIdea(@Param('id') id: string, @User('id') user: string){
        this.logData({id, user});
        return this.ideaService.downvoteIdea(id, user);
    }

    @Post(':id/bookmarks')
    @UseGuards(new AuthGuard())
    bookmarkIdea(@Param('id') id: string, @User('id') user: string){
        this.logData({id, user});
        return this.ideaService.bookmark(id, user);
    }

    @Delete(':id/bookmarks')
    @UseGuards(new AuthGuard())
    unBookmarkIdea(@Param('id') id: string, @User('id') user: string){
        this.logData({id, user});
        return this.ideaService.unBookmark(id, user);
    }
}
