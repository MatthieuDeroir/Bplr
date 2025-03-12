import {Repository, FindManyOptions, FindOneOptions, ObjectLiteral} from 'typeorm';

// Base repository without injectable decorator
export abstract class BaseRepository<TEntity extends ObjectLiteral, TDomain> {
    protected constructor(protected readonly repository: Repository<TEntity>) {}

    async findAll(options?: FindManyOptions<TEntity>): Promise<TEntity[]> {
        return this.repository.find(options);
    }

    async findOne(options: FindOneOptions<TEntity>): Promise<TEntity | null> {
        return this.repository.findOne(options);
    }

    async findById(id: string): Promise<TDomain | null> {
        const entity = await this.repository.findOne({
            where: { id } as any,
        } as FindOneOptions<TEntity>);

        return entity ? this.mapToDomain(entity) : null;
    }

    async create(domainEntity: Omit<TDomain, 'id' | 'createdAt' | 'updatedAt'>): Promise<TDomain> {
        const entityToCreate = this.mapToEntity(domainEntity as any) as any;
        const newEntity = this.repository.create(entityToCreate);
        const savedEntity = await this.repository.save(newEntity as any);
        return this.mapToDomain(savedEntity);
    }

    async createMany(domainEntities: Omit<TDomain, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<TDomain[]> {
        const entitiesToCreate = domainEntities.map(de =>
            this.mapToEntity(de as any) as any
        );
        const newEntities = entitiesToCreate.map(entity => this.repository.create(entity));
        const savedEntities = await this.repository.save(newEntities as any[]);
        return savedEntities.map(entity => this.mapToDomain(entity));
    }

    async update(id: string, domainEntity: Partial<TDomain>): Promise<TDomain> {
        const entityToUpdate = this.mapToEntity(domainEntity as any) as any;
        await this.repository.update(id, entityToUpdate);
        const updatedEntity = await this.repository.findOne({
            where: { id } as any,
        } as FindOneOptions<TEntity>);

        if (!updatedEntity) {
            throw new Error(`Entity with id ${id} not found`);
        }

        return this.mapToDomain(updatedEntity);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.repository.delete(id);
        // @ts-ignore
        return result.affected !== null && result.affected > 0;
    }

    async count(options?: FindManyOptions<TEntity>): Promise<number> {
        return this.repository.count(options);
    }

    // Each repository must implement these methods
    protected abstract mapToDomain(entity: TEntity): TDomain;
    protected abstract mapToEntity(domain: Partial<TDomain>): Partial<TEntity>;
}