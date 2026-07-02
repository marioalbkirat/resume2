import { Prisma } from "@prisma/client";
export interface Content extends Prisma.JsonObject {
    id: string;
    type: string;
    prop?: Record<string, string>;
    value: string;
}