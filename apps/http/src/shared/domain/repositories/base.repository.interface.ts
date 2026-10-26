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
    TCreateDTO = any,
    TUpdateDTO = any,
    TFilter = any
> {
    findById(id: TId): Promise<TEntity | null>;
    findMany?(filter?: TFilter): Promise<PaginatedResult<TEntity> | TEntity[] | any>;
    create?(data: TCreateDTO, ...args: any[]): Promise<TEntity>;
    update?(id: TId, data: TUpdateDTO): Promise<TEntity>;
    delete?(id: TId, ...args: any[]): Promise<boolean | void>;
    count?(filter?: TFilter): Promise<number>;
    exists?(id: TId): Promise<boolean>;
}
