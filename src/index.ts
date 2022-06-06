import express from "express"
import cors from "cors"
import morgan from "morgan"
import dotenv from "dotenv"
import {handleErrors} from "./lib/errorHandler";
import AuthRoute from "./controllers/AuthRoute";
import ImagesRoute from "./controllers/ImagesRoute";
import OrdersRoute from "./controllers/OrdersRoute";
import CategoriesRoute from "./controllers/CategoriesRoute";
import UsersRoute from "./controllers/UsersRoute";
import ToysRoute from "./controllers/ToysRoute";

dotenv.config()

const app = express()
app.use(cors({
    origin: "*"
}))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(morgan("dev"))

app.use("/auth", AuthRoute)
app.use("/images", ImagesRoute)
app.use("/toys", ToysRoute)
app.use("/orders", OrdersRoute)
app.use("/categories", CategoriesRoute)
app.use("/users", UsersRoute)

app.use(handleErrors)

app.listen(5000, () => {
    console.log("SERVER IS UP!")
})