import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"

import router from "./routes";
import errorMiddleware from "./middlewares/err.middleware";
import notFoundMiddleware from "./middlewares/not-found.middleware";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use("/api", router)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app
