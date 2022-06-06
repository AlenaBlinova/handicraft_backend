import prisma from "../lib/prisma";
import ToysService from "./Toys.service";
import {ErrorHandler} from "../lib/errorHandler";

class CategoryService {
    async create(title) {
        return await prisma.category.create({
            data: {
                title
            }
        })
    }

    async getAll() {
        return await prisma.category.findMany({})
    }

    async findOne(id) {
        return await prisma.category.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                toys: true
            }
        })
    }

    async delete(id) {
        const candidate = await prisma.category.findUnique({
            where: {
                id: Number(id)
            }
        })
        if (!candidate) throw new ErrorHandler(401, "Такой категории не существует")
        return await prisma.category.delete({
            where: {
                id: Number(id)
            }
        })
    }

    async update(id, updateDTO) {
        const candidate = await prisma.category.findUnique({
            where: {
                id: Number(id)
            }
        })
        if (!candidate) throw new ErrorHandler(401, "Такой категории не существует")
        return await prisma.category.update({
            where: {
                id: Number(id)
            },
            data: updateDTO
        })
    }

}

export default new CategoryService()