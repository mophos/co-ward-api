// / <reference path="../../typings.d.ts" />
const excel4node = require('excel4node');
import * as HttpStatus from 'http-status-codes';
import { Router, Request, Response } from 'express';
import { ReportModel } from '../../models/report';
import { findIndex, sumBy } from 'lodash';
const path = require('path')
const fse = require('fs-extra');
const model = new ReportModel();
const router: Router = Router();
import moment = require('moment');


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


router.get('/discharge-case/excel', async (req: Request, res: Response) => {
  const providerType = req.decoded.providerType;
  const zoneCode = req.decoded.zone_code;
  const provinceCode = req.decoded.provinceCode;
  const query = req.query.query || null;
  const rights = req.decoded.rights;
  const showPersons = findIndex(rights, { name: 'MANAGER_REPORT_PERSON' }) > -1 || findIndex(rights, { name: 'STAFF_VIEW_PATIENT_INFO' }) > -1 ? true : false;
  var wb = new excel4node.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  var center = wb.createStyle({
    alignment: {
      wrapText: true,
      horizontal: 'center',
    },
  });
  var right = wb.createStyle({
    alignment: {
      wrapText: true,
      horizontal: 'right',
    },
  });

  try {
    let rs: any
    if (providerType === 'ZONE') {
      rs = await model.getCaseDc(req.db, showPersons, query, zoneCode, null);

    } else if (providerType === 'SSJ') {
      rs = await model.getCaseDc(req.db, showPersons, query, zoneCode, provinceCode);
    }

    ws.cell(1, 1, 1, 1, true).string('จังหวัด');
    ws.cell(1, 2, 1, 2, true).string('โรงพยาบาล');
    ws.cell(1, 3, 1, 3, true).string('HN');
    ws.cell(1, 4, 1, 4, true).string('ชื่อ-นามสกุล');
    ws.cell(1, 5, 1, 5, true).string('วันที่ Admit');
    ws.cell(1, 6, 1, 6, true).string('สถานะ');
    ws.cell(1, 7, 1, 7, true).string('วันที่ d/c');

    let row = 2
    for (const items of rs) {
      items.date_admit = moment(items.date_admit).format('DD/MM/YYYY');
      items.date_discharge = moment(items.date_discharge).format('DD/MM/YYYY');
      ws.cell(row, 1).string(items['province_name']);
      ws.cell(row, 2).string(items['hospname']);
      ws.cell(row, 3).string(items['hn']);
      ws.cell(row, 4).string((items['title_name']) + ' ' + (items['first_name']) + ' ' + (items['last_name']));
      ws.cell(row, 5).string(items['date_admit']);
      ws.cell(row, 6).string(items['status']);
      ws.cell(row++, 7).string(items['date_discharge']);
    }

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `report1` + moment().format('x');
    let filenamePath = path.join(process.env.TMP_PATH, filename + '.xlsx');
    wb.write(filenamePath, function (err, stats) {
      if (err) {
        console.error(err);
        fse.removeSync(filenamePath);
        res.send({ ok: false, error: err })
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + filename);
        res.sendfile(filenamePath, (v) => {
          // fse.removeSync(filenamePath);
        })
      }
    });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error });
  }
});


export default router;