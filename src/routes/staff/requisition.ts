// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import { Router, Request, Response } from 'express';

import { Requisition } from '../../models/requisition';

const model = new Requisition();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  let db = req.db;
  let hospcode = req.decoded.hospcode

  try {
    let rs: any = await model.getlist(db, hospcode);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;