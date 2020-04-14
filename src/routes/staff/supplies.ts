// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import { Router, Request, Response } from 'express';

import { SuppliesModel } from '../../models/supplies';

const suppliesModel = new SuppliesModel();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  const db = req.db;
  const hospitalId = req.decoded.hospitalId;
  try {
    let rs: any = await suppliesModel.getSuppliesStock(db, hospitalId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


router.get('/actived', async (req: Request, res: Response) => {
  try {
    let rs: any = await suppliesModel.getSuppliesActived(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/details/:id', async (req: Request, res: Response) => {
  const db = req.db;
  const id = req.params.id;
  try {
    let rs: any = await suppliesModel.getSuppliesStockDetails(db, id);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const db = req.db;
  const id = req.decoded.id;
  const hospitalId = req.decoded.hospitalId;
  const data = req.body.data;

  try {
    const head: any = {};
    head.date = data.date;
    head.create_by = id;
    head.hospital_id = hospitalId;

    let rs: any = await suppliesModel.saveHead(db, [head]);
    let detail: any = [];
    for (const v of data.items) {
      const objD: any = {};
      objD.wm_supplie_id = rs;
      objD.generic_id = v.generic_id;
      objD.qty = v.qty;
      detail.push(objD);
    }
    await suppliesModel.saveDetail(db, detail);
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;