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

router.get('/hosp-bed', async (req: Request, res: Response) => {
  const db = req.db;

  const provinceCode = req.decoded.provinceCode;
  const zoneCode = req.decoded.zone_code;
  try {
    // console.log(1);

    const bed = await bedModel.getHospBed(db, provinceCode, zoneCode);
    const sum = await bedModel.getSumBed(db, provinceCode, zoneCode);
    const rs = {
      bed, sum
    };
    // console.log(rs);

    res.send({ ok: true, rows: rs, code: 500 });
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

router.post('/bed-save', async (req: Request, res: Response) => {
  const db = req.db;
  const id = req.decoded.id;
  const hospitalId = req.body.hospitalId;
  const data = req.body.data;
  try {
    const head: any = {};
    head.date = moment().format('YYYY-MM_DD');
    head.create_by = id;
    head.hospital_id = hospitalId;
    let rs: any = await bedModel.saveHeadBw(db, [head]);
    await bedModel.removeBeds(db, hospitalId);
    const _data = [];
    let detail: any = [];

    for (const i of data) {
      _data.push({
        hospital_id: hospitalId,
        bed_id: i.bed_id,
        qty: i.qty > 0 ? i.qty : null,
        covid_qty: i.covid_qty > 0 ? i.covid_qty : null,
        spare_qty: i.spare_qty > 0 ? i.spare_qty : null,
        created_by: id
      });

      detail.push({
        wm_bed_id: rs,
        bed_id: i.bed_id,
        qty: i.qty > 0 ? i.qty : null,
        covid_qty: i.covid_qty > 0 ? i.covid_qty : null,
        spare_qty: i.spare_qty > 0 ? i.spare_qty : null
      });
    }
    await bedModel.saveBeds(db, _data);
    await bedModel.saveDetail(db, detail);
    res.send({ ok: true, code: HttpStatus.OK });
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