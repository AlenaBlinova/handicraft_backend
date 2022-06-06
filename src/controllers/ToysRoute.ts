import {Request, Router} from "express";
import {authMiddleware} from "../lib/auth";
import ToysService from "../services/Toys.service";

const route = Router()

route.delete("/:id", authMiddleware({isAdmin: true}), async (req, res) => {
    const data = await ToysService.deleteOne(req.params.id)
    return res.status(200).json(data)
})

route.patch("/:id", authMiddleware({isAdmin: true}), async (req: Request & {user: any}, res) => {
    const data = await ToysService.update(req.params.id, req.body)
    return res.status(200).json(data)
})

route.post("/", authMiddleware({isAdmin: true}), async (req, res) => {
    const data = await ToysService.create(req.body)
    return res.status(200).json(data)
})

route.get("/", async (req, res) => {
    const data = await ToysService.getAll()
    return res.status(200).json(data)
})

export default route