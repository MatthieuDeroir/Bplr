// src/infrastructure/database/entities/scale.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { ScaleLevelEntity } from './scale-level.entity';
import { MoodScaleValueEntity } from './mood-scale-value.entity';
import { ScaleWeightEntity } from './scale-weight.entity';

@Entity('scales')
export class ScaleEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ default: false })
    isDefault: boolean;

    @Column({ nullable: true })
    userId: string | null;  // Nullable for system default scales

    @Column()
    minValue: number;

    @Column()
    maxValue: number;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => UserEntity, user => user.scales, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @OneToMany(() => ScaleLevelEntity, level => level.scale, { cascade: true })
    levels: ScaleLevelEntity[];

    @OneToMany(() => MoodScaleValueEntity, value => value.scale)
    moodScaleValues: MoodScaleValueEntity[];

    @OneToMany(() => ScaleWeightEntity, weight => weight.scale)
    scaleWeights: ScaleWeightEntity[];
}