import express, { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../../../database';

const router = express.Router()

router.post('/save', async (req: Request, res: Response) => {
    const {config, userId, name} = req.body
    const id = uuid()
    try{
        const saveQuery = 'INSERT into user_templates (id, user_id, template_name, config) values ($1, $2, $3, $4)'
        await db.query(saveQuery, [id, userId, name, config])
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: 'An error occurred' })
    }
})

router.post('/get', async (req: Request, res: Response) => {
    const {userId} = req.body
    try{
        const getQuery = 'SELECT * from user_templates WHERE user_id = $1'
        const {rows} = await db.query(getQuery, [userId])
        const templates = rows.map(row => ({id: row.id, name: row.template_name, config: row.config, createdAt: row.created_at}))
        res.json({templates})
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: 'An error occurred' })
    }
})

router.post('/edit', async (req: Request, res: Response) => {
    const {templateId, name} = req.body
    try{
        const editQuery = 'UPDATE user_templates SET template_name = $1 where id = $2'
        await db.query(editQuery, [name, templateId])
        res.status(200).send({message: 'Success !'})
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: 'An error occurred' })
    }
})

router.post('/delete', async (req: Request, res: Response) => {
    const {templateId} = req.body
    try{
        const deleteQuery = 'DELETE from user_templates WHERE id = $1'
        await db.query(deleteQuery, [templateId])
        res.status(200).send({message: 'Success !'})
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: 'An error occurred' })
    }
})

export default router