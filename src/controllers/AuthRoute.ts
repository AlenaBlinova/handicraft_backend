import {Request, Response, Router} from "express";
import {authMiddleware} from "../lib/auth";
import AuthService from "../services/Auth.service";

const route = Router()

route.post("/reset", async (req, res) => {
    const data = await AuthService.resetPassword(req.body.code as string, req.body.password)
    return res.status(200).json(data)
})

route.post("/forgot", async (req, res) => {
    const data = await AuthService.forgotPassword(req.body.email)
    return res.status(200).json(data)
})

route.get("/verify", authMiddleware(), async (req: Request & { user: any }, res) => {
    let data;
    if (!req.query.code) {
        data = await AuthService.sendVerificationEmail(req.user)
    } else {
        data = await AuthService.verifyEmail(req.user, req.query.code as string)
    }
    return res.status(200).json(data)
})

route.get("/access", authMiddleware(), async (req: Request & { user: any }, res: Response) => {
    res.status(200).json(req.user)
})

route.post("/signin", async (req, res) => {
    const data = await AuthService.signIn(req.body)
    return res.status(200).json(data)
})

route.post("/signup", async (req, res) => {
    const data = await AuthService.signUp(req.body)
    return res.status(200).json(data)
})

export default route