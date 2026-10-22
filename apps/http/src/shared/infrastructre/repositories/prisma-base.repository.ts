import { PrismaClient } from "@prisma/client";
import { IBaseRepository, PaginatedResult } from "../../domain/repositories/base.repository.interface";
import defaultPrisma from "@/infrastructure/database/prisma.client";

export type PrismaTransactionClient = Omit<
    PrismaClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export abstract class PrismaBaseRepository<
    TEntity,
    TDelegate extends {
        findUnique: Function;
        findMany: Function;
        create: Function;
        update: Function;
        delete: Function;
        count: Function;
    },
    TCreateDTO = any,
    TUpdateDTO = any,
    TFilter = any
> implements IBaseRepository<TEntity, string, TCreateDTO, TUpdateDTO, TFilter> {

    constructor(
        protected readonly prisma: PrismaClient = defaultPrisma,
        protected readonly modelDelegate: TDelegate
    ) { }

    protected abstract mapToEntity(record: any): TEntity;

    async findById(id: string): Promise<TEntity | null> {
        const record = await this.modelDelegate.findUnique({
            where: { id },
        });
        return record ? this.mapToEntity(record) : null;
    }

    async exists(id: string): Promise<boolean> {
        const count = await this.modelDelegate.count({
            where: { id },
        });
        return count > 0;
    }

    async create(data: TCreateDTO): Promise<TEntity> {
        const record = await this.modelDelegate.create({
            data: data as any,
        });
        return this.mapToEntity(record);
    }

    async update(id: string, data: TUpdateDTO): Promise<TEntity> {
        const record = await this.modelDelegate.update({
            where: { id },
            data: data as any,
        });
        return this.mapToEntity(record);
    }

    async delete(id: string): Promise<boolean> {
        await this.modelDelegate.delete({
            where: { id },
        });
        return true;
    }

    async count(filter?: TFilter): Promise<number> {
        return this.modelDelegate.count({
            where: filter as any,
        });
    }

    abstract findMany(filter?: TFilter): Promise<PaginatedResult<TEntity>>;
}
