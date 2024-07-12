import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

import productRouter from './routes/product.routes.js';

app.use("/api/v1/product", productRouter);

export default app;