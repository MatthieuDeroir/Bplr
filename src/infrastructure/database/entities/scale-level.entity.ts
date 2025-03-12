// src/infrastructure/database/entities/scale-level.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ScaleEntity } from './scale.entity';

@Entity('scale_levels')
export class ScaleLevelEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    scaleId: string;

    @Column()
    level: number;

    @Column({ type: 'text' })
    description: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => ScaleEntity, scale => scale.levels, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'scaleId' })
    scale: ScaleEntity;
}