import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import routes from './routes';
import "express-async-errors";

const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json());
app.use("/", routes);


app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
})
