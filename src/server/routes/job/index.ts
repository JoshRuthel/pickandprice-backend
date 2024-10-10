import express from "express";
import JobHandler from "../../handlers/handler";
import { JobRequest, JobTypes } from "../../handlers/types";

const router = express.Router();

router.post("/initiate", async (req: JobRequest<JobTypes>, res: any) => await JobHandler.handleJob(req, res));

export default router;
