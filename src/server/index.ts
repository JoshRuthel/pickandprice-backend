import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import routes from "./routes";
import "express-async-errors";
import { authenticateUser, errorHandler } from "./routes/middleware";

const app = express();
const port = 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(authenticateUser);
app.use("/", routes);
app.use(errorHandler);

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
});
