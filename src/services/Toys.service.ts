import prisma from "../lib/prisma";
import {ErrorHandler} from "../lib/errorHandler";

interface IToyCreateDTO {
    title: string
    description: string
    price: number
    categoryId: number
    thumbnailId?: string
}

interface IToyUpdateDTO {
    title?: string
    description?: string
    price?: number
    categoryId?: number
    thumbnailId?: string
}

class ToysService {

    async deleteOne(id) {
        return await prisma.toy.delete({
            where: {id: Number(id)}
        })
    }

    async update(id, toyUpdateDTO: IToyUpdateDTO) {
        const {
            title, price, description, thumbnailId, categoryId
        } = toyUpdateDTO
        const candidate = await prisma.toy.findUnique({
            where: {id: Number(id)}
        })
        if (!candidate) throw new ErrorHandler(401, "Такой игрушки нет в базе данных")
        return await prisma.toy.update({
            where: {id: Number(id)},
            data: {
                title, price, description, thumbnailId, categoryId
            },
            include: {
                category: true
            }
        })
    }

    async create(toyCreateDTO: IToyCreateDTO) {
        const {
            title, price, description, thumbnailId, categoryId
        } = toyCreateDTO
        return await prisma.toy.create({
            data: {
                title, price, description, thumbnailId, categoryId
            },
            include: {
                category: true
            }
        })
    }

    async getAll() {
        return await prisma.toy.findMany({
            include: {
                category: true
            }
        })
    }

    async findToysInList(toysList: {id: number}[]) {
        return await prisma.toy.findMany({
            where: {
                id: {
                    in: toysList.map(f => f?.id || -1)
                }
            }
        })
    }
}

export default new ToysService()