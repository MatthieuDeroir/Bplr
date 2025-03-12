// src/infrastructure/database/entities/stability-formula.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { ScaleWeightEntity } from './scale-weight.entity';

@Entity('stability_formulas')
export class StabilityFormulaEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    userId: string | null;

    @Column({ type: 'text' })
    formula: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ default: false })
    isDefault: boolean;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => UserEntity, user => user.stabilityFormulas, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @OneToMany(() => ScaleWeightEntity, weight => weight.stabilityFormula, { cascade: true })
    scaleWeights: ScaleWeightEntity[];
}