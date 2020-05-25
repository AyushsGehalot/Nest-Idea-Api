import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from './user.entity';
import { UserDTO, UserRO } from './user.dto';
import { async } from 'rxjs/internal/scheduler/async';


@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) 
        private userRepository: Repository<UserEntity>,
    ){}

    async showAll(page: number = 1): Promise<UserRO[]>{
        const users = await this.userRepository.find({ 
            relations: ['ideas', 'bookmarks'],
            take: 25,
            skip: 25 - (page - 1)
        });
        return users.map(user => user.toResponseObject(false));
    }

    async login(data: UserDTO): Promise<UserRO>{
        const { username, password } = data;
        const user = await this.userRepository.findOne({ where: { username }});

        if(!user && !(await user.comparePassword(password))){
            throw new HttpException(
                'Invalid username/password',
                HttpStatus.BAD_REQUEST,
            );
        }

        return user.toResponseObject();
    }

    async register(data: UserDTO): Promise<UserRO>{  
        const {username} = data;
        let user = await this.userRepository.findOne({ where: { username }});

        if(user){
            throw new HttpException(
                'Username already exists',
                HttpStatus.BAD_REQUEST,
            );
        }

        user = await this.userRepository.create(data);
        await this.userRepository.save(user);
        return user.toResponseObject();
    }
}
