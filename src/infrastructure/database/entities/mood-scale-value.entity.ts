// src/infrastructure/database/entities/mood-scale-value.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MoodEntryEntity } from './mood-entry.entity';
import { ScaleEntity } from './scale.entity';

@Entity('mood_scale_values')
export class MoodScaleValueEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    moodEntryId: string;

    @Column()
    scaleId: string;

    @Column()
    value: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => MoodEntryEntity, entry => entry.scaleValues, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'moodEntryId' })
    moodEntry: MoodEntryEntity;

    @ManyToOne(() => ScaleEntity, scale => scale.moodScaleValues)
    @JoinColumn({ name: 'scaleId' })
    scale: ScaleEntity;
}