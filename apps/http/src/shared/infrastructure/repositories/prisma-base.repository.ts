import { PrismaClient } from "@prisma/client";
import { IBaseRepository, PaginatedResult } from "../../domain/repositories/base.repository.interface";
import defaultPrisma from "@/infrastructure/database/prisma.client";

export type PrismaTransactionClient = Omit<
    PrismaClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export abstract class PrismaBaseRepository<
    TEntity,
    TDelegate = any,
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
        const record = await (this.modelDelegate as any).findUnique({
            where: { id },
        });
        return record ? this.mapToEntity(record) : null;
    }

    async exists(id: string): Promise<boolean> {
        const count = await (this.modelDelegate as any).count({
            where: { id },
        });
        return count > 0;
    }

    async create(data: TCreateDTO, ..._args: any[]): Promise<TEntity> {
        const record = await (this.modelDelegate as any).create({
            data: data as any,
        });
        return this.mapToEntity(record);
    }

    async update(id: string, data: TUpdateDTO): Promise<TEntity> {
        const record = await (this.modelDelegate as any).update({
            where: { id },
            data: data as any,
        });
        return this.mapToEntity(record);
    }

    async delete(id: string, ..._args: any[]): Promise<boolean | void> {
        await (this.modelDelegate as any).delete({
            where: { id },
        });
        return true;
    }

    async count(filter?: TFilter): Promise<number> {
        return (this.modelDelegate as any).count({
            where: filter as any,
        });
    }

    async findMany(filter?: TFilter): Promise<PaginatedResult<TEntity> | TEntity[] | any> {
        const records = await (this.modelDelegate as any).findMany({
            where: filter as any,
        });
        return Array.isArray(records) ? records.map((r: any) => this.mapToEntity(r)) : [];
    }
}
