import { injectable, inject } from 'inversify';
import { Repository } from 'typeorm';
import { UserEntity } from '@/infrastructure/database/entities/user.entity';
import { User } from '@/domain/entities/user.entity';
import { IUserRepository } from '@/domain/interfaces/repositories/user-repository.interface';
import { BaseRepository } from './base.repository';
import { TYPES } from '../../types';

@injectable()
export class UserRepository extends BaseRepository<UserEntity, User> implements IUserRepository {
    constructor(
        @inject(TYPES.UserEntityRepository) repository: Repository<UserEntity>
    ) {
        super(repository);
    }

    async findByEmail(email: string): Promise<User | null> {
        const userEntity = await this.findOne({
            where: { email }
        });

        return userEntity ? this.mapToDomain(userEntity) : null;
    }

    protected mapToDomain(entity: UserEntity): User {
        return {
            id: entity.id,
            email: entity.email,
            username: entity.username,
            passwordHash: entity.passwordHash,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt
        };
    }

    protected mapToEntity(domain: Partial<User>): Partial<UserEntity> {
        const entity: Partial<UserEntity> = {};

        if (domain.id !== undefined) entity.id = domain.id;
        if (domain.email !== undefined) entity.email = domain.email;
        if (domain.username !== undefined) entity.username = domain.username;
        if (domain.passwordHash !== undefined) entity.passwordHash = domain.passwordHash;

        return entity;
    }
}