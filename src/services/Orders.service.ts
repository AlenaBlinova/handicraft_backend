import prisma from "../lib/prisma";
import ToysService from "./Toys.service";
import {ErrorHandler} from "../lib/errorHandler";
import {USER} from "../constants/roles";
import {Toy, User} from "@prisma/client";

interface IOrderCreateDTO {
    toysList: { id: number, count: number }[]
    phone: string
    name: string
}

class OrdersService {
    async create(user, orderDTO: IOrderCreateDTO) {
        const {
            toysList, phone, name
        } = orderDTO
        const toys = await ToysService.findToysInList(toysList)
        const mappedToys = toysList
            .filter(withCount => toys.some(toy => toy.id === withCount.id))
            .map(toy => ({toyId: toy.id, count: toy.count}))

        if (mappedToys.length < 1) throw new ErrorHandler(401, "Не указано ни одной игрушки")
        if (mappedToys.some(f => isNaN(f.count) || f.count < 1)) throw new ErrorHandler(401, "Не верно указано количество одной из игрушек")

        const totalPrice = toysList.reduce((a, b) => {
            const candidate: Toy = toys.find(toy => toy.id === b.id)
            return a + candidate.price * b.count
        }, 0)

        return await prisma.order.create({
            data: {
                phone, name, totalPrice, userId: user?.id, toys: {
                    createMany: {
                        data: mappedToys
                    }
                }
            }
        })
    }

    async update(user, orderUpdateDTO) {
        const candidate = await prisma.order.findUnique({
            where: {id: Number(orderUpdateDTO.id)}, include: {user: true}
        })
        if (!candidate) throw new ErrorHandler(401, "Такого заказа не существует")
        if (candidate.userId !== user.id && user.role === USER) throw new ErrorHandler(401, "Вы не можете изменить этот заказ")
        return await prisma.order.update({
            where: {id: Number(orderUpdateDTO.id)},
            data: {
                status: orderUpdateDTO.status
            },
            include: {
                toys: {
                    select: {
                        count: true,
                        toy: true
                    }
                }
            }
        })
    }

    async getAll() {
        return await prisma.order.findMany({
            orderBy: {
                createdAt: "desc"
            },
            include: {
                toys: {
                    select: {
                        count: true,
                        toy: true
                    }
                }
            }
        })
    }

    async getUserOrders(user: User) {
        return await prisma.order.findMany({
            orderBy: {
                createdAt: "desc"
            },
            where: {
                userId: user.id
            }
        })
    }
}

export default new OrdersService()