import { BasicModel } from '../models/basic';
/// <reference path="../../typings.d.ts" />
import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';

const model = new BasicModel();

const router: Router = Router();

router.get('/title', async (req: Request, res: Response) => {
    try {
        let rs: any = await model.getTitles(req.db);
        res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } catch (error) {
        res.send({ ok: false, error: error.message, code: HttpStatus.OK });
    }
});

router.get('/position', async (req: Request, res: Response) => {
    try {
        let rs: any = await model.getPositions(req.db);
        res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } catch (error) {
        res.send({ ok: false, error: error.message, code: HttpStatus.OK });
    }
});

export default router;