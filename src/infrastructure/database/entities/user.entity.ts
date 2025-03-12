// src/infrastructure/database/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ScaleEntity } from './scale.entity';
import { MoodEntryEntity } from './mood-entry.entity';
import { StabilityFormulaEntity } from './stability-formula.entity';

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    username: string;

    @Column()
    passwordHash: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => ScaleEntity, scale => scale.user)
    scales: ScaleEntity[];

    @OneToMany(() => MoodEntryEntity, moodEntry => moodEntry.user)
    moodEntries: MoodEntryEntity[];

    @OneToMany(() => StabilityFormulaEntity, formula => formula.user)
    stabilityFormulas: StabilityFormulaEntity[];
}