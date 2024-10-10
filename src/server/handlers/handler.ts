import { ProductDBProvider } from "../providers/ProductDBProvider";
import { Response } from "express";
import { JobRequest, JobTypes } from "./types";
import { JobMapper } from "./jobs";

const db = new ProductDBProvider();

class JobHandler {
  constructor() {}
  static async handleJob(req: JobRequest<JobTypes>, res: Response) {
    const { jobType, params } = req.body;
    const result = await JobMapper[jobType](params, db)
    return res.status(200).json(result);
  }
}

export default JobHandler;