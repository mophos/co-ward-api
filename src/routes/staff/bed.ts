// / <reference path="../../typings.d.ts" />

import { Router, Request, Response } from 'express';
import { BedModel } from '../../models/bed';

import * as HttpStatus from 'http-status-codes';
import * as moment from "moment"

const bedModel = new BedModel();
const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
  const db = req.db;
  const hospitalId = req.decoded.hospitalId;
  try {
    let rs = await bedModel.getBedStock(db, hospitalId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/save/bed/:date', async (req: Request, res: Response) => {
  const db = req.db;
  const hospcode = req.decoded.hospcode;
  const hospitalId = req.decoded.hospitalId;
  const date = req.params.date;
  const id = req.decoded.id;

  try {
    const obj: any = {};
    obj.created_at = date
    obj.created_by = id;
    obj.hospcode = hospcode;

    let rs: any = await bedModel.saveBed(db, [obj]);
    let beds: any = await bedModel.getBeds(db, hospitalId);
    let data: any = [];
    for (const v of beds) {
      const objD: any = {};
      objD.bed_stock_id = rs;
      objD.bed_id = v.id;
      objD.qty_total = 0;
      objD.qty = 0;
      data.push(objD);
    }
    let rss: any = await bedModel.saveDetail(db, data);

    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const db = req.db;
  const id = req.params.id;
  const hospitalId = req.decoded.hospitalId;
  try {
    let rs: any = await bedModel.getBedStockDetails(db, id, hospitalId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/list/bed', async (req: Request, res: Response) => {
  const db = req.db;
  const hospitalId = req.decoded.hospitalId;
  try {
    let rs: any = await bedModel.getBeds(db, hospitalId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/check-bed', async (req: Request, res: Response) => {
  const provinceCode = req.decoded.provinceCode;

  try {
    let rs = await bedModel.checkBed(req.db, provinceCode);

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
  const dataD = req.body.data;

  try {
    console.log(dataD);

    const objH: any = {};
    objH.date = dataD.created_at;
    objH.create_by = id;
    objH.hospital_id = hospitalId;

    let rs: any = await bedModel.saveBed(db, [objH]);
    let data: any = [];
    for (const v of dataD.items) {
      const objD: any = {};
      objD.wm_bed_id = rs;
      objD.bed_id = v.bed_id;
      objD.qty = v.qty;
      data.push(objD);
    }
    await bedModel.saveDetail(db, data);
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;