// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import { Router, Request, Response } from 'express';
import { ReportModel } from '../../models/report';
import * as moment from 'moment';

const model = new ReportModel();
const router: Router = Router();

router.get('/hosp', async (req: Request, res: Response) => {
  const db = req.db;

  try {
    let data: any = [];
    let hops: any = [];
    const zoneCode = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];
    for (const z of zoneCode) {
      const zone:any = {};
      zone.name = z;
      let provinces: any = [];
      const province: any = await model.getProvince(db, z);
      for (const p of province) {
        const _province:any = {};
        _province.province_name = p.name_th;
        const hospital: any = await model.getHospital(db, p.id)
        const hosp = [];
        for (const h of hospital) {
          const obj = {
            count: h.count,
            gcs_id: h.gcs_id,
            gcs_name: h.gcs_name,
            hospital_id: h.hospital_id,
            hospcode: h.hospcode,
            hospname: h.hospname
          };
          hosp.push(obj);
        }
        _province.hospitals = hosp;
          provinces.push(_province);
        }
      zone.provinces = provinces;
      data.push(zone);
    }
    console.log(data);
    
    res.send({ ok: true, rows: data, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/zone', async (req: Request, res: Response) => {
  const db = req.db;

  try {
    const zoneCode = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];
    const data: any = [];
    for (const v of zoneCode) {
      const obj: any = {};
      const z: any = await model.getZoneHospital(db, v);
      obj.zone = v;
      obj.hospital = z;
      data.push(obj);
    }
    res.send({ ok: true, rows: data, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/covid-case', async (req: Request, res: Response) => {
  const db = req.db;
  try {
    const z: any = await model.getCovidCase(db);
    res.send({ ok: true, rows: z, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/supplies', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  const query = req.query.query;

  try {
    const rs = await model.getSupplie(db, date, query);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;