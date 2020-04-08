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

router.get('/save/bed', async (req: Request, res: Response) => {
  const db = req.db;
  const hospcode = req.decoded.hospcode;
  const id = req.decoded.id;

  try {
    const obj: any = {};
    obj.created_at = moment().format('YYYY-MM-DD HH:m:s');
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

    res.send({ ok: true, rows: rss, code: HttpStatus.OK });
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
  const data = req.body.data;
  const bedId = req.body.id;

  try {
    for (const v of data) {
      const obj: any = {};
      obj.qty = v.qty;
      obj.usage = v.usage;
      await bedModel.updateBedDetail(db, v.id, obj);
    }

    await bedModel.updateBeds(db, bedId, { updated_by: id });
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;