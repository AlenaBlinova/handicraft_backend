import {Request, Router} from "express";
import {authMiddleware} from "../lib/auth";
import UsersService from "../services/Users.service";
import {User} from "@prisma/client";

const route = Router()

route.patch("/me", authMiddleware(), async (req: Request & {user: User}, res) => {
    const data = await UsersService.update(req.user.id, req.body)
    return res.status(200).json(data)
})

export default route