import { PrimaryGeneratedColumn, Entity, Column, CreateDateColumn, BeforeInsert, ManyToOne, OneToMany } from "typeorm";
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { IdeaEntity } from "src/idea/idea.entity";

@Entity('user')
export class UserEntity{
    @PrimaryGeneratedColumn('uuid')
    id : string;

    @CreateDateColumn()
    created: Date; 

    @Column({
        type: 'text',
        unique: true
    })
    username: string;

    @Column()
    password: string;

    @OneToMany(type => IdeaEntity, idea => idea.author)
    ideas: IdeaEntity[];

    @BeforeInsert()
    async hashPass(){
        this.password = await bcrypt.hash(this.password, 10);
    }

    toResponseObject(showToken: boolean = true){
        const {id, created, username, token } = this;
        const responseObject: any = { id, created, username };
        if(showToken){
            responseObject.token = token;
        }    
        if(this.ideas){
            responseObject.idea = this.ideas;
        }
        return responseObject;    
    }

    async comparePassword(attempt: string){
        return await bcrypt.compare(attempt, this.password);
    }

    private get token(){
        const {id, username} = this;
        return jwt.sign(
            {   
                id, 
                username, 
            },
            process.env.SECRET,
            { expiresIn:  '7d' },
        );
    }
}