// / <reference path="../../typings.d.ts" />

import { Router, Request, Response } from 'express';
import { DrugsModel } from '../../models/drug';

import * as HttpStatus from 'http-status-codes';
import * as moment from "moment"

const drugsModel = new DrugsModel();
const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
  const db = req.db;
  const hospitalId = req.decoded.hospitalId;
  try {
    let rs: any = await drugsModel.getDrugStock(db, hospitalId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/actived', async (req: Request, res: Response) => {
  const db = req.db;
  try {
    let rs: any = await drugsModel.getDrugsActived(db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/details/:id', async (req: Request, res: Response) => {
  const db = req.db;
  const id = req.params.id;
  try {
    let rs: any = await drugsModel.getDrugStockDetails(db, id);
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

    let rs: any = await drugsModel.saveHead(db, [head]);
    let detail: any = [];
    for (const v of data.items) {
      const objD: any = {};
      objD.wm_drug_id = rs;
      objD.generic_id = v.generic_id;
      objD.qty = v.qty;
      detail.push(objD);
    }
    await drugsModel.saveDetail(db, detail);
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;