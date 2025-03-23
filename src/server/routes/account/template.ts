import express, { NextFunction,Response } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../../../database";
import { errorWrapper } from "../middleware";
import { AppRequest } from "../../../types";

const router = express.Router();

router.post(
  "/save",
  errorWrapper(async (req: AppRequest, res: Response, next: NextFunction) => {
    const { config, userId, name } = req.body;
    const id = uuid();
    const saveQuery = "INSERT into user_templates (id, user_id, template_name, config) values ($1, $2, $3, $4)";
    await db.query(saveQuery, [id, userId, name, config]);
    res.json({ success: true });
  })
);

router.post(
  "/get",
  errorWrapper(async (req: AppRequest, res: Response, next: NextFunction) => {
    const { userId } = req.body;
    const getQuery = "SELECT * from user_templates WHERE user_id = $1";
    const { rows } = await db.query(getQuery, [userId]);
    const templates = rows.map((row) => ({
      id: row.id,
      name: row.template_name,
      config: row.config,
      createdAt: row.created_at,
    }));
    res.json({ success: true, data: { templates } });
  })
);

router.post(
  "/edit",
  errorWrapper(async (req: AppRequest, res: Response, next: NextFunction) => {
    const { templateId, name } = req.body;
    const editQuery = "UPDATE user_templates SET template_name = $1 where id = $2";
    await db.query(editQuery, [name, templateId]);
    res.json({ success: true });
  })
);

router.post(
  "/delete",
  errorWrapper(async (req: AppRequest, res: Response, next: NextFunction) => {
    const { templateId } = req.body;
    const deleteQuery = "DELETE from user_templates WHERE id = $1";
    await db.query(deleteQuery, [templateId]);
    res.json({ success: true });
  })
);

export default router;
