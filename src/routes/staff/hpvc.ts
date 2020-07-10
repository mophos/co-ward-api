// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
import * as moment from "moment"
import { Router, Request, Response } from 'express';

import { HpvcModel } from '../../models/hpvc';

const model = new HpvcModel();
const router: Router = Router();
const request = require("request");

router.get('/', async (req: Request, res: Response) => {
  try {
    const personId = req.query.personId;
    let rs: any = await model.getList(req.db, personId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/products', async (req: Request, res: Response) => {
  try {
    let rs: any = await model.getProduct(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});



export default router;