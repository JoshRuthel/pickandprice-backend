import express from 'express'
import { Request, Response } from 'express'

const router = express.Router()

//Refresh access token using refresh token
router.post('/', async(req: Request, res: Response) => {
    const { refreshToken } = req.body
    const response = refreshToken(refreshToken)
    if(response.error) return res.status(401).send(response)
    res.json(response)
})

export default router