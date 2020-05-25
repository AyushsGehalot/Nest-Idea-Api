import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IdeaEntity } from './idea.entity';
import { IdeaDTO, IdeaRo } from './idea.dto';
import { UserEntity } from '../user/user.entity';
import { Votes } from 'src/shared/votes.enum';

@Injectable()
export class IdeaService {
    constructor(
        @InjectRepository(IdeaEntity)
        private ideaRepository: Repository<IdeaEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>
    ) {}
    
    private toResponseObject(idea: IdeaEntity): IdeaRo{
        const responseObject: any = { ...idea, author: idea.author.toResponseObject(false) };
        if(responseObject.upvotes){
            responseObject.upvotes = idea.upvotes.length;
        }
        if(responseObject.downvotes){
            responseObject.downvotes = idea.downvotes.length;
        }
        return responseObject;
    }

    private ensureOwnerShip(idea: IdeaEntity, userid: string){
        if(idea.author.id != userid){
            throw new HttpException("Unauthorised User", HttpStatus.UNAUTHORIZED);
        }
    }

    private async vote(idea: IdeaEntity, user: UserEntity, vote: Votes){
        const opposite = vote === Votes.UP ? Votes.DOWN : Votes.UP;
        if(
            idea[opposite].filter(voter => voter.id === user.id).length > 0 || 
            idea[vote].filter(voter => voter.id === user.id).length > 0
        ){
            idea[opposite] = idea[opposite].filter(voter => voter.id !== user.id); 
            idea[vote] = idea[vote].filter(voter => voter.id !== user.id);
            await this.ideaRepository.save(idea);
        } else if(idea[vote].filter(voter => voter.id === user.id).length < 1){
            idea[vote].push(user);
            await this.ideaRepository.save(idea);
        }else{
            throw new HttpException('Unable to cast vote.', HttpStatus.BAD_REQUEST);
        }
        return idea;
    }
    
    async showAll(): Promise<IdeaRo[]>{
        let ideas = await this.ideaRepository.find({relations : ['author', 'upvotes', 'downvotes', 'comments']});
        return ideas.map(idea => this.toResponseObject(idea)); 
    }

    async create(userId: string, data: IdeaDTO): Promise<IdeaRo>{
        const user = await this.userRepository.findOne({ where: {id : userId} })
        const idea = await this.ideaRepository.create({...data, author: user});
        await this.ideaRepository.save(idea);
        return this.toResponseObject(idea);
    }

    async read(id: string){
        const idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author', 'upvotes', 'downvotes', 'comments'] });
        if(!idea){
            throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
        }
        return this.toResponseObject(idea);
    }

    async update(id: string, user: string, data: Partial<IdeaDTO>): Promise<IdeaRo>{
        let idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author']});
        if(!idea){
            throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
        }
        this.ensureOwnerShip(idea, user)
        await this.ideaRepository.update({ id }, data);
        idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author', 'comments']});
        return this.toResponseObject(idea);
    } 

    async destroy(id: string, user: string){
        const idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author', 'comments']});
        if(!idea){
            throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
        }
        this.ensureOwnerShip(idea, user)
        await this.ideaRepository.delete({ id });
        return this.toResponseObject(idea);
    }

    async upvoteIdea(id: string, userId: string){
        let idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author', 'upvotes', 'downvotes']});
        const user = await this.userRepository.findOne({ where: { id: userId }});
        
        idea = await this.vote(idea, user, Votes.UP);
        return this.toResponseObject(idea);
    }

    async downvoteIdea(id: string, userId: string){
        let idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author', 'upvotes', 'downvotes']});
        const user = await this.userRepository.findOne({ where: { id: userId }});
        
        idea = await this.vote(idea, user, Votes.DOWN);
        return this.toResponseObject(idea);
    }

    async bookmark(id: string, userId: string){
        const idea = await this.ideaRepository.findOne({ where: { id }});
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['bookmarks']});
        if(user.bookmarks.filter(bookmark => bookmark.id === idea.id).length < 1){
            user.bookmarks.push(idea);
            await this.userRepository.save(user);
        } else {
            throw new HttpException("Idea Alreday Bookmarked", HttpStatus.BAD_GATEWAY);
        }
        return user.toResponseObject(false);
    }

    async unBookmark(id: string, userId: string){
        const idea = await this.ideaRepository.findOne({ where: { id }});
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['bookmarks']});
        if(user.bookmarks.filter(bookmark => bookmark.id === idea.id).length > 0){
            user.bookmarks = user.bookmarks.filter(bookmark => bookmark.id !== idea.id);
            await this.userRepository.save(user);
        } else {
            throw new HttpException("Idea is not bookmarked", HttpStatus.BAD_GATEWAY);
        }
        return user.toResponseObject(false);
    }
}

