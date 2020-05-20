import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IdeaEntity, IdeaRo } from './idea.entity';
import { IdeaDTO } from './idea.dto';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class IdeaService {
    constructor(
        @InjectRepository(IdeaEntity)
        private ideaRepository: Repository<IdeaEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>
    ) {}
    
    private toResponseObject(idea: IdeaEntity): IdeaRo{
        return { ...idea, author: idea.author.toResponseObject(false) };
    }

    private ensureOwnerShip(idea: IdeaEntity, userid: string){
        if(idea.author.id != userid){
            return false;
        }
        return true;
    }
    
    async showAll(): Promise<IdeaRo[]>{
        let ideas = await this.ideaRepository.find({relations : ['author']});
        return ideas.map(idea => this.toResponseObject(idea)); 
    }

    async create(userId: string, data: IdeaDTO): Promise<IdeaRo>{
        const user = await this.userRepository.findOne({ where: {id : userId} })
        const idea = await this.ideaRepository.create({...data, author: user});
        await this.ideaRepository.save(idea);
        return this.toResponseObject(idea);
    }

    async read(id: string){
        const idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author'] });
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
        if(!this.ensureOwnerShip(idea, user)){
            throw new HttpException("Unauthorised User", HttpStatus.UNAUTHORIZED);
        }
        await this.ideaRepository.update({ id }, data);
        idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author']});
        return this.toResponseObject(idea);
    } 

    async destroy(id: string, user: string){
        const idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author']});
        if(!idea){
            throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
        }
        if(!this.ensureOwnerShip(idea, user)){
            throw new HttpException("Unauthorised User", HttpStatus.UNAUTHORIZED);
        }
        await this.ideaRepository.delete({ id });
        return this.toResponseObject(idea);
    }
}

