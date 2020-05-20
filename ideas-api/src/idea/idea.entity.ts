import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn,
    OneToMany,
    UpdateDateColumn,
    ManyToOne,
} from "typeorm";

import { UserEntity } from "../user/user.entity";
import { UserRO } from "src/user/user.dto";

@Entity('idea')
export class IdeaEntity {
    @PrimaryGeneratedColumn('uuid') 
    id: string;

    @CreateDateColumn() 
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @Column("text") 
    idea: string;

    @Column("text") 
    description: string;

    @ManyToOne(type => UserEntity, author => author.ideas)
    author: UserEntity;
}

export class IdeaRo{
    id?: string;
    updated: Date;
    created: Date;
    idea: string;
    description: string;
    author: UserRO;
}