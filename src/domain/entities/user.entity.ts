// src/domain/entities/user.entity.ts
export class User {
    id: string;
    email: string;
    username: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}