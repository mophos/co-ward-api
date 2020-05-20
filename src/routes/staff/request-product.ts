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

router.get('/details/:id', async (req: Request, res: Response) => {
  const db = req.db;
  const id = req.params.id;

  try {
    let rs: any = await model.getlistDetails(db, id);
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

router.post('/', async (req: Request, res: Response) => {
  let db = req.db;
  const data = req.body.data;
  const hospitalId = req.decoded.hospitalId;
  const userId = req.decoded.id;

  try {
    const h: any = {};
    h.code = await serialModel.getSerial(req.db, 'RP');
    h.hospital_id = hospitalId;
    h.created_by = userId;
    const requestId = await model.save(db, h);

    const _data: any = [];
    for (const v of data) {
      const d: any = {};
      d.request_id = requestId[0];
      d.product_id = v.product_id;
      d.qty = v.qty;
      d.created_by = userId;
      _data.push(d);
    }
    await model.saveDetails(db, _data);

    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;