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

router.get('/min-max/get-hopsnode', async (req: Request, res: Response) => {
  try {
    let rs: any = await model.getHospNode(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/min-max/get-drug-min-max', async (req: Request, res: Response) => {
  let hospitalId = req.query.hospitalId;
  try {
    let rs: any = await model.getDrugMinMax(req.db, hospitalId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/min-max/save', async (req: Request, res: Response) => {
  const db = req.db;
  const data = req.body.data;
  const hospId = data[0].hospital_id;  

  try {

    await model.removeMinMax(db, hospId);
    await model.saveMinMax(db, data);
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


export default router;