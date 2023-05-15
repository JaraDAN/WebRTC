import { app } from "./app";
import dotenv from "dotenv"
import { PORT } from "./config/Config";

dotenv.config()

app.listen(PORT, () => {
    console.log(`Server running ${PORT}`);
});