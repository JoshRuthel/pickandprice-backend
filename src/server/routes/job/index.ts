import express, { NextFunction, Response } from "express";
import JobHandler from "../../handlers/handler";
import { JobRequest, JobTypes } from "../../../types";
import { errorWrapper } from "../middleware";

const router = express.Router();

router.post(
  "/initiate",
  errorWrapper(
    async (req: JobRequest<JobTypes>, res: Response, next: NextFunction) => await JobHandler.handleJob(req, res)
  )
);

export default router;
