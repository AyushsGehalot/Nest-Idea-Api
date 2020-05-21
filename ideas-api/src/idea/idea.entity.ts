import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn,
    OneToMany,
    UpdateDateColumn,
    ManyToOne,
    ManyToMany,
    JoinTable,
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

    @ManyToMany(type => UserEntity, {cascade: true})
    @JoinTable()
    upvotes: UserEntity[];

    @ManyToMany(type => UserEntity, {cascade: true})
    @JoinTable()
    downvotes: UserEntity[];
}