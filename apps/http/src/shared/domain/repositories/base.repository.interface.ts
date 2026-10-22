export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page?: number;
    limit?: number;
    totalPages?: number;
}

export interface IBaseRepository<
    TEntity,
    TId = string,
    TCreateDTO = Partial<TEntity>,
    TUpdateDTO = Partial<TEntity>,
    TFilter = any
> {
    findById(id: TId): Promise<TEntity | null>;
    findMany(filter?: TFilter): Promise<PaginatedResult<TEntity> | TEntity[]>;
    create(data: TCreateDTO): Promise<TEntity>;
    update(id: TId, data: TUpdateDTO): Promise<TEntity>;
    delete(id: TId): Promise<boolean>;
    count(filter?: TFilter): Promise<number>;
    exists(id: TId): Promise<boolean>;
}
