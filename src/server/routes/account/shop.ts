import express, { Request, Response } from "express";
import { db } from "../../../database";

const router = express.Router();

router.post("/save", async (req: Request, res: Response) => {
  const { id, date, items, totalSavings, userId } = req.body;
  const totalItems = Object.keys(items).length;
  try {
    const saveQuery =
      "INSERT INTO user_shops (id, user_id, shop_date, items, items_total, savings_total) values ($1, $2, $3, $4, $5, $6)";
    await db.query(saveQuery, [id, userId, date, items, totalItems, totalSavings]);
    res.status(200).send({ message: "Success !" });
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: "An error occurred" });
  }
});

router.post("/get", async (req: Request, res: Response) => {
  const { userId } = req.body;
  try {
    const saveQuery = "SELECT * from user_shops where user_id = $1 ORDER BY shop_date DESC";
    const { rows } = await db.query(saveQuery, [userId]);
    const shops = rows.map((row) => ({
      id: row.id,
      date: row.shop_date,
      items: row.items,
      itemsTotal: row.items_total,
      savingsTotal: row.savings_total,
    }));
    res.status(200).send({ shops });
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: "An error occurred" });
  }
});

export default router;
