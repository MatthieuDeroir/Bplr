// src/domain/interfaces/repositories/user-repository.interface.ts
import { User } from '../../entities/user.entity';

export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
    update(id: string, userData: Partial<User>): Promise<User>;
    delete(id: string): Promise<boolean>;
}