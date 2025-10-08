import { onRequest } from "firebase-functions/v2/https";
import * as express from 'express';
import authRouter from './auth';

const app = express();

app.use(express.json());

app.post('/', (request: express.Request, response: express.Response) => {
  console.log('request post');
  console.log(request.body || request);
  response.send("post received");
});

app.use('/auth', authRouter);

export const llaapp = onRequest(app);
