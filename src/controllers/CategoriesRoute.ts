import {Router, Request} from "express";
import {authMiddleware} from "../lib/auth";
import CategoryService from "../services/Category.service";

const route = Router()

route.get("/", async (req, res) => {
    const categories = await CategoryService.getAll()
    return res.status(200).json(categories)
})

route.get("/:id", async (req, res) => {
    const toys = await CategoryService.findOne(req.params.id)
    return res.status(200).json(toys)
})

route.post("/", authMiddleware({isAdmin: true}), async (req: Request & {user: any}, res) => {
    const data = await CategoryService.create(req.body.title)
    return res.status(200).json(data)
})

route.delete("/:id", authMiddleware({isAdmin: true}), async (req, res, next) => {
    const data = await CategoryService.delete(req.params.id)
    return res.status(200).json(data)
})

route.patch("/:id", authMiddleware({isAdmin: true}), async (req, res, next) => {
    const data = await CategoryService.update(req.params.id, req.body)
    return res.status(200).json(data)
})

export default route