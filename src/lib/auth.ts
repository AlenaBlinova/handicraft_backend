import {verifyToken} from "./utils";
import UsersService from "../services/Users.service";
import {JwtPayload} from "jsonwebtoken";
import {ADMIN} from "../constants/roles";
import {Request, Response, NextFunction} from "express";
import {Order, User } from "@prisma/client";

interface IOptions {
    isAdmin?: boolean
    isRequired?: boolean
}

interface IAuthMiddleware {
    (options?: IOptions | null): any
}

export const authMiddleware: IAuthMiddleware = ({isAdmin , isRequired} = {
    isAdmin: false,
    isRequired: true
}) =>
    async (req: Request & {user: User & {orders: Order[]}}, res: Response, next: NextFunction) => {
        let accessToken;
        if (req.headers.authorization) {
            const [type, token] = req.headers.authorization.split(" ")
            if (type !== "Bearer") {
                if (isRequired) return res.status(401).json({error: "Токен авторизации имеет не верную форму"})
                else accessToken = null
            }
            accessToken = token
        }
        if (!accessToken) {
            if (isRequired) return res.status(401).json({error: "Нет токена авторизации"})
            else return next()
        }
        try {
            const tokenData = verifyToken(accessToken) as JwtPayload
            if (!tokenData) {
                if (isRequired) return res.status(401).json({error: "Не правильный токен авторизации"})
                else return next()
            }
            const userData = await UsersService.findOne({id: tokenData.id})
            if (!userData) {
                if (isRequired) return res.status(401).json({error: "Пользователя с таким id нет в базе данных"})
                else return next()
            }
            if (userData) req.user = userData
            if (isAdmin && userData.role !== ADMIN) return res.status(403).json({error: "У вас нет доступа к этому"})
            return next()
        } catch (e) {
            console.error(e)
            if (isRequired) return res.status(401).json({error: "Не правильный токен авторизации"})
            else return next()
        }
    }