import prisma from "../lib/prisma";

type ISearch = {
    id: number
    email?: never
    username?: never
} | {
    id?: never
    email: string
    username?: never
} | {
    id?: never
    email?: never
    username: string
}

interface IUserCreateDTO {
    email: string
    username: string
    password: string
}

interface IUserUpdateDTO {
    email?: string
    username?: string
    password?: string
    emailConfirmed?: Date
    emailConfirmationCode?: string
}

class UsersService {

    async findOne(toSearch: ISearch) {
        return await prisma.user.findUnique({
            where: toSearch,
            include: {
                orders: true
            }
        })
    }

    async update(id: number, userUpdateDTO: IUserUpdateDTO) {
        const candidate = await this.findOne({id})
        const {password, ...userInfo} = await prisma.user.update({
            where: {id},
            data: userUpdateDTO
        })

        if (candidate.emailConfirmed) {
            if (candidate.email !== userUpdateDTO.email) {
                await prisma.user.update({
                    where: {id},
                    data: {
                        emailConfirmed: null
                    }
                })
            }
        }

        return userInfo
    }

    async create(userCreateDTO: IUserCreateDTO) {
        return await prisma.user.create({
            data: userCreateDTO
        })
    }
}

export default new UsersService()