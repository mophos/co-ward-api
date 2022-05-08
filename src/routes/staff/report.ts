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
import { BasicModel } from '../../models/basic';
const basicModel = new BasicModel();


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
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/admit-pui-case/export', async (req: Request, res: Response) => {
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

    let rsSum: any = await model.sumAdmitPuiCaseByProvince(db, province);
    let rsList = await model.admitPuiCaseByProvince(db, province);
    // rsSum = rsSum[0];

    var wb = new excel4node.Workbook();
    var sum = wb.addWorksheet('Sheet 1');
    var list = wb.addWorksheet('รายคน');
    sum.cell(1, 1).string('เขต');
    sum.cell(1, 2).string('รวม');
    sum.cell(1, 3).string('ระดับ 3 ใส่ท่อและเครื่องช่วยหายใจได้');
    sum.cell(1, 4).string('ระดับ 2.2 Oxygen high flow');
    sum.cell(1, 5).string('ระดับ 2.1 Oxygen low flow');
    sum.cell(1, 6).string('ระดับ 1 ไม่ใช้ Oxygen');
    sum.cell(1, 7).string('ระดับ 0 Home Isolation (stepdown)');
    sum.cell(1, 8).string('Home Isolation (New case)');
    sum.cell(1, 9).string('Community Isolation (New case)');
    sum.cell(1, 10).string('invasive');
    sum.cell(1, 11).string('noninvasive');
    sum.cell(1, 12).string('high flow');
    sum.cell(1, 13).string('Favipiravir');
    sum.cell(1, 14).string('Casirivimab and imdevimab');
    sum.cell(1, 15).string('Molnupiravir');
    let rowSum = 2;
    for (const h of rsSum) {
      sum.cell(rowSum, 1).number(Number(+h.zone_code || 0));
      sum.cell(rowSum, 2).number(Number(h.pui || 0));
      sum.cell(rowSum, 3).number(Number(h.lv3 || 0));
      sum.cell(rowSum, 4).number(Number(h.lv22 || 0));
      sum.cell(rowSum, 5).number(Number(h.lv21 || 0));
      sum.cell(rowSum, 6).number(Number(h.lv1 || 0));
      sum.cell(rowSum, 7).number(Number(h.lv0 || 0));
      sum.cell(rowSum, 8).number(Number(h.home_isolation || 0));
      sum.cell(rowSum, 9).number(Number(h.community_isolation || 0));
      sum.cell(rowSum, 10).number(Number(h.invasive || 0));
      sum.cell(rowSum, 11).number(Number(h.noninvasive || 0));
      sum.cell(rowSum, 12).number(Number(h.high_flow || 0));
      sum.cell(rowSum, 13).number(Number(h.d8 || 0));
      sum.cell(rowSum, 14).number(Number(h.d26 || 0));
      sum.cell(rowSum, 15).number(Number(h.d27 || 0));
      rowSum++;
    }

    list.cell(1, 1).string('เขต');
    list.cell(1, 2).string('จังหวัด');
    list.cell(1, 3).string('โรงพยาบาล');
    list.cell(1, 4).string('HN/AN');
    list.cell(1, 5).string('SAT ID');
    list.cell(1, 6).string('วันที่ ADMIT');
    list.cell(1, 7).string('ความรุนแรง');
    list.cell(1, 8).string('เตียง');
    list.cell(1, 9).string('เครื่องช่วยหายใจ');
    list.cell(1, 10).string('วันที่บันทึกล่าสุด');
    list.cell(1, 11).string('ไม่ได้บันทึกมา');
    let rowList = 2;
    for (const h of rsList) {
      list.cell(rowList, 1).string(h['zone_code'] || '');
      list.cell(rowList, 2).string(h['province_name'] || '');
      list.cell(rowList, 3).string(h['hospname'] || '');
      list.cell(rowList, 4).string(h['hn'] + '/' + h['an'] || '');
      list.cell(rowList, 5).string(h['sat_id'] || '');
      list.cell(rowList, 6).string(moment(h['date_admit']).format('DD-MM-YYYY'));
      list.cell(rowList, 7).string(h['gcs_name'] || '');
      list.cell(rowList, 8).string(h['bed_name'] || '');
      list.cell(rowList, 9).string(h['medical_supplies_name'] || '');
      list.cell(rowList, 10).string(moment(h['updated_entry_last']).format('DD-MM-YYYY'));
      list.cell(rowList, 11).string(h['days'] + ' วัน');
      rowList++;
    }

    fse.ensureDirSync(process.env.TMP_PATH);
    let filename = `cio_check` + moment().format('x') + '.xlsx'
    let filenamePath = path.join(process.env.TMP_PATH, filename);
    wb.write(filenamePath, function (err, stats) {
      if (err) {
        console.error(err);
        fse.removeSync(filenamePath);
        res.send({ ok: false, error: err })
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + filename);
        res.sendfile(filenamePath, (v) => {
          fse.removeSync(filenamePath);
        })

      }
    });

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
      const rs: any = await model.getCaseDc(req.dbReport, showPersons, query, zoneCode, null);

      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } else if (providerType === 'SSJ') {
      const rs: any = await model.getCaseDc(req.dbReport, showPersons, query, zoneCode, provinceCode);
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
    console.time('query')
    if (providerType === 'ZONE') {
      rs = await model.getCaseDc(req.dbReport, showPersons, query, zoneCode, null);
    } else if (providerType === 'SSJ') {
      rs = await model.getCaseDc(req.dbReport, showPersons, query, zoneCode, provinceCode);
    }
    console.timeEnd('query')
    console.time('loop')
    if (showPersons) {
      ws.cell(1, 1, 1, 1, true).string('จังหวัด');
      ws.cell(1, 2, 1, 2, true).string('โรงพยาบาล');
      ws.cell(1, 3, 1, 3, true).string('HN');
      ws.cell(1, 4, 1, 4, true).string('AN');
      ws.cell(1, 5, 1, 5, true).string('CID');
      ws.cell(1, 6, 1, 6, true).string('ชื่อ-นามสกุล');
      ws.cell(1, 7, 1, 7, true).string('เพศ');
      ws.cell(1, 8, 1, 8, true).string('อายุ');
      ws.cell(1, 9, 1, 9, true).string('สถานะ');
      ws.cell(1, 10, 1, 10, true).string('วันที่ Admit');
      ws.cell(1, 11, 1, 11, true).string('วันที่ d/c');
      ws.cell(1, 12, 1, 12, true).string('โรงพยาบาลที่ Refer');
    } else {
      ws.cell(1, 1, 1, 1, true).string('จังหวัด');
      ws.cell(1, 2, 1, 2, true).string('โรงพยาบาล');
      ws.cell(1, 3, 1, 3, true).string('HN');
      ws.cell(1, 4, 1, 4, true).string('สถานะ');
      ws.cell(1, 5, 1, 5, true).string('วันที่ Admit');
      ws.cell(1, 6, 1, 6, true).string('วันที่ d/c');
      ws.cell(1, 7, 1, 7, true).string('โรงพยาบาลที่ Refer');
    }

    if (showPersons) {
      let row = 2
      for (const items of rs) {
        items.age = items.age === null ? "" : items.age.toString();
        items.date_admit = moment(items.date_admit).format('DD/MM/YYYY');
        items.date_discharge = moment(items.date_discharge).format('DD/MM/YYYY');
        ws.cell(row, 1).string(items['hosp_province'] || '');
        ws.cell(row, 2).string(items['hospname'] || '');
        ws.cell(row, 3).string(items['hn']);
        ws.cell(row, 4).string(items['an'] || '');
        ws.cell(row, 5).string(items['cid'] || '');
        ws.cell(row, 6).string((items['title_name']) + ' ' + (items['first_name']) + ' ' + (items['last_name']));
        ws.cell(row, 7).string(items['gender']);
        ws.cell(row, 8).string(items['age']);
        ws.cell(row, 9).string(items['status']);
        ws.cell(row, 10).string(items['date_admit']);
        ws.cell(row, 11).string(items['date_discharge']);
        ws.cell(row++, 12).string(items['refer_hospital_name'] || '');
      }
    } else {
      let row = 2
      for (const items of rs) {
        items.date_admit = moment(items.date_admit).format('DD/MM/YYYY');
        items.date_discharge = moment(items.date_discharge).format('DD/MM/YYYY');
        ws.cell(row, 1).string(items['hosp_province'] || '');
        ws.cell(row, 2).string(items['hospname'] || '');
        ws.cell(row, 3).string(items['hn']);
        ws.cell(row, 4).string(items['status']);
        ws.cell(row, 5).string(items['date_admit']);
        ws.cell(row, 6).string(items['date_discharge']);
        ws.cell(row++, 7).string(items['refer_hospital_name'] || '');
      }
    }
    console.timeEnd('loop')
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
        res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
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


router.get('/present-case-status/excel', async (req: Request, res: Response) => {
  const hospitalId = req.decoded.hospitalId;
  const hospitalType = req.decoded.hospitalType;
  try {
    const wb = new excel4node.Workbook();
    const ws = wb.addWorksheet('Sheet 1');

    ws.cell(1, 1).string('HN');
    ws.cell(1, 2).string('ชื่อ');
    ws.cell(1, 3).string('อัพเดทล่าสุด');
    ws.cell(1, 4).string('ความรุนแรง');
    ws.cell(1, 5).string('เตียง');
    ws.cell(1, 6).string('เครื่องช่วยหายใจ');
    ws.cell(1, 7).string('Favipiravir');

    const rs: any = await model.getCasePresent(req.dbReport, hospitalId);

    const gcs = await basicModel.getGCS(req.db);
    const ba = await basicModel.getBedAdmin(req.db);
    const ms = await basicModel.getMedicalSupplies(req.dbReport, hospitalType);
    console.log(JSON.stringify(ms));
    console.log(JSON.stringify(rs[11]));
    ms.push({ id: 'not use', name: 'ไม่ใช้งาน' });
    const findObj = (find, arr) => {
      const index = arr.findIndex(v => v.id == find);
      if (index > -1) {
        return arr[index].name;
      } else {
        return 'ไม่พบข้อมูล';
      }
    };

    let row = 2;
    for (const items of rs) {
      items.updated_date = moment(items.updated_date).isValid() ? moment(items.updated_date).format('DD/MM/YYYY HH:mm:ss') : '-';
      items.set4 = items.set4 === 8 ? 'ใช้' : 'ไม่ใช้';
      ws.cell(row, 1).string(items['hn']);
      ws.cell(row, 2).string((items['title_name']) + ' ' + (items['first_name']) + ' ' + (items['last_name']));
      ws.cell(row, 3).string(items['updated_date']);
      ws.cell(row, 4).string(await findObj(items['gcs_id'], gcs));
      ws.cell(row, 5).string(await findObj(items['bed_id'], ba));
      ws.cell(row, 6).string(await findObj(items['medical_supplie_id'], ms));
      ws.cell(row++, 7).string(items['set4']);
    }

    fse.ensureDirSync(process.env.TMP_PATH);
    const filename = `report1` + moment().format('x');
    const filenamePath = path.join(process.env.TMP_PATH, filename + '.xlsx');
    wb.write(filenamePath, function (err, stats) {
      if (err) {
        console.error(err);
        fse.removeSync(filenamePath);
        res.send({ ok: false, error: err })
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
        res.sendfile(filenamePath, (v) => {
          // fse.removeSync(filenamePath);
        });
      }
    });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/all-case-hosp/excel', async (req: Request, res: Response) => {
  const providerType = req.decoded.providerType;
  const zoneCode = req.decoded.zone_code;
  const provinceCode = req.decoded.provinceCode;
  const query = req.query.query || null;
  const rights = req.decoded.rights;
  const hospitalId = req.decoded.hospitalId;

  const wb = new excel4node.Workbook();
  const ws = wb.addWorksheet('Sheet 1');

  try {
    let rs: any;
    if (providerType === 'ZONE') {
      rs = await model.getCaseAllHosp(req.dbReport, zoneCode, null, null);
    } else if (providerType === 'SSJ') {
      rs = await model.getCaseAllHosp(req.dbReport, zoneCode, provinceCode, null);
    } else {
      rs = await model.getCaseAllHosp(req.dbReport, zoneCode, provinceCode, hospitalId);
    }

    ws.cell(1, 1).string('CID');
    ws.cell(1, 2).string('PASSPORT');
    ws.cell(1, 3).string('นำหน้าชื่อ');
    ws.cell(1, 4).string('ชื่อ');
    ws.cell(1, 5).string('ชื่อกลาง');
    ws.cell(1, 6).string('นามสกุล');
    ws.cell(1, 7).string('เพศ');
    ws.cell(1, 8).string('วันเกิด');
    ws.cell(1, 9).string('เบอร์');
    ws.cell(1, 10).string('ที่อยู่');
    ws.cell(1, 11).string('ตำบล');
    ws.cell(1, 12).string('อำเภอ');
    ws.cell(1, 13).string('จังหวัด');
    ws.cell(1, 14).string('รหัสไปรษณี');
    ws.cell(1, 15).string('ประเภทบุคคล');
    ws.cell(1, 16).string('สถานะ');
    ws.cell(1, 17).string('confirm_date');
    ws.cell(1, 18).string('date_admit');
    ws.cell(1, 19).string('date_discharge');
    ws.cell(1, 20).string('HN');
    ws.cell(1, 21).string('AN');
    ws.cell(1, 22).string('โรงพยาบาล');
    ws.cell(1, 23).string('updated_date');
    ws.cell(1, 24).string('data_source');

    let row = 2;
    for (const item of rs) {
      item.date_admit = moment(item.date_admit).isValid() ? moment(item.date_admit).format('DD/MM/YYYY') : '';
      item.confirm_date = moment(item.confirm_date).isValid() ? moment(item.confirm_date).format('DD/MM/YYYY') : '';
      item.date_discharge = moment(item.date_discharge).isValid() ? moment(item.date_discharge).format('DD/MM/YYYY') : '';
      item.birth_date = moment(item.birth_date).isValid() ? moment(item.birth_date).format('DD/MM/YYYY') : '';
      item.updated_date = moment(item.updated_date).isValid() ? moment(item.updated_date).format('DD/MM/YYYY HH:mm:ss') : '';
      ws.cell(row, 1).string(item.cid || '');
      ws.cell(row, 2).string(item.passport || '');
      ws.cell(row, 3).string(item.title_name || '');
      ws.cell(row, 4).string(item.first_name || '');
      ws.cell(row, 5).string(item.middle_name || '');
      ws.cell(row, 6).string(item.last_name || '');
      ws.cell(row, 7).string(item.sex || '');
      ws.cell(row, 8).string(item.birth_date || '');
      ws.cell(row, 9).string(item.telephone || '');
      ws.cell(row, 10).string((item.house_no || '') + ' ' + (item.room_no || '') + ' ' + (item.village_name || '') + ' ' + (item.road || ''));
      ws.cell(row, 11).string(item.tambon_name || '');
      ws.cell(row, 12).string(item.ampur_name || '');
      ws.cell(row, 13).string(item.province_name || '');
      ws.cell(row, 14).string(item.zipcode || '');
      ws.cell(row, 15).string(item.people_types || '');
      ws.cell(row, 16).string(item.status || '');
      ws.cell(row, 17).string(item.confirm_date || '');
      ws.cell(row, 18).string(item.date_admit || '');
      ws.cell(row, 19).string(item.date_discharge || '');
      ws.cell(row, 20).string(item.hn || '');
      ws.cell(row, 21).string(item.an || '');
      ws.cell(row, 22).string(item.hospname || '');
      ws.cell(row, 23).string(item.updated_date || '');
      ws.cell(row++, 24).string(item.data_source || '');
    }

    fse.ensureDirSync(process.env.TMP_PATH);

    const filename = `report1` + moment().format('x');
    const filenamePath = path.join(process.env.TMP_PATH, filename + '.xlsx');
    wb.write(filenamePath, function (err, stats) {
      if (err) {
        console.error(err);
        fse.removeSync(filenamePath);
        res.send({ ok: false, error: err })
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
        res.sendfile(filenamePath, (v) => {
          // fse.removeSync(filenamePath);
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error });
  }
});

export default router;