import express, { NextFunction, Response } from "express";
import { db } from "../../../database";
import { errorWrapper } from "../middleware";
import { AppRequest } from "../../../types";

const router = express.Router();

router.post(
  "/save",
  errorWrapper(async (req: AppRequest, res: Response, next: NextFunction) => {
    const { id, date, items, totalSavings, userId } = req.body;
    const totalItems = Object.keys(items).length;
    const saveQuery =
      "INSERT INTO user_shops (id, user_id, shop_date, items, items_total, savings_total) values ($1, $2, $3, $4, $5, $6)";
    await db.query(saveQuery, [id, userId, date, items, totalItems, totalSavings]);
    res.json({ success: true });
  })
);

router.post(
  "/get",
  errorWrapper(async (req: AppRequest, res: Response) => {
    const { userId } = req.body;
    const saveQuery = "SELECT * from user_shops where user_id = $1 ORDER BY shop_date DESC";
    const { rows } = await db.query(saveQuery, [userId]);
    const shops = rows.map((row) => ({
      id: row.id,
      date: row.shop_date,
      items: row.items,
      itemsTotal: row.items_total,
      savingsTotal: row.savings_total,
    }));
    res.json({ success: true, data: { shops } });
  })
);

export default router;
