// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import { Router, Request, Response } from 'express';

import { SuppliesModel } from '../../models/supplies';

const suppliesModel = new SuppliesModel();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  try {
    let rs: any = await suppliesModel.getSupplies(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const id: number = req.params.id
  try {
    let rs: any = await suppliesModel.getSuppliesById(req.db, id);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});



export default router;