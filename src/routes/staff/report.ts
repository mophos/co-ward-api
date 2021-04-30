// / <reference path="../../typings.d.ts" />
const excel4node = require('excel4node');
import * as HttpStatus from 'http-status-codes';
import { Router, Request, Response } from 'express';
import { ReportModel } from '../../models/report';
import { findIndex } from 'lodash';
const path = require('path')
const fse = require('fs-extra');
const model = new ReportModel();
const router: Router = Router();


router.get('/zone', async (req: Request, res: Response) => {
  const db = req.dbReport;

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
  const db = req.dbReport;
  try {
    const z: any = await model.getCovidCase(db);
    res.send({ ok: true, rows: z, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/supplies', async (req: Request, res: Response) => {
  const db = req.dbReport;
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

router.get('/bed', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const date = req.query.date;
  const sector = req.query.sector;
  const provinceCode = req.decoded.provinceCode;
  try {
    const rs: any = await model.beds(db, date, provinceCode);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, message: error, code: HttpStatus.OK });
  }
});

// router.get('/hosp/excel', async (req: Request, res: Response) => {
//   const db = req.dbReport;
//   const providerType = req.decoded.providerType;
//   const zoneCode = req.decoded.zone_code;
//   const type = req.decoded.type;
//   const _provinceCode = req.decoded.provinceCode;
//   try {
//     let zoneCodes = [];
//     let provinceCode = null;
//     if (type == 'MANAGER') {
//       zoneCodes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];
//     } else {
//       if (providerType == 'ZONE') {
//         zoneCodes = [zoneCode];
//       } else if (providerType == 'SSJ') {
//         zoneCodes = [zoneCode];
//         provinceCode = _provinceCode;
//       }
//     }

//     let data: any = [];
//     for (const z of zoneCodes) {
//       const zone: any = {};
//       zone.name = z;
//       let provinces: any = [];
//       let province: any;
//       if (provinceCode) {
//         province = await model.getProvinceFromProvinceCode(db, provinceCode);
//       } else {
//         province = await model.getProvince(db, z);
//       }
//       for (const p of province) {
//         const _province: any = {};
//         _province.province_name = p.name_th;
//         const hospital: any = await model.getHospital(db, p.code)
//         const hosp = [];
//         for (const h of hospital) {
//           const _hospital: any = {};
//           _hospital.province_name = p.name_th;
//           const obj = {
//             hospital_id: h.id,
//             hospcode: h.hospcode,
//             hospname: h.hospname
//           };
//           const gcs: any = await model.getGcs(db, h.id)
//           for (const g of gcs) {
//             obj[g.gcs_name] = g.count;
//           }
//           hosp.push(obj);
//         }
//         _province.hospitals = hosp;
//         provinces.push(_province);
//       }
//       zone.provinces = provinces;
//       data.push(zone);
//     }
//     res.send({ ok: true, rows: data, code: HttpStatus.OK });
//   } catch (error) {
//     console.log(error);
//     res.send({ ok: false, error: error.message, code: HttpStatus.OK });
//   }
// });

router.get('/admit-pui-case', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const providerType = req.decoded.providerType;
  const zoneCode = req.decoded.zone_code;
  const provinceCode = req.decoded.provinceCode;

  try {
    const province = [];
    if (providerType === 'ZONE') {
      const rsp: any = await model.getProvince(db, zoneCode, null);
      for (const v of rsp) {
        province.push(v.code);
      }
    } else if (providerType === 'SSJ') {
      const rsp: any = await model.getProvince(db, null, provinceCode);
      province.push(rsp[0].code);
    }
    const rs: any = await model.admitPuiCaseByProvince(db, province);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/admit-pui-case-summary', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const providerType = req.decoded.providerType;
  const zoneCode = req.decoded.zone_code;
  const provinceCode = req.decoded.provinceCode;
  try {
    const province = [];
    if (providerType === 'ZONE') {
      const rsp: any = await model.getProvince(db, zoneCode, null);
      for (const v of rsp) {
        province.push(v.code);
      }
    } else if (providerType === 'SSJ') {
      const rsp: any = await model.getProvince(db, null, provinceCode);
      province.push(rsp[0].code);
    }
    const rs: any = await model.sumAdmitPuiCaseByProvince(db, province);
    res.send({ ok: true, rows: rs[0], code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/discharge-case', async (req: Request, res: Response) => {

  const providerType = req.decoded.providerType;
  const zoneCode = req.decoded.zone_code;
  const provinceCode = req.decoded.provinceCode;
  const query = req.query.query || null;
  const right = req.decoded.rights;
  const showPersons = findIndex(right, { name: 'MANAGER_REPORT_PERSON' }) > -1 || findIndex(right, { name: 'STAFF_VIEW_PATIENT_INFO' }) > -1 ? true : false;
  try {

    if (providerType === 'ZONE') {
      const rs: any = await model.getCaseDc(req.db, showPersons, query, zoneCode, null);

      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } else if (providerType === 'SSJ') {
      const rs: any = await model.getCaseDc(req.db, showPersons, query, zoneCode, provinceCode);
      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});
export default router;