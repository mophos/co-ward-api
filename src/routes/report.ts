import { ReportModel } from '../models/report';
/// <reference path="../../typings.d.ts" />
import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';

const model = new ReportModel();
const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    let rs: any = await model.getCovidCase(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
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

router.get('/total', async (req: Request, res: Response) => {
  const db = req.db;
  try {
    const z: any = await model.getTotalSupplie(db, 'SUPPLIES');
    res.send({ ok: true, rows: z[0], code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/supplies', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  const query = req.query.query;
  const zone = req.query.zone;

  try {
    let data = [];
    const z: any = await model.getZone(db, query, zone);
    for (const v of z) {
      const rs = await model.getSupplieZone(db, date, query, v.zone_code);
      const obj: any = {};
      obj.zone = v.zone_code;
      obj.detail = rs;
      data.push(obj);
    }
    res.send({ ok: true, rows: data, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/total-zone', async (req: Request, res: Response) => {
  const db = req.db;
  const zone = req.query.zone;
  try {
    const data: any = [];
    const gen: any = await model.getGenerics(db, 'SUPPLIES');
    const pro: any = await model.getProvinceByZone(db, zone);
    for (const v of gen) {
      const obj: any = {};
      obj.generic_name = v.name;
      for (const p of pro) {
        const sum: any = await model.getSumByProvince(db, p.province_code, v.id);
        // obj[p.province_code] = v.name;
        // obj.v.id = v.id;
        // obj.sum = sum[0].sum;
      }

      data.push(obj);
    }
    console.log(data);
    res.send({ ok: true, rows: data, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/hosp', async (req: Request, res: Response) => {
  console.log(req.decoded);
  
  const db = req.db;
  const providerType = req.decoded.providerType;
  const zoneCode = req.decoded.zone_code;
  const type = req.decoded.type;
  const _provinceCode = req.decoded.provinceCode;
  try {
    let zoneCodes = [];
    let provinceCode = null;
    if (type == 'MANAGER') {
      zoneCodes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];
    } else {
      if (providerType == 'ZONE') {
        zoneCodes = [zoneCode];
      } else if (providerType == 'SSJ') {
        zoneCodes = [zoneCode];
        provinceCode = _provinceCode;
      }
    }

    let data: any = [];
    for (const z of zoneCodes) {
      const zone: any = {};
      zone.name = z;
      let provinces: any = [];
      let province: any;
      if (provinceCode) {
        province = await model.getProvinceFromProvinceCode(db, provinceCode);
      } else {
        province = await model.getProvince(db, z);
      }
      for (const p of province) {
        const _province: any = {};
        _province.province_name = p.name_th;
        const hospital: any = await model.getHospital(db, p.code)
        const hosp = [];
        for (const h of hospital) {
          const _hospital: any = {};
          _hospital.province_name = p.name_th;
          const obj = {
            hospital_id: h.id,
            hospcode: h.hospcode,
            hospname: h.hospname
          };
          const gcs: any = await model.getGcs(db, h.id)
          for (const g of gcs) {
            obj[g.gcs_name] = g.count;
          }
          hosp.push(obj);
        }
        _province.hospitals = hosp;
        provinces.push(_province);
      }
      zone.provinces = provinces;
      data.push(zone);
    }
    res.send({ ok: true, rows: data, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;