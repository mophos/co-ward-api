// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
import * as moment from "moment"
import { Router, Request, Response } from 'express';

import { RequestProductModel } from '../../models/request-products';
import { SerialModel } from '../../models/serial';
const serialModel = new SerialModel();

const model = new RequestProductModel();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  let db = req.db;
  let hospitalId = req.decoded.hospitalId
  try {
    let rs: any = await model.getlist(db, hospitalId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/product-types', async (req: Request, res: Response) => {
  let db = req.db;
  try {
    let rs: any = await model.getProductTypes(db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/products', async (req: Request, res: Response) => {
  let db = req.db;
  const typeId = req.query.typeId == '' || req.query.typeId == 'null' ? null : req.query.typeId;
  try {
    let rs: any = await model.getProducts(db, typeId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;