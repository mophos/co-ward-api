// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import * as moment from "moment"
import { Router, Request, Response } from 'express';

import { FullfillModel } from '../../models/fulfill';

const model = new FullfillModel();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  const type = req.query.type;
  try {
    let rs: any = await model.getProducts(req.db, type);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


export default router;