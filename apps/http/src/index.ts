import express from "express"
import cors from "cors"
import router from "./routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors())

const PORT = process.env.PORT || 3000;

app.use(router)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
