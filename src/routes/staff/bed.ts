// / <reference path="../../typings.d.ts" />

import { Router, Request, Response } from 'express';
import { BedModel } from '../../models/bed';

import * as HttpStatus from 'http-status-codes';
import * as moment from "moment"

const bedModel = new BedModel();
const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
  const db = req.db;
  const hospcode = req.decoded.hospcode;
  try {
    let rs: any
    rs = await bedModel.getBedStock(db, hospcode);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/save/bed/:date', async (req: Request, res: Response) => {
  const db = req.db;
  const hospcode = req.decoded.hospcode;
  const date = req.params.date;
  const id = req.decoded.id;

  try {
    const obj: any = {};
    obj.created_at = date
    obj.created_by = id;
    obj.hospcode = hospcode;

    let rs: any = await bedModel.saveBed(db, [obj]);
    let beds: any = await bedModel.getBeds(db);
    let data: any = [];
    for (const v of beds) {
      const objD: any = {};
      objD.bed_stock_id = rs;
      objD.bed_id = v.id;
      objD.qty = 0;
      objD.usage = 0;
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
  try {
    let rs: any
    rs = await bedModel.getBedStockDetails(db, id);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/list/bed', async (req: Request, res: Response) => {
  const db = req.db;
  try {
    let rs: any = await bedModel.getBeds(db);
    for (const v of rs) {
      v.qty = 0;
      v.usage = 0;
    }
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
  const hospcode = req.decoded.hospcode;
  const dataD = req.body.data;

  try {
    console.log(dataD);
    
    const objH: any = {};
    objH.created_at = dataD.created_at;
    objH.created_by = id;
    objH.hospcode = hospcode;

    let rs: any = await bedModel.saveBed(db, [objH]);
    let data: any = [];
    for (const v of dataD.items) {
      const objD: any = {};
      objD.bed_stock_id = rs;
      objD.bed_id = v.id;
      objD.qty = v.qty;
      objD.usage = v.usage;
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