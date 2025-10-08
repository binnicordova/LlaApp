import * as express from 'express';
import { router as wspRouter } from './wsp';

export const authRouter = express.Router();

// mount sub-routers mirroring folder structure
authRouter.use('/wsp', wspRouter);

export default authRouter;
