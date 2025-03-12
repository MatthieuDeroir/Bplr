// src/infrastructure/database/entities/scale-weight.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { StabilityFormulaEntity } from './stability-formula.entity';
import { ScaleEntity } from './scale.entity';

@Entity('scale_weights')
export class ScaleWeightEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    stabilityFormulaId: string;

    @Column()
    scaleId: string;

    @Column({ type: 'float' })
    weight: number;

    @Column({ default: false })
    isInverted: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => StabilityFormulaEntity, formula => formula.scaleWeights, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'stabilityFormulaId' })
    stabilityFormula: StabilityFormulaEntity;

    @ManyToOne(() => ScaleEntity, scale => scale.scaleWeights)
    @JoinColumn({ name: 'scaleId' })
    scale: ScaleEntity;
}