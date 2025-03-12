// src/infrastructure/database/entities/mood-entry.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { MoodScaleValueEntity } from './mood-scale-value.entity';

@Entity('mood_entries')
export class MoodEntryEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column({ type: 'timestamp' })
    entryDate: Date;

    @Column({ type: 'text', nullable: true })
    comment: string;

    @Column({ nullable: true })
    medication: string;

    @Column({ type: 'float', nullable: true })
    sleepHours: number;

    @Column({ type: 'float', nullable: true })
    stabilityScore: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => UserEntity, user => user.moodEntries, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @OneToMany(() => MoodScaleValueEntity, value => value.moodEntry, { cascade: true })
    scaleValues: MoodScaleValueEntity[];
}