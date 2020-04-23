// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import { Router, Request, Response } from 'express';
import { BasicModel } from '../../models/basic';
import { SuppliesModel } from '../../models/supplies';
import { CovidCaseModel } from '../../models/covid-case';
import * as moment from 'moment';

const basicModel = new BasicModel();
const suppliesModel = new SuppliesModel();
const covidCaseModel = new CovidCaseModel();
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


router.get('/hospital-center', async (req: Request, res: Response) => {
  const db = req.db;
  const hospitalId = req.decoded.hospitalId;
  const provinceCode = req.decoded.provinceCode;
  try {
    const data: any = [];
    const rs: any = await suppliesModel.getType(db, provinceCode, hospitalId);
    for (const v of rs) {
      const obj: any = {};
      obj.head = v.name;
      obj.hosptype_code = v.hosptype_code;

      const detail: any = [];
      const rsh: any = await suppliesModel.getHospital(db, v.hosptype_code, provinceCode);
      for (const y of rsh) {
        const objd: any = {};
        objd.hospname = y.hospname;
        objd.hospital_id = y.hospital_id;
        objd.hospital_type = y.hospital_type;

        const detailBeds: any = [];
        const detailGcs: any = [];
        const rsd: any = await covidCaseModel.getBeds(db, y.hospital_id, y.hospital_type);
        const rsg: any = await covidCaseModel.getGcs(db, y.hospital_id, y.hospital_type);
        for (const x of rsd) {
          detailBeds.push(x);
          objd.detailBed = detailBeds;
        }
        for (const j of rsg) {
          detailGcs.push(j);
          objd.detailGcs = detailGcs;
        }
        detail.push(objd);
      }
      obj.detail = detail;
      data.push(obj);
    }
    res.send({ ok: true, rows: data, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/actived', async (req: Request, res: Response) => {
  let hospitalId = req.decoded.hospitalId
  try {
    let rs: any = await suppliesModel.getSuppliesLast(req.db, hospitalId);
    console.log(rs);
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
    let rs: any = await suppliesModel.getSuppliesStockDetails(db, id);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const db = req.db;
  const userId = req.decoded.id;
  const hospitalId = req.decoded.hospitalId;
  const data = req.body.data;
  const _timeCut = process.env.TIME_CUT;

  try {
    const timeCut: any = await basicModel.timeCut();
    if (timeCut.ok) {
      const head: any = {};
      head.date = moment().format('YYYY-MM-DD');
      head.create_by = userId;
      head.hospital_id = hospitalId;

      let rs: any = await suppliesModel.saveHead(db, head);
      let id = rs[0].insertId;
      if (!id) {
        const _id = await suppliesModel.getId(db, head);
        id = _id[0].id;
      }

      let detail: any = [];
      for (const v of data) {
        if (v.qty || v.qty == 0) {
          const objD: any = {};
          objD.wm_supplie_id = id;
          objD.generic_id = v.generic_id;
          objD.qty = v.qty;
          objD.month_usage_qty = v.month_usage_qty || null;
          detail.push(objD);
        }
      }
      console.log(detail);

      await suppliesModel.saveDetail(db, detail);
      res.send({ ok: true, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: `ขณะนี้เกินเวลา ${moment(_timeCut).format('HH:mm').toString()} ไม่สามารถบันทึกได้` });
    }
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});
export default router;