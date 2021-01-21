import { ReportModel } from '../models/report';
/// <reference path="../../typings.d.ts" />
import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';

import { filter, map, findIndex, orderBy, uniqBy, groupBy, countBy } from 'lodash';
import moment = require('moment');
import { FullfillModel } from '../models/fulfill';
import { DrugsModel } from '../models/drug';
import { SuppliesModel } from '../models/supplies';
import * as _ from 'lodash';
const excel4node = require('excel4node');
const path = require('path')
const fse = require('fs-extra');
const model = new ReportModel();
const fullfillModel = new FullfillModel();
const drugsModel = new DrugsModel();
const suppliesModel = new SuppliesModel();
const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    let rs: any = await model.getCovidCase(req.dbReport);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

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

router.get('/total', async (req: Request, res: Response) => {
  const db = req.dbReport;
  try {
    const z: any = await model.getTotalSupplie(db, 'SUPPLIES');
    res.send({ ok: true, rows: z[0], code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/records', async (req: Request, res: Response) => {
  const db = req.dbReport;
  try {
    const rs: any = await model.getPersonTime(db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/supplies', async (req: Request, res: Response) => {
  const db = req.dbReport;
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
  const db = req.dbReport;
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

router.get('/get-gcs-admit', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const providerType = req.decoded.providerType;
  const zoneCode = req.decoded.zone_code;
  const type = req.decoded.type;
  const _provinceCode = req.decoded.provinceCode;
  const date = req.query.date;
  const zone = req.query.zone;

  try {
    let zoneCodes = [];
    let provinceCode = null;
    if (type == 'MANAGER') {
      if (zone) {
        zoneCodes = [zone];
      } else {
        zoneCodes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];
      }
    } else {
      if (providerType == 'ZONE') {
        zoneCodes = [zoneCode];
      } else if (providerType == 'SSJ') {
        zoneCodes = [zoneCode];
        provinceCode = _provinceCode;
      }
    }
    const gcs: any = await model.getGcsAdmit(db, date)
    let data: any = [];
    for (const z of zoneCodes) {
      const zone: any = {};
      zone.name = z;
      let provinces: any = [];
      let province: any;
      if (provinceCode) {
        province = await model.getProvince(db, null, provinceCode);
      } else {
        province = await model.getProvince(db, z, null);
      }
      const hospital: any = await model.getHospitalAll(db)
      let sumProvince = 0;
      let severe = 0;

      for (const p of province) {
        const _province: any = {};
        _province.province_name = p.name_th;
        const s = filter(hospital, { province_code: p.code })
        const hosp = [];
        let severe = 0;
        let moderate = 0;
        let mild = 0;
        let ippui = 0;
        let asymptomatic = 0;
        for (const h of s) {
          const _hospital: any = {};
          _hospital.province_name = p.name_th;
          const _gcs = filter(gcs, { hospital_id: h.id })
          if (_gcs.length) {
            const obj: any = {
              hospital_id: h.id,
              hospcode: h.hospcode,
              hospname: h.hospname,
              count: _gcs[0].count,
              countCase: _gcs[0].countCase,
              severe: _gcs[0].severe,
              moderate: _gcs[0].moderate,
              mild: _gcs[0].mild,
              ip_pui: _gcs[0].ip_pui,
              asymptomatic: _gcs[0].asymptomatic
            };
            sumProvince += _gcs[0].count
            severe += _gcs[0].severe
            moderate += _gcs[0].moderate
            mild += _gcs[0].mild
            ippui += _gcs[0].ip_pui
            asymptomatic += _gcs[0].asymptomatic

            hosp.push(obj);
          }
        }
        _province.hospitals = hosp;
        _province.moderate = moderate;
        _province.mild = mild;
        _province.ip_pui = ippui;
        _province.asymptomatic = asymptomatic;
        provinces.push(_province);
      }
      zone.severe
      zone.sum = sumProvince;
      zone.provinces = provinces;
      data.push(zone);
    }
    res.send({ ok: true, rows: data, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/get-gcs', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const providerType = req.decoded.providerType;
  const zoneCode = req.decoded.zone_code;
  const type = req.decoded.type;
  const _provinceCode = req.decoded.provinceCode;
  const date = req.query.date;
  const zone = req.query.zone;

  try {
    let zoneCodes = [];
    let provinceCode = null;
    if (type == 'MANAGER') {
      if (zone) {
        zoneCodes = [zone];
      } else {
        zoneCodes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];
      }
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
        province = await model.getProvince(db, null, provinceCode);
      } else {
        province = await model.getProvince(db, z, null);
      }

      // const hospital: any = await model.getHospital(db)
      // let sumProvince = 0;
      // let severe = 0;
      const gcs: any = await model.getHeadGcs(db, date, map(province, 'code'));
      const patient: any = await model.getGcs(db, date);
      for (const p of province) {
        const _province: any = {};
        _province.province_name = p.name_th;

        let severe = 0;
        let moderate = 0;
        let mild = 0;
        let ippui = 0;
        let asymptomatic = 0;
        const s = filter(gcs, { province_code: p.code })
        console.log(s);

        for (const i of s) {
          severe += i.severe;
          moderate += i.moderate;
          mild += i.mild;
          ippui += i.ip_pui;
          asymptomatic += i.asymptomatic;
          const p = filter(patient, { hospital_id: i.hospital_id })
          i.details = p;
        }
        // const hosp = [];
        _province.hospitals = s;
        // _province.hospitals = hosp;
        _province.severe = severe;
        _province.moderate = moderate;
        _province.mild = mild;
        _province.ip_pui = ippui;
        _province.asymptomatic = asymptomatic;
        _province.count = +asymptomatic + +ippui + +mild + +moderate + +severe;
        provinces.push(_province);
      }
      // zone.severe
      // zone.sum = sumProvince;
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

router.get('/get-medicals', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const providerType = req.decoded.providerType;
  const zoneCode = req.decoded.zone_code;
  const type = req.decoded.type;
  const provinceCode = req.decoded.provinceCode;
  const zone = req.query.zone;

  try {
    let rows: any;
    let zoneCodes: any = [];
    const rs = await model.getMedicalCross(db);
    if (type == 'MANAGER') {
      if (zone !== '') {
        zoneCodes = [zone];
        rows = filter(rs, { 'zone_code': zone });
      } else {
        zoneCodes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];
        rows = rs;
      }
    } else {
      if (providerType == 'ZONE') {
        zoneCodes = [zoneCode];
        rows = filter(rs, { 'zone_code': zoneCode });
      } else {
        rows = filter(rs, { 'province_code': provinceCode });
        zoneCodes = [rows[0].zone_code]
      }
    }
    let data: any = [];
    for (const v of zoneCodes) {
      const obj: any = {};
      obj.zone_code = v;
      const provinces = uniqBy(orderBy(filter(rows, { 'zone_code': v }), 'province_code', 'asc'), 'province_name');
      let dataP: any = [];
      for (const p of provinces) {
        const objP: any = {};
        objP.province_code = p.province_code;
        objP.province_name = p.province_name;
        objP.hospitals = orderBy(filter(rows, { 'province_name': p.province_name }), 'hospital_name', 'asc');
        dataP.push(objP);
      }
      obj.provinces = dataP;
      data.push(obj)
    }

    res.send({ ok: true, rows: data, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/medical-supplies', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const providerType = req.decoded.providerType;
  const zoneCode = req.decoded.zone_code;
  const type = req.decoded.type;
  const provinceCode = req.decoded.provinceCode;
  const zone = req.query.zone;

  try {
    let rows: any;
    let zoneCodes: any = [];
    const rs = await model.getMedicals(db);
    if (type == 'MANAGER') {
      if (zone !== '') {
        zoneCodes = [zone];
        rows = filter(rs, { 'zone_code': zone });
      } else {
        zoneCodes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];
        rows = rs;
      }
    } else {
      if (providerType == 'ZONE') {
        zoneCodes = [zoneCode];
        rows = filter(rs, { 'zone_code': zoneCode });
      } else {
        rows = filter(rs, { 'province_code': provinceCode });
        zoneCodes = [rows[0].zone_code]
      }
    }
    let data: any = [];
    for (const v of zoneCodes) {
      const obj: any = {};
      obj.zone_code = v;
      const provinces = uniqBy(orderBy(filter(rows, { 'zone_code': v }), 'province_code', 'asc'), 'province_name');
      let dataP: any = [];
      for (const p of provinces) {
        const objP: any = {};
        objP.province_code = p.province_code;
        objP.province_name = p.province_name;
        objP.hospitals = orderBy(filter(rows, { 'province_name': p.province_name }), 'hospital_name', 'asc');
        dataP.push(objP);
      }
      obj.provinces = dataP;
      data.push(obj)
    }

    res.send({ ok: true, rows: data, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/admin/get-bed', async (req: Request, res: Response) => {
  const db = req.dbReport;

  try {
    const hospital: any = await model.getHospitalByType(db);
    const hosp = [];
    const bed: any = await model.getBad(db)
    for (const h of hospital) {
      const obj = {
        hospital_id: h.id,
        hospcode: h.hospcode,
        hospname: h.hospname
      };
      const _bed = filter(bed, { hospital_id: h.id })
      for (const b of _bed) {
        obj[b.bed_name + '_qty'] = b.qty;
        obj[b.bed_name + '_covid_qty'] = b.covid_qty;
        obj[b.bed_name + '_usage_qty'] = b.usage_qty;
      }
      hosp.push(obj);
    }
    res.send({ ok: true, rows: hosp, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, message: error, code: HttpStatus.OK });
  }
});

router.get('/get-bed/excel', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const date = req.query.date;
  const provinceCode = req.decoded.provinceCode;
  const providerType = req.decoded.providerType;
  const zoneCode = req.decoded.zone_code;

  try {
    var wb = new excel4node.Workbook();
    const bed: any = await model.getBadExcel(db, date);
    console.log(bed);
    const hospital: any = await model.getHospital(db);
    if (providerType === 'ZONE') {
      const province = await model.getProvince(db, zoneCode, null);
      for (let v = 0; v < province.length; v++) {
        var ws = wb.addWorksheet(`${province[v].name_th}`);

        ws.cell(1, 1).string('รหัสโรงพยาบาล');
        ws.cell(1, 2).string('โรงพยาบาล');
        ws.cell(1, 3).string('AIIR ทั้งหมด');
        ws.cell(1, 4).string('AIIR ใช้ไปแล้ว');
        ws.cell(1, 5).string('AIIR คงเหลือ');
        ws.cell(1, 6).string('Modified AIIR ทั้งหมด');
        ws.cell(1, 7).string('Modified AIIR ใช้ไปแล้ว');
        ws.cell(1, 8).string('Modified AIIR คงเหลือ');
        ws.cell(1, 9).string('Isolate ทั้งหมด');
        ws.cell(1, 10).string('Isolate ใช้ไปแล้ว');
        ws.cell(1, 11).string('Isolate คงเหลือ');
        ws.cell(1, 12).string('Cohort ทั้งหมด');
        ws.cell(1, 13).string('Cohort ใช้ไปแล้ว');
        ws.cell(1, 14).string('Cohort คงเหลือ');
        ws.cell(1, 15).string('Hospitel ทั้งหมด');
        ws.cell(1, 16).string('Hospitel ใช้ไปแล้ว');
        ws.cell(1, 17).string('Hospitel คงเหลือ');

        const _hosp = filter(hospital, { province_code: province[v].code });
        let row = 2;
        const hosp = [];
        for (const h of _hosp) {
          const obj = {
            hospital_id: h.id,
            hospcode: h.hospcode,
            hospname: h.hospname
          };
          const _bed = filter(bed, { id: h.id });

          for (const b of _bed) {
            obj[b.bed_name + '_qty'] = b.qty;
            obj[b.bed_name + '_covid_qty'] = b.covid_qty;
            obj[b.bed_name + '_usage_qty'] = b.usage_qty;
          }
          hosp.push(obj);
        }
        for (const h of hosp) {
          ws.cell(row, 1).string(h.hospcode.toString());
          ws.cell(row, 2).string(h.hospname);

          ws.cell(row, 3).string(toString(h['aiir_qty']));
          ws.cell(row, 4).string(toString(h['aiir_usage_qty']));
          ws.cell(row, 5).string(toString(h['aiir_qty'] - h['aiir_usage_qty']));

          ws.cell(row, 6).string(toString(h['modified_aiir_qty']));
          ws.cell(row, 7).string(toString(h['modified_aiir_usage_qty']));
          ws.cell(row, 8).string(toString(h['modified_aiir_qty'] - h['modified_aiir_usage_qty']));

          ws.cell(row, 9).string(toString(h['isolate_qty']));
          ws.cell(row, 10).string(toString(h['isolate_usage_qty']));
          ws.cell(row, 11).string(toString(h['isolate_qty'] - h['isolate_usage_qty']));

          ws.cell(row, 12).string(toString(h['cohort_qty']));
          ws.cell(row, 13).string(toString(h['cohort_usage_qty']));
          ws.cell(row, 14).string(toString(h['cohort_qty'] - h['cohort_usage_qty']));

          ws.cell(row, 15).string(toString(h['hospitel_qty']));
          ws.cell(row, 16).string(toString(h['hospitel_usage_qty']));
          ws.cell(row, 17).string(toString(h['hospitel_qty'] - h['hospitel_usage_qty']));
          row++;
        }
      }
    } else {
      var ws = wb.addWorksheet('Sheet 1');

      ws.cell(1, 1).string('รหัสโรงพยาบาล');
      ws.cell(1, 2).string('โรงพยาบาล');
      ws.cell(1, 3).string('AIIR ทั้งหมด');
      ws.cell(1, 4).string('AIIR ใช้ไปแล้ว');
      ws.cell(1, 5).string('AIIR คงเหลือ');
      ws.cell(1, 6).string('Modified AIIR ทั้งหมด');
      ws.cell(1, 7).string('Modified AIIR ใช้ไปแล้ว');
      ws.cell(1, 8).string('Modified AIIR คงเหลือ');
      ws.cell(1, 9).string('Isolate ทั้งหมด');
      ws.cell(1, 10).string('Isolate ใช้ไปแล้ว');
      ws.cell(1, 11).string('Isolate คงเหลือ');
      ws.cell(1, 12).string('Cohort ทั้งหมด');
      ws.cell(1, 13).string('Cohort ใช้ไปแล้ว');
      ws.cell(1, 14).string('Cohort คงเหลือ');
      ws.cell(1, 15).string('Hospitel ทั้งหมด');
      ws.cell(1, 16).string('Hospitel ใช้ไปแล้ว');
      ws.cell(1, 17).string('Hospitel คงเหลือ');

      let row = 2;
      const hosp = [];
      const _hosp = filter(hospital, { province_code: provinceCode });
      for (const h of _hosp) {
        const obj = {
          hospital_id: h.id,
          hospcode: h.hospcode,
          hospname: h.hospname
        };
        const _bed = filter(bed, { id: h.id })
        for (const b of _bed) {
          obj[b.bed_name + '_qty'] = b.qty;
          obj[b.bed_name + '_covid_qty'] = b.covid_qty;
          obj[b.bed_name + '_usage_qty'] = b.usage_qty;
        }
        hosp.push(obj);
      }
      for (const h of hosp) {
        ws.cell(row, 1).string(h.hospcode.toString());
        ws.cell(row, 2).string(h.hospname);

        ws.cell(row, 3).string(toString(h['AIIR_qty']));
        ws.cell(row, 4).string(toString(h['AIIR_usage_qty']));
        ws.cell(row, 5).string(toString(h['AIIR_qty'] - h['AIIR_usage_qty']));

        ws.cell(row, 6).string(toString(h['Modified AIIR_qty']));
        ws.cell(row, 7).string(toString(h['Modified AIIR_usage_qty']));
        ws.cell(row, 8).string(toString(h['Modified AIIR_qty'] - h['Modified AIIR_usage_qty']));

        ws.cell(row, 9).string(toString(h['Isolate_qty']));
        ws.cell(row, 10).string(toString(h['Isolate_usage_qty']));
        ws.cell(row, 11).string(toString(h['Isolate_qty'] - h['Isolate_usage_qty']));

        ws.cell(row, 12).string(toString(h['Cohort_qty']));
        ws.cell(row, 13).string(toString(h['Cohort_usage_qty']));
        ws.cell(row, 14).string(toString(h['Cohort_qty'] - h['Cohort_usage_qty']));

        ws.cell(row, 15).string(toString(h['Hospitel_qty']));
        ws.cell(row, 16).string(toString(h['Hospitel_usage_qty']));
        ws.cell(row, 17).string(toString(h['Hospitel_qty'] - h['Hospitel_usage_qty']));
        row++;
      }
    }

    fse.ensureDirSync(process.env.TMP_PATH);
    let filename = `get_bed` + moment().format('x') + '.xlsx'
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
    res.send({ ok: false, message: error, code: HttpStatus.OK });
  }
});

router.get('/get-gcs-admit/excel', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const date = req.query.date;
  const provinceCode = req.decoded.provinceCode;
  const providerType = req.decoded.providerType;
  const zoneCode = req.decoded.zone_code;

  try {
    var wb = new excel4node.Workbook();
    const gcs: any = await model.getGcsAdmit(db, date)
    const hospital: any = await model.getHospitalAll(db);

    if (providerType === 'ZONE') {
      const province = await model.getProvince(db, zoneCode, null);
      for (let v = 0; v < province.length; v++) {
        var ws = wb.addWorksheet(`${province[v].name_th}`);
        ws.cell(1, 1).string('โรงพยาบาล');
        ws.cell(1, 2).string('จำนวนผู้ป่วย');
        ws.cell(1, 3).string('Sever');
        ws.cell(1, 4).string('Moderate');
        ws.cell(1, 5).string('Mild');
        ws.cell(1, 6).string('Asymptomatic');
        ws.cell(1, 7).string('IP PUI');

        let row = 2;

        const s = filter(hospital, { province_code: province[v].code })
        const hosp: any = [];
        for (const h of s) {
          const _gcs = filter(gcs, { hospital_id: h.id })
          if (_gcs.length) {
            const obj: any = {
              hospital_id: h.id,
              hospcode: h.hospcode,
              hospname: h.hospname,
              count: _gcs[0].count,
              countCase: _gcs[0].countCase,
              severe: _gcs[0].severe,
              moderate: _gcs[0].moderate,
              mild: _gcs[0].mild,
              ip_pui: _gcs[0].ip_pui,
              asymptomatic: _gcs[0].asymptomatic
            };
            hosp.push(obj);
          }
        }

        for (const h of hosp) {
          ws.cell(row, 1).string(h.hospname);
          ws.cell(row, 2).string(toString(h.countCase));
          ws.cell(row, 3).string(toString(h['severe']));
          ws.cell(row, 4).string(toString(h['moderate']));
          ws.cell(row, 5).string(toString(h['mild']));
          ws.cell(row, 6).string(toString(h['asymptomatic']));
          ws.cell(row, 7).string(toString(h['ip_pui']));
          row++;
        }
      }
    } else {
      var ws = wb.addWorksheet(`Sheet 1`);

      ws.cell(1, 1).string('โรงพยาบาล');
      ws.cell(1, 2).string('จำนวนผู้ป่วย');
      ws.cell(1, 3).string('Sever');
      ws.cell(1, 4).string('Moderate');
      ws.cell(1, 5).string('Mild');
      ws.cell(1, 6).string('Asymptomatic');
      ws.cell(1, 7).string('IP PUI');

      let row = 2;

      const s = filter(hospital, { province_code: provinceCode })
      const hosp: any = [];
      for (const h of s) {
        const _gcs = filter(gcs, { hospital_id: h.id })
        if (_gcs.length) {
          const obj: any = {
            hospital_id: h.id,
            hospcode: h.hospcode,
            hospname: h.hospname,
            count: _gcs[0].count,
            countCase: _gcs[0].countCase,
            severe: _gcs[0].severe,
            moderate: _gcs[0].moderate,
            mild: _gcs[0].mild,
            ip_pui: _gcs[0].ip_pui,
            asymptomatic: _gcs[0].asymptomatic
          };
          hosp.push(obj);
        }
      }

      for (const h of hosp) {
        ws.cell(row, 1).string(h.hospname);
        ws.cell(row, 2).string(toString(h.countCase));
        ws.cell(row, 3).string(toString(h['severe']));
        ws.cell(row, 4).string(toString(h['moderate']));
        ws.cell(row, 5).string(toString(h['mild']));
        ws.cell(row, 6).string(toString(h['asymptomatic']));
        ws.cell(row, 7).string(toString(h['ip_pui']));
        row++;
      }
    }

    fse.ensureDirSync(process.env.TMP_PATH);
    let filename = `report_patient_admit` + moment().format('x') + '.xlsx'
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
    res.send({ ok: false, message: error, code: HttpStatus.OK });
  }
});


router.get('/get-bed', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const providerType = req.decoded.providerType;
  const zoneCode = req.decoded.zone_code;
  // console.log(req.decoded);

  const type = req.decoded.type;
  const provinceCode = req.decoded.provinceCode;
  const zone = req.query.zone;

  try {
    let rows: any;
    let zoneCodes: any = [];
    const rs = await model.getUseBed(db);
    if (type == 'MANAGER') {
      if (zone !== '') {
        zoneCodes = [zone];
        rows = filter(rs, { 'zone_code': zone });
      } else {
        zoneCodes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];
        rows = rs;
      }
    } else {
      if (providerType == 'ZONE') {
        zoneCodes = [zoneCode];
        rows = filter(rs, { 'zone_code': zoneCode });
      } else {
        console.log(provinceCode);

        rows = filter(rs, { 'province_code': provinceCode });
        console.log(rows);

        zoneCodes = [rows[0].zone_code]
      }
    }
    let data: any = [];
    for (const v of zoneCodes) {
      const obj: any = {};
      obj.zone_code = v;
      const provinces = uniqBy(orderBy(filter(rows, { 'zone_code': v }), 'province_code', 'asc'), 'province_name');
      let dataP: any = [];
      for (const p of provinces) {
        const objP: any = {};
        objP.province_code = p.province_code;
        objP.province_name = p.province_name;
        objP.hospitals = orderBy(filter(rows, { 'province_name': p.province_name }), 'hospital_name', 'asc');
        dataP.push(objP);
      }
      obj.provinces = dataP;
      obj.timestamp = rs[0].timestamp;
      data.push(obj)
    }
    res.send({ ok: true, rows: data, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/get-bed/excel/new', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const providerType = req.decoded.providerType;
  const zoneCode = req.decoded.zone_code;
  const type = req.decoded.type;
  const provinceCode = req.decoded.provinceCode;
  const zone = req.query.zone;

  try {
    let rows: any;
    let zoneCodes: any = [];
    const rs = await model.getUseBed(db);
    if (type == 'MANAGER') {
      if (zone !== undefined) {
        zoneCodes = [zone];
        rows = filter(rs, { 'zone_code': zone });
      } else {
        zoneCodes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];
        rows = rs;
      }
    } else {
      if (providerType == 'ZONE') {
        zoneCodes = [zoneCode];
        rows = filter(rs, { 'zone_code': zoneCode });
      } else {
        rows = filter(rs, { 'province_code': provinceCode });
        zoneCodes = [rows[0].zone_code]
      }
    }

    var wb = new excel4node.Workbook();
    let row = 2;
    for (const v of zoneCodes) {
      let row = 2;
      var ws = wb.addWorksheet(`${v}`);
      const data = orderBy(filter(rows, { 'zone_code': v }), 'province_code', 'asc')
      for (const d of data) {
        ws.cell(1, 1).string('จังหวัด');
        ws.cell(1, 2).string('รหัสโรงพยาบาล');
        ws.cell(1, 3).string('โรงพยาบาล');
        ws.cell(1, 4).string('ระดับขีดความสามารถ');
        ws.cell(1, 5).string('AIIR ทั้งหมด');
        ws.cell(1, 6).string('AIIR ใช้ไปแล้ว');
        ws.cell(1, 7).string('Modified AIIR ทั้งหมด');
        ws.cell(1, 8).string('Modified AIIR ใช้ไปแล้ว');
        ws.cell(1, 9).string('Isolate ทั้งหมด');
        ws.cell(1, 10).string('Isolate ใช้ไปแล้ว');
        ws.cell(1, 11).string('Cohort ทั้งหมด');
        ws.cell(1, 12).string('Cohort ใช้ไปแล้ว');
        ws.cell(1, 13).string('Hospitel ทั้งหมด');
        ws.cell(1, 14).string('Hospitel ใช้ไปแล้ว');
        ws.cell(1, 15).string('Hospital Type');

        ws.cell(row, 1).string(d.province_name);
        ws.cell(row, 2).string(d.hospcode);
        ws.cell(row, 3).string(d.hospname);
        ws.cell(row, 4).string(d.level);

        ws.cell(row, 5).number(d['aiir_covid_qty'] === null ? 0 : d['aiir_covid_qty']);
        ws.cell(row, 6).number(d['aiir_usage_qty'] === null ? 0 : d['aiir_usage_qty']);
        ws.cell(row, 7).number(d['modified_aiir_covid_qty'] === null ? 0 : d['modified_aiir_covid_qty']);
        ws.cell(row, 8).number(d['modified_aiir_usage_qty'] === null ? 0 : d['modified_aiir_usage_qty']);
        ws.cell(row, 9).number(d['isolate_covid_qty'] === null ? 0 : d['isolate_covid_qty']);
        ws.cell(row, 10).number(d['isolate_usage_qty'] === null ? 0 : d['isolate_usage_qty']);
        ws.cell(row, 11).number(d['cohort_covid_qty'] === null ? 0 : d['cohort_covid_qty']);
        ws.cell(row, 12).number(d['cohort_usage_qty'] === null ? 0 : d['cohort_usage_qty']);
        ws.cell(row, 13).number(d['hospitel_covid_qty'] === null ? 0 : d['hospitel_covid_qty']);
        ws.cell(row, 14).number(d['hospitel_usage_qty'] === null ? 0 : d['hospitel_usage_qty']);
        ws.cell(row, 15).string(d.hospital_type);
        row++
      }
    }

    fse.ensureDirSync(process.env.TMP_PATH);
    let filename = `get_bed` + moment().format('x') + '.xlsx'
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
    })
  } catch (error) {
    console.log(error);
    res.send({ ok: false, message: error, code: HttpStatus.OK });
  }
});

router.get('/get-professional', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const providerType = req.decoded.providerType;
  const zoneCode = req.decoded.zone_code;
  const type = req.decoded.type;
  const provinceCode = req.decoded.provinceCode;
  const zone = req.query.zone;

  try {
    let rows: any;
    let zoneCodes: any = [];
    const rs = await model.getProfessionalCross(db);
    if (type == 'MANAGER') {
      if (zone !== '') {
        zoneCodes = [zone];
        rows = filter(rs, { 'zone_code': zone });
      } else {
        zoneCodes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];
        rows = rs;
      }
    } else {
      if (providerType == 'ZONE') {
        zoneCodes = [zoneCode];
        rows = filter(rs, { 'zone_code': zoneCode });
      } else {
        rows = filter(rs, { 'province_code': provinceCode });
        zoneCodes = [rows[0].zone_code]
      }
    }
    let data: any = [];
    for (const v of zoneCodes) {
      const obj: any = {};
      obj.zone_code = v;
      const provinces = uniqBy(orderBy(filter(rows, { 'zone_code': v }), 'province_code', 'asc'), 'province_name');
      let dataP: any = [];
      for (const p of provinces) {
        const objP: any = {};
        objP.province_code = p.province_code;
        objP.province_name = p.province_name;
        objP.hospitals = orderBy(filter(rows, { 'province_name': p.province_name }), 'hospital_name', 'asc');
        dataP.push(objP);
      }
      obj.provinces = dataP;
      data.push(obj)
    }

    res.send({ ok: true, rows: data, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

// router.get('/get-medicals', async (req: Request, res: Response) => {
//   const db = req.dbReport;
//   const date = req.query.date;
//   const providerType = req.decoded.providerType;
//   const zoneCode = req.decoded.zone_code;
//   const type = req.decoded.type;
//   const _provinceCode = req.decoded.provinceCode;
//   const zone = req.query.zone;

//   try {
//     let zoneCodes = [];
//     let provinceCode = null;
//     if (type == 'MANAGER') {
//       if (zone) {
//         zoneCodes = [zone];
//       } else {
//         zoneCodes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];
//       }
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
//         province = await model.getProvince(db, null, provinceCode);
//       } else {
//         province = await model.getProvince(db, z, null);
//       }
//       const hospital: any = await model.getHospital(db)
//       for (const p of province) {
//         const _province: any = {};
//         _province.province_name = p.name_th;
//         const _hosp = _.filter(hospital, { province_code: p.code })
//         const hosp = [];
//         const sup: any = await model.getSupplies(db, date)
//         for (const h of _hosp) {
//           const _hospital: any = {};
//           _hospital.province_name = p.name_th;
//           const obj = {
//             hospital_id: h.id,
//             hospcode: h.hospcode,
//             hospname: h.hospname
//           };
//           const _sup = _.filter(sup, { hospital_id: h.id })
//           for (const s of _sup) {
//             obj[s.generic_id] = s.qty;
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

router.get('/get-supplies', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const date = req.query.date;
  const providerType = req.decoded.providerType;
  const zoneCode = req.decoded.zone_code;
  const type = req.decoded.type;
  const _provinceCode = req.decoded.provinceCode;
  const zone = req.query.zone;

  try {
    let zoneCodes = [];
    let provinceCode = null;
    if (type == 'MANAGER') {
      if (zone) {
        zoneCodes = [zone];
      } else {
        zoneCodes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];
      }
    } else {
      if (providerType == 'ZONE') {
        zoneCodes = [zoneCode];
      } else if (providerType == 'SSJ') {
        zoneCodes = [zoneCode];
        provinceCode = _provinceCode;
      }
    }

    let data: any = [];

    let province;
    let sup;

    if (zoneCodes.length) {
      sup = await model.getSupplies(db, date, null, zoneCodes);
      province = await model.getProvince(db, zoneCode, null);
    } else {
      sup = await model.getSupplies(db, date, null, null);
      province = await model.getProvince(db, null, null);
    }

    for (const z of zoneCodes) {
      const zone: any = {};
      zone.name = z;
      let provinces: any = [];
      let _province: any;
      if (provinceCode) {
        _province = filter(province, { 'code': provinceCode });
      } else {
        _province = filter(province, { 'zone_code': z });
      }

      for (const p of _province) {
        const _province: any = {};
        _province.province_name = p.name_th;
        const _sup = filter(sup, { 'province_code': p.code });
        _province.hospitals = _sup;
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

router.get('/get-gcs/export', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const _provinceCode = req.decoded.provinceCode;
  const providerType = req.decoded.providerType;
  const zoneCode = req.decoded.zone_code;
  const date = req.query.date;
  const type = req.decoded.type;
  const zone = req.query.zone;

  try {
    var wb = new excel4node.Workbook();
    var ws = wb.addWorksheet('Sheet 1');
    ws.cell(1, 1).string('จังหวัด');
    ws.cell(1, 2).string('โรงพยาบาล');
    ws.cell(1, 3).string('Severe');
    ws.cell(1, 4).string('Moderate');
    ws.cell(1, 5).string('Mild');
    ws.cell(1, 6).string('Asymptomatic');
    ws.cell(1, 7).string('IP PUI');
    let zoneCodes = [];
    let provinceCode = null;
    if (type == 'MANAGER') {
      if (zone) {
        zoneCodes = [zone];
      } else {
        zoneCodes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];
      }
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
        province = await model.getProvince(db, null, provinceCode);
      } else {
        province = await model.getProvince(db, z, null);
      }
      let row = 2;
      const gcs: any = await model.getHeadGcs(db, date, map(province, 'code'));
      const patient: any = await model.getGcs(db, date);
      for (const p of province) {
        const _province: any = {};
        _province.province_name = p.name_th;

        const s = filter(gcs, { province_code: p.code })
        for (const i of s) {
          ws.cell(row, 1).string(toString(i['province_name']));
          ws.cell(row, 2).string(toString(i['hospname']));
          ws.cell(row, 3).string(toString(i['severe']));
          ws.cell(row, 4).string(toString(i['moderate']));
          ws.cell(row, 5).string(toString(i['mild']));
          ws.cell(row, 6).string(toString(i['asymptomatic']));
          ws.cell(row, 7).string(toString(i['ip_pui']));
          row += 1;
        }
      }
    }

    fse.ensureDirSync(process.env.TMP_PATH);
    let filename = `get_gcs` + moment().format('x');
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
          fse.removeSync(filenamePath);
        })

      }
    });
    // res.send({ ok: true, rows: 0, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/get-supplies/export', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const date = req.query.date;
  const providerType = req.decoded.providerType;
  const zoneCode = req.decoded.zone_code;
  const type = req.decoded.type;
  const _provinceCode = req.decoded.provinceCode;
  const zone = req.query.zone;

  try {
    const wb = new excel4node.Workbook();
    const ws = wb.addWorksheet();
    const center = wb.createStyle({
      alignment: {
        wrapText: true,
        horizontal: 'center',
      },
    });
    ws.cell(1, 1, 2, 1, true).string('เขตสุขภาพ').style(center);
    ws.cell(1, 2, 2, 2, true).string('จังหวัด').style(center);
    ws.cell(1, 3, 2, 3, true).string('โรงพยาบาล').style(center);
    ws.cell(1, 4, 2, 4, true).string('วันที่บันทึกล่าสุด').style(center);
    ws.cell(1, 5, 1, 8, true).string('Surgical Gown').style(center);
    ws.cell(1, 9, 1, 12, true).string('Cover All-1').style(center);
    ws.cell(1, 13, 1, 16, true).string('Cover All-2').style(center);
    ws.cell(1, 17, 1, 20, true).string('N95').style(center);
    ws.cell(1, 21, 1, 24, true).string('Shoe Cover').style(center);
    ws.cell(1, 25, 1, 28, true).string('Hood cover').style(center);
    ws.cell(1, 29, 1, 32, true).string('Nitrile Glove').style(center);
    ws.cell(1, 33, 1, 36, true).string('Face shield').style(center);
    ws.cell(1, 37, 1, 40, true).string('Surgical Mask').style(center);
    ws.cell(1, 41, 1, 44, true).string('Powered air-purifying respirator').style(center);
    ws.cell(1, 45, 1, 48, true).string('Alcohol 70%').style(center);
    ws.cell(1, 49, 1, 52, true).string('Alcohol 95%').style(center);
    ws.cell(1, 53, 1, 56, true).string('Alcohol Gel').style(center);
    ws.cell(1, 57, 1, 60, true).string('Disposable Glove (latex,nonsterile)').style(center);
    ws.cell(1, 61, 1, 64, true).string('Isolation gown').style(center);
    ws.cell(1, 65, 1, 68, true).string('Leg Cover').style(center);
    ws.cell(1, 69, 1, 72, true).string('Disposable cap').style(center);


    ws.cell(2, 5).string('คงคลัง').style(center);
    ws.cell(2, 6).string('อัตราการใช้ต่อเดือน').style(center);
    ws.cell(2, 7).string('อัตราการใช้ต่อ 2 เดือน').style(center);
    ws.cell(2, 8).string('สถานะคงคลัง (ต่อ 2 เดือน)').style(center);
    ws.cell(2, 9).string('คงคลัง').style(center);
    ws.cell(2, 10).string('อัตราการใช้ต่อเดือน').style(center);
    ws.cell(2, 11).string('อัตราการใช้ต่อ 2 เดือน').style(center);
    ws.cell(2, 12).string('สถานะคงคลัง (ต่อ 2 เดือน)').style(center);
    ws.cell(2, 13).string('คงคลัง').style(center);
    ws.cell(2, 14).string('อัตราการใช้ต่อเดือน').style(center);
    ws.cell(2, 15).string('อัตราการใช้ต่อ 2 เดือน').style(center);
    ws.cell(2, 16).string('สถานะคงคลัง (ต่อ 2 เดือน)').style(center);
    ws.cell(2, 17).string('คงคลัง').style(center);
    ws.cell(2, 18).string('อัตราการใช้ต่อเดือน').style(center);
    ws.cell(2, 19).string('อัตราการใช้ต่อ 2 เดือน').style(center);
    ws.cell(2, 20).string('สถานะคงคลัง (ต่อ 2 เดือน)').style(center);
    ws.cell(2, 21).string('คงคลัง').style(center);
    ws.cell(2, 22).string('อัตราการใช้ต่อเดือน').style(center);
    ws.cell(2, 23).string('อัตราการใช้ต่อ 2 เดือน').style(center);
    ws.cell(2, 24).string('สถานะคงคลัง (ต่อ 2 เดือน)').style(center);
    ws.cell(2, 25).string('คงคลัง').style(center);
    ws.cell(2, 26).string('อัตราการใช้ต่อเดือน').style(center);
    ws.cell(2, 27).string('อัตราการใช้ต่อ 2 เดือน').style(center);
    ws.cell(2, 28).string('สถานะคงคลัง (ต่อ 2 เดือน)').style(center);
    ws.cell(2, 29).string('คงคลัง').style(center);
    ws.cell(2, 30).string('อัตราการใช้ต่อเดือน').style(center);
    ws.cell(2, 31).string('อัตราการใช้ต่อ 2 เดือน').style(center);
    ws.cell(2, 32).string('สถานะคงคลัง (ต่อ 2 เดือน)').style(center);
    ws.cell(2, 33).string('คงคลัง').style(center);
    ws.cell(2, 34).string('อัตราการใช้ต่อเดือน').style(center);
    ws.cell(2, 35).string('อัตราการใช้ต่อ 2 เดือน').style(center);
    ws.cell(2, 36).string('สถานะคงคลัง (ต่อ 2 เดือน)').style(center);
    ws.cell(2, 37).string('คงคลัง').style(center);
    ws.cell(2, 38).string('อัตราการใช้ต่อเดือน').style(center);
    ws.cell(2, 39).string('อัตราการใช้ต่อ 2 เดือน').style(center);
    ws.cell(2, 40).string('สถานะคงคลัง (ต่อ 2 เดือน)').style(center);
    ws.cell(2, 41).string('คงคลัง').style(center);
    ws.cell(2, 42).string('อัตราการใช้ต่อเดือน').style(center);
    ws.cell(2, 43).string('อัตราการใช้ต่อ 2 เดือน').style(center);
    ws.cell(2, 44).string('สถานะคงคลัง (ต่อ 2 เดือน)').style(center);
    ws.cell(2, 45).string('คงคลัง').style(center);
    ws.cell(2, 46).string('อัตราการใช้ต่อเดือน').style(center);
    ws.cell(2, 47).string('อัตราการใช้ต่อ 2 เดือน').style(center);
    ws.cell(2, 48).string('สถานะคงคลัง (ต่อ 2 เดือน)').style(center);
    ws.cell(2, 49).string('คงคลัง').style(center);
    ws.cell(2, 50).string('อัตราการใช้ต่อเดือน').style(center);
    ws.cell(2, 51).string('อัตราการใช้ต่อ 2 เดือน').style(center);
    ws.cell(2, 52).string('สถานะคงคลัง (ต่อ 2 เดือน)').style(center);
    ws.cell(2, 53).string('คงคลัง').style(center);
    ws.cell(2, 54).string('อัตราการใช้ต่อเดือน').style(center);
    ws.cell(2, 55).string('อัตราการใช้ต่อ 2 เดือน').style(center);
    ws.cell(2, 56).string('สถานะคงคลัง (ต่อ 2 เดือน)').style(center);
    ws.cell(2, 57).string('คงคลัง').style(center);
    ws.cell(2, 58).string('อัตราการใช้ต่อเดือน').style(center);
    ws.cell(2, 59).string('อัตราการใช้ต่อ 2 เดือน').style(center);
    ws.cell(2, 60).string('สถานะคงคลัง (ต่อ 2 เดือน)').style(center);
    ws.cell(2, 61).string('คงคลัง').style(center);
    ws.cell(2, 62).string('อัตราการใช้ต่อเดือน').style(center);
    ws.cell(2, 63).string('อัตราการใช้ต่อ 2 เดือน').style(center);
    ws.cell(2, 64).string('สถานะคงคลัง (ต่อ 2 เดือน)').style(center);
    ws.cell(2, 65).string('คงคลัง').style(center);
    ws.cell(2, 66).string('อัตราการใช้ต่อเดือน').style(center);
    ws.cell(2, 67).string('อัตราการใช้ต่อ 2 เดือน').style(center);
    ws.cell(2, 68).string('สถานะคงคลัง (ต่อ 2 เดือน)').style(center);
    ws.cell(2, 69).string('คงคลัง').style(center);
    ws.cell(2, 70).string('อัตราการใช้ต่อเดือน').style(center);
    ws.cell(2, 71).string('อัตราการใช้ต่อ 2 เดือน').style(center);
    ws.cell(2, 72).string('สถานะคงคลัง (ต่อ 2 เดือน)').style(center);
    let row = 3;

    let zoneCodes = [];
    let provinceCode = null;
    if (type == 'MANAGER') {
      if (zone) {
        zoneCodes = [zone];
      } else {
        zoneCodes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];
      }
    } else {
      if (providerType == 'ZONE') {
        zoneCodes = [zoneCode];
      } else if (providerType == 'SSJ') {
        zoneCodes = [zoneCode];
        provinceCode = _provinceCode;
      }
    }

    let data: any = [];

    const rs = await model.getSupplies(db, date, provinceCode, zoneCodes);
    for (const i of rs) {
      ws.cell(row, 1).string(i.zone_code);
      ws.cell(row, 2).string(i.province_name);
      ws.cell(row, 3).string(i.hospname);
      if (i.entry_date) {
        ws.cell(row, 4).string(toString(
          `${moment(i.entry_date).format('DD-MM')}-${+moment(i.entry_date).get('year') + 543}`
        ));
      }
      ws.cell(row, 5).number(toNumber(i.surgical_gown_qty));
      ws.cell(row, 6).number(toNumber(i.surgical_gown_month_usage_qty));
      ws.cell(row, 7).number(toNumber(i.surgical_gown_month_usage_qty * 2));
      ws.cell(row, 8).number(toNumber(i.surgical_gown_qty - (i.surgical_gown_month_usage_qty * 2)));
      ws.cell(row, 9).number(toNumber(i.cover_all1_qty));
      ws.cell(row, 10).number(toNumber(i.cover_all1_month_usage_qty));
      ws.cell(row, 11).number(toNumber(i.cover_all1_month_usage_qty * 2));
      ws.cell(row, 12).number(toNumber(i.cover_all1_qty - (i.cover_all1_month_usage_qty * 2)));
      ws.cell(row, 13).number(toNumber(i.cover_all2_qty));
      ws.cell(row, 14).number(toNumber(i.cover_all2_month_usage_qty));
      ws.cell(row, 15).number(toNumber(i.cover_all2_month_usage_qty * 2));
      ws.cell(row, 16).number(toNumber(i.cover_all2_qty - (i.cover_all2_month_usage_qty * 2)));
      ws.cell(row, 17).number(toNumber(i.n95_qty));
      ws.cell(row, 18).number(toNumber(i.n95_month_usage_qty));
      ws.cell(row, 19).number(toNumber(i.n95_month_usage_qty * 2));
      ws.cell(row, 20).number(toNumber(i.n95_qty - (i.n95_month_usage_qty * 2)));
      ws.cell(row, 21).number(toNumber(i.shoe_cover_qty));
      ws.cell(row, 22).number(toNumber(i.shoe_cover_month_usage_qty));
      ws.cell(row, 23).number(toNumber(i.shoe_cover_month_usage_qty * 2));
      ws.cell(row, 24).number(toNumber(i.shoe_cover_qty - (i.shoe_cover_month_usage_qty * 2)));
      ws.cell(row, 25).number(toNumber(i.surgical_hood_qty));
      ws.cell(row, 26).number(toNumber(i.surgical_hood_month_usage_qty));
      ws.cell(row, 27).number(toNumber(i.surgical_hood_month_usage_qty * 2));
      ws.cell(row, 28).number(toNumber(i.surgical_hood_qty - (i.surgical_hood_month_usage_qty * 2)));
      ws.cell(row, 29).number(toNumber(i.long_glove_qty));
      ws.cell(row, 30).number(toNumber(i.long_glove_month_usage_qty));
      ws.cell(row, 31).number(toNumber(i.long_glove_month_usage_qty * 2));
      ws.cell(row, 32).number(toNumber(i.long_glove_qty - (i.long_glove_month_usage_qty * 2)));
      ws.cell(row, 33).number(toNumber(i.face_shield_qty));
      ws.cell(row, 34).number(toNumber(i.face_shield_month_usage_qty));
      ws.cell(row, 35).number(toNumber(i.face_shield_month_usage_qty * 2));
      ws.cell(row, 36).number(toNumber(i.face_shield_qty - (i.face_shield_month_usage_qty * 2)));
      ws.cell(row, 37).number(toNumber(i.surgical_mask_qty));
      ws.cell(row, 38).number(toNumber(i.surgical_mask_month_usage_qty));
      ws.cell(row, 39).number(toNumber(i.surgical_mask_month_usage_qty * 2));
      ws.cell(row, 40).number(toNumber(i.surgical_mask_qty - (i.surgical_mask_month_usage_qty * 2)));
      ws.cell(row, 41).number(toNumber(i.powered_air_qty));
      ws.cell(row, 42).number(toNumber(i.powered_air_month_usage_qty));
      ws.cell(row, 43).number(toNumber(i.powered_air_month_usage_qty * 2));
      ws.cell(row, 44).number(toNumber(i.powered_air_qty - (i.powered_air_month_usage_qty * 2)));
      ws.cell(row, 45).number(toNumber(i.alcohol_70_qty));
      ws.cell(row, 46).number(toNumber(i.alcohol_70_month_usage_qty));
      ws.cell(row, 47).number(toNumber(i.alcohol_70_month_usage_qty * 2));
      ws.cell(row, 48).number(toNumber(i.alcohol_70_qty - (i.alcohol_70_month_usage_qty * 2)));
      ws.cell(row, 49).number(toNumber(i.alcohol_95_qty));
      ws.cell(row, 50).number(toNumber(i.alcohol_95_month_usage_qty));
      ws.cell(row, 51).number(toNumber(i.alcohol_95_month_usage_qty * 2));
      ws.cell(row, 52).number(toNumber(i.alcohol_95_qty - (i.alcohol_95_month_usage_qty * 2)));
      ws.cell(row, 53).number(toNumber(i.alcohol_gel_qty));
      ws.cell(row, 54).number(toNumber(i.alcohol_gel_month_usage_qty));
      ws.cell(row, 55).number(toNumber(i.alcohol_gel_month_usage_qty * 2));
      ws.cell(row, 56).number(toNumber(i.alcohol_gel_qty - (i.alcohol_gel_month_usage_qty * 2)));
      ws.cell(row, 57).number(toNumber(i.disposable_glove_qty));
      ws.cell(row, 58).number(toNumber(i.disposable_glove_month_usage_qty));
      ws.cell(row, 59).number(toNumber(i.disposable_glove_month_usage_qty * 2));
      ws.cell(row, 60).number(toNumber(i.disposable_glove_qty - (i.disposable_glove_month_usage_qty * 2)));
      ws.cell(row, 61).number(toNumber(i.isolation_gown_qty));
      ws.cell(row, 62).number(toNumber(i.isolation_gown_month_usage_qty));
      ws.cell(row, 63).number(toNumber(i.isolation_gown_month_usage_qty * 2));
      ws.cell(row, 64).number(toNumber(i.isolation_gown_qty - (i.isolation_gown_month_usage_qty * 2)));
      ws.cell(row, 65).number(toNumber(i.leg_cover_qty));
      ws.cell(row, 66).number(toNumber(i.leg_cover_month_usage_qty));
      ws.cell(row, 67).number(toNumber(i.leg_cover_month_usage_qty * 2));
      ws.cell(row, 68).number(toNumber(i.leg_cover_qty - (i.leg_cover_month_usage_qty * 2)));
      ws.cell(row, 69).number(toNumber(i.disposable_cap_qty));
      ws.cell(row, 70).number(toNumber(i.disposable_cap_month_usage_qty));
      ws.cell(row, 71).number(toNumber(i.disposable_cap_month_usage_qty * 2));
      ws.cell(row, 72).number(toNumber(i.disposable_cap_qty - (i.disposable_cap_month_usage_qty * 2)));
      row++;
    }
    fse.ensureDirSync(process.env.TMP_PATH);
    let filename = `get_gcs` + moment().format('x');
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
          fse.removeSync(filenamePath);
        })

      }
    });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }

  // try {

  //   for (const z of zoneCodes) {
  //     const zone: any = {};
  //     zone.name = z;
  //     let provinces: any = [];
  //     let province: any;
  //     if (provinceCode) {
  //       province = await model.getProvince(db, null, provinceCode);
  //     } else {
  //       province = await model.getProvince(db, z, null);
  //     }

  //     for (const p of province) {
  //       var ws = wb.addWorksheet(`${p.name_th}`);

  //       ws.cell(1, 1).string('โรงพยาบาล');
  //       ws.cell(1, 2).string('วันที่บันทึกล่าสุด');
  //       ws.cell(1, 3).string('Surgical Gown');
  //       ws.cell(1, 4).string('Cover All-1');
  //       ws.cell(1, 5).string('Cover All-2');
  //       ws.cell(1, 6).string('N95');
  //       ws.cell(1, 7).string('Shoe Cover');
  //       ws.cell(1, 8).string('Hood cover');
  //       ws.cell(1, 9).string('Nitrile Glove');
  //       ws.cell(1, 10).string('Face shield');
  //       ws.cell(1, 11).string('Surgical Mask');
  //       ws.cell(1, 12).string('Powered air-purifying respirator');
  //       let row = 2;
  //       const sup: any = await model.getSupplies(db, date, p.code);
  //       for (const i of sup) {
  //         ws.cell(row, 1).string(i.hospname);
  //         if (i.entry_date) {
  //           ws.cell(row, 2).string(toString(
  //             `${moment(i.entry_date).format('DD-MM')}-${+moment(i.entry_date).get('year') + 543}`
  //           ));
  //         }
  //         ws.cell(row, 3).number(toNumber(i.surgical_gown_qty));
  //         ws.cell(row, 4).number(toNumber(i.cover_all1_qty));
  //         ws.cell(row, 5).number(toNumber(i.cover_all2_qty));
  //         ws.cell(row, 6).number(toNumber(i.n95_qty));
  //         ws.cell(row, 7).number(toNumber(i.shoe_cover_qty));
  //         ws.cell(row, 8).number(toNumber(i.surgical_hood_qty));
  //         ws.cell(row, 9).number(toNumber(i.long_glove_qty));
  //         ws.cell(row, 10).number(toNumber(i.face_shield_qty));
  //         ws.cell(row, 11).number(toNumber(i.surgical_mask_qty));
  //         ws.cell(row, 12).number(toNumber(i.powered_air_qty));
  //         row++;
  //       }
  //     }
  //   }

  //   // ------------
  //   fse.ensureDirSync(process.env.TMP_PATH);
  //   let filename = `get_gcs` + moment().format('x');
  //   let filenamePath = path.join(process.env.TMP_PATH, filename + '.xlsx');
  //   wb.write(filenamePath, function (err, stats) {
  //     if (err) {
  //       console.error(err);
  //       fse.removeSync(filenamePath);
  //       res.send({ ok: false, error: err })
  //     } else {
  //       res.setHeader('Content-Type', 'application/vnd.openxmlformats');
  //       res.setHeader("Content-Disposition", "attachment; filename=" + filename);
  //       res.sendfile(filenamePath, (v) => {
  //         fse.removeSync(filenamePath);
  //       })

  //     }
  //   });
  //   // res.send({ ok: true, rows: 0, code: HttpStatus.OK });
  // } catch (error) {
  //   console.log(error);
  //   res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  // }
});

router.get('/fulfill-drugs-1', async (req: Request, res: Response) => {
  const db = req.dbReport;
  let id = req.query.id
  var wb = new excel4node.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  try {
    id = Array.isArray(id) ? id : [id];
    const rs: any = await fullfillModel.getProductsDrugs(req.dbReport, 'ZONE', 'ASC');
    const center = wb.createStyle({
      alignment: {
        wrapText: true,
        horizontal: 'center',
      },
    });

    ws.cell(1, 1, 2, 1, true).string('เขต').style(center);
    ws.cell(1, 2, 2, 2, true).string('โรงพยาบาล').style(center);
    ws.cell(1, 3, 1, 6, true).string('HCQ').style(center);
    ws.cell(1, 7, 1, 10, true).string('CQ').style(center);
    ws.cell(1, 11, 1, 14, true).string('DRV').style(center);
    ws.cell(1, 15, 1, 18, true).string('RTV').style(center);
    ws.cell(1, 19, 1, 22, true).string('LPV/r').style(center);
    ws.cell(1, 23, 1, 26, true).string('Azinthromycin').style(center);

    ws.cell(2, 3).string('รับเข้า').style(center);
    ws.cell(2, 4).string('ใช้ไป').style(center);
    ws.cell(2, 5).string('คงเหลือ').style(center);
    ws.cell(2, 6).string('เติมยา').style(center);

    ws.cell(2, 7).string('รับเข้า').style(center);
    ws.cell(2, 8).string('ใช้ไป').style(center);
    ws.cell(2, 9).string('คงเหลือ').style(center);
    ws.cell(2, 10).string('เติมยา').style(center);

    ws.cell(2, 11).string('รับเข้า').style(center);
    ws.cell(2, 12).string('ใช้ไป').style(center);
    ws.cell(2, 13).string('คงเหลือ').style(center);
    ws.cell(2, 14).string('เติมยา').style(center);

    ws.cell(2, 15).string('รับเข้า').style(center);
    ws.cell(2, 16).string('ใช้ไป').style(center);
    ws.cell(2, 17).string('คงเหลือ').style(center);
    ws.cell(2, 18).string('เติมยา').style(center);

    ws.cell(2, 19).string('รับเข้า').style(center);
    ws.cell(2, 20).string('ใช้ไป').style(center);
    ws.cell(2, 21).string('คงเหลือ').style(center);
    ws.cell(2, 22).string('เติมยา').style(center);

    ws.cell(2, 23).string('รับเข้า').style(center);
    ws.cell(2, 24).string('ใช้ไป').style(center);
    ws.cell(2, 25).string('คงเหลือ').style(center);
    ws.cell(2, 26).string('เติมยา').style(center);

    let row = 3;
    for (const v of rs[0]) {
      ws.cell(row, 1).string(v.zone_code);
      ws.cell(row, 2).string(v.hospital_name);
      ws.cell(row, 3).number(toNumber(v.hydroxy_chloroquine_total_qty));
      ws.cell(row, 4).number(toNumber(v.hydroxy_chloroquine_req_qty));
      ws.cell(row, 5).number(toNumber(v.hydroxy_chloroquine_qty + v.hydroxy_chloroquine_reserve_qty));
      ws.cell(row, 6).number(toNumber(v.hydroxy_chloroquine_recomment_qty));
      ws.cell(row, 7).number(toNumber(v.chloroquine_total_qty));
      ws.cell(row, 8).number(toNumber(v.chloroquine_req_qty));
      ws.cell(row, 9).number(toNumber(v.chloroquine_qty));
      ws.cell(row, 10).number(toNumber(v.chloroquine_recomment_qty));
      ws.cell(row, 11).number(toNumber(v.darunavir_total_qty));
      ws.cell(row, 12).number(toNumber(v.darunavir_req_qty));
      ws.cell(row, 13).number(toNumber(v.darunavir_qty));
      ws.cell(row, 14).number(toNumber(v.darunavir_recomment_qty));
      ws.cell(row, 15).number(toNumber(v.lopinavir_total_qty));
      ws.cell(row, 16).number(toNumber(v.lopinavir_req_qty));
      ws.cell(row, 17).number(toNumber(v.lopinavir_qty));
      ws.cell(row, 18).number(toNumber(v.lopinavir_recomment_qty));
      ws.cell(row, 19).number(toNumber(v.ritonavir_total_qty));
      ws.cell(row, 20).number(toNumber(v.ritonavir_req_qty));
      ws.cell(row, 21).number(toNumber(v.ritonavir_qty));
      ws.cell(row, 22).number(toNumber(v.ritonavir_recomment_qty));
      ws.cell(row, 23).number(toNumber(v.azithromycin_total_qty));
      ws.cell(row, 24).number(toNumber(v.azithromycin_req_qty));
      ws.cell(row, 25).number(toNumber(v.azithromycin_qty));
      ws.cell(row++, 26).number(toNumber(v.azithromycin_recomment_qty));
    }

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `fulfill` + moment().format('x');
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
          fse.removeSync(filenamePath);
        })
      }
    });
    // res.send({ ok: true, rows: [], code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/fulfill-drugs-2', async (req: Request, res: Response) => {
  const db = req.dbReport;
  let id = req.query.id
  var wb = new excel4node.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  try {
    id = Array.isArray(id) ? id : [id];
    const rs: any = await fullfillModel.getProductByIds(db, 'DRUG', 'ZONE', 'ASC', id);
    const center = wb.createStyle({
      alignment: {
        wrapText: true,
        horizontal: 'center',
      },
    });

    ws.cell(1, 1).string('เขต').style(center);
    ws.cell(1, 2).string('จังหวัด').style(center);
    ws.cell(1, 3).string('รหัสโรงพยาบาล').style(center);
    ws.cell(1, 4).string('โรงพยาบาล').style(center);
    ws.cell(1, 5).string('ยอดเติม HCQ').style(center);
    ws.cell(1, 6).string('ยอดเติม CQ').style(center);
    ws.cell(1, 7).string('ยอดเติม DRV').style(center);
    ws.cell(1, 8).string('ยอดเติม RTV').style(center);
    ws.cell(1, 9).string('ยอดเติม LPV/r').style(center);
    ws.cell(1, 10).string('ยอดเติม Azithromycin').style(center);

    let row = 2;
    for (const v of rs[0]) {
      ws.cell(row, 1).string(v.zone_code);
      ws.cell(row, 2).string(v.province_name);
      ws.cell(row, 3).string(v.hospital_code);
      ws.cell(row, 4).string(v.hospital_name);
      ws.cell(row, 5).number(toNumber(v.hydroxy_chloroquine_recomment_qty));
      ws.cell(row, 6).number(toNumber(v.chloroquine_recomment_qty));
      ws.cell(row, 7).number(toNumber(v.darunavir_recomment_qty));
      ws.cell(row, 8).number(toNumber(v.lopinavir_recomment_qty));
      ws.cell(row, 9).number(toNumber(v.ritonavir_recomment_qty));
      ws.cell(row++, 10).number(toNumber(v.azithromycin_recomment_qty));
    }

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `fulfill` + moment().format('x');
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
          fse.removeSync(filenamePath);
        })
      }
    });
    // res.send({ ok: true, rows: [], code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/fulfill-supplies', async (req: Request, res: Response) => {
  const db = req.dbReport;
  let id = req.query.id
  var wb = new excel4node.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  try {
    id = Array.isArray(id) ? id : [id];
    let supplies: any = await suppliesModel.getSuppliesActived(db)
    let rs: any = await fullfillModel.getFulFillSupplesItems(req.dbReport, supplies, map(id, (v) => { return +v }));
    ws.cell(1, 1).string('ร.พ./รายการเวชภัณฑ์');
    let col = 2
    for (const items of supplies) {
      ws.cell(1, col++).string(items.name);
    }
    let row = 1
    for (const items of rs) {
      col = 2
      ws.cell(++row, 1).string(items.hospname);
      for (const itemD of supplies) {
        if (itemD.name in items)
          ws.cell(row, col++).number(items[itemD.name]);
      }
    }
    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `fulfill` + moment().format('x');
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
          fse.removeSync(filenamePath);
        })
      }
    });
    // res.send({ ok: true, rows: data, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/province-case-date', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const date = req.query.date;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  try {
    let _startDate = moment(startDate, 'YYYY-M-D');
    let _endDate = moment(endDate, 'YYYY-M-D');
    let date = _startDate;
    let data = [];
    while (_startDate.isSameOrBefore(_endDate)) {

      const _date = moment(date).format('YYYY-MM-DD');
      const rs: any = await model.provinceCaseDate(db, _date);
      for (const i of rs) {
        const sum = i.severe || 0 + i.moderate || 0 + i.mild || 0 + i.asymptomatic || 0;
        const idx = findIndex(data, { 'province_code': i.province_code });
        if (idx > -1) {
          data[idx][_date] = sum;
          data[idx].sum += sum;
        } else {
          const obj = {
            zone_code: i.zone_code,
            province_code: i.province_code,
            province_name: i.province_name,
            sum: 0
          }
          obj.sum = sum || 0;
          obj[_date] = sum || 0;
          data.push(obj);
        }
      }
      date = date.add(1, 'days');
    }
    // let set_date = moment(startDate).format('YYYY-MM-DD')
    // const data: any = [];
    // console.log(data);

    res.send({ ok: true, rows: data, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/admit-confirm-case', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const type = req.decoded.type;
  const providerType = req.decoded.providerType;
  const zoneCode = req.decoded.zone_code;
  const provinceCode = req.decoded.provinceCode;
  // const showPersons = true;
  const right = req.decoded.rights;
  // console.log(right);

  const showPersons = _.findIndex(right, { name: 'MANAGER_REPORT_PERSON' }) > -1 || _.findIndex(right, { name: 'STAFF_VIEW_PATIENT_INFO' }) > -1 ? true : false;

  try {
    if (type == 'MANAGER') {
      const rs: any = await model.admitConfirmCase(db, showPersons);
      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } else if (providerType == 'ZONE') {
      const rs: any = await model.admitConfirmCaseProvice(db, zoneCode, null, showPersons);
      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } else if (providerType == 'SSJ') {
      const rs: any = await model.admitConfirmCaseProvice(db, zoneCode, provinceCode, showPersons);
      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, code: HttpStatus.UNAUTHORIZED, error: HttpStatus.UNAUTHORIZED });

    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/admit-pui-case', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const type = req.decoded.type;
  const providerType = req.decoded.providerType;
  const zoneCode = req.decoded.zone_code;
  const provinceCode = req.decoded.provinceCode;
  // const showPersons = true;
  const right = req.decoded.rights;
  // console.log(right);

  const showPersons = _.findIndex(right, { name: 'MANAGER_REPORT_PERSON' }) > -1 || _.findIndex(right, { name: 'STAFF_VIEW_PATIENT_INFO' }) > -1 ? true : false;

  try {
    if (type == 'MANAGER') {
      const rs: any = await model.admitPuiCase(db, showPersons);
      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
      // } else if (providerType == 'ZONE') {
      //   const rs: any = await model.admitConfirmCaseProvice(db, zoneCode, null, showPersons);
      //   res.send({ ok: true, rows: rs, code: HttpStatus.OK });
      // } else if (providerType == 'SSJ') {
      //   const rs: any = await model.admitConfirmCaseProvice(db, zoneCode, provinceCode, showPersons);
      //   res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, code: HttpStatus.UNAUTHORIZED, error: HttpStatus.UNAUTHORIZED });

    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/check-admit-confirm-case', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const status = req.body.status;
  const remark = req.body.remark || null;
  const covidCaseDetailId = req.body.covidCaseDetailId;
  const userId = req.decoded.id;
  try {
    const data = {
      status,
      covid_case_detail_id: covidCaseDetailId,
      created_by: userId,
      remark
    };
    await model.checkAdmitConfirmCase(db, data);
    res.send({ ok: true });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/check-admit-confirm-case/export', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const zoneCode = req.decoded.zone_code;
  const right = req.decoded.rights;
  const showPersons = _.findIndex(right, { name: 'MANAGER_REPORT_PERSON' }) > -1 ? true : false;

  try {
    const rs: any = await model.admitConfirmCaseProvice(db, zoneCode, null, showPersons);

    var wb = new excel4node.Workbook();
    var ws = wb.addWorksheet('Sheet 1');
    ws.cell(1, 1).string('สถานะ');
    ws.cell(1, 2).string('หมายเหตุ');
    ws.cell(1, 3).string('ไม่ได้บันทึกมา');
    ws.cell(1, 4).string('จังหวัด');
    ws.cell(1, 5).string('โรงพยาบาล');
    ws.cell(1, 6).string('HN');
    ws.cell(1, 7).string('AN');
    ws.cell(1, 8).string('CID');
    ws.cell(1, 9).string('ชื่อ');
    ws.cell(1, 10).string('นามสกุล');
    ws.cell(1, 11).string('SAT ID');
    ws.cell(1, 12).string('วันที่ ADMIT');
    ws.cell(1, 13).string('ความรุนแรง');
    ws.cell(1, 14).string('เตียง');
    ws.cell(1, 15).string('เครื่องช่วยหายใจ');
    ws.cell(1, 16).string('วันที่บันทึกล่าสุด');
    let row = 2;
    for (const h of rs) {
      if (h.cio_date === moment().format('YYYY-MM-DD')) {
        ws.cell(row, 1).string(toString(h.cio_status));
        ws.cell(row, 2).string(toString(h.cio_remark));
      } else {
        ws.cell(row, 1).string(toString(''));
        ws.cell(row, 2).string(toString(''));
      }
      ws.cell(row, 3).string(toString(h.days));
      ws.cell(row, 4).string(toString(h.province_name));
      ws.cell(row, 5).string(toString(h.hospname));
      ws.cell(row, 6).string(toString(h.hn));
      ws.cell(row, 7).string(toString(h.an));
      ws.cell(row, 8).string(toString(h.cid));
      ws.cell(row, 9).string(toString(h.first_name));
      ws.cell(row, 10).string(toString(h.last_name));
      ws.cell(row, 11).string(toString(h.sat_id));
      ws.cell(row, 12).string(toString(h.date_admit));
      ws.cell(row, 13).string(toString(h.gcs_name));
      ws.cell(row, 14).string(toString(h.bed_name));
      ws.cell(row, 15).string(toString(h.medical_supplies_name));
      ws.cell(row, 16).string(toString(h.updated_entry_last));
      row++;
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

router.get('/admit-confirm-case-summary', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const type = req.decoded.type;
  const providerType = req.decoded.providerType;
  const zoneCode = req.decoded.zone_code;
  const provinceCode = req.decoded.provinceCode;
  try {
    if (type == 'MANAGER') {
      const rs: any = await model.admitConfirmCaseSummary(db);
      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } else if (providerType == 'ZONE') {
      const rs: any = await model.admitConfirmCaseSummaryProvince(db, zoneCode);
      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } else if (providerType == 'SSJ') {
      const rs: any = await model.admitConfirmCaseSummaryProvince(db, zoneCode, provinceCode);
      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, code: HttpStatus.UNAUTHORIZED });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/admit-pui-case-summary', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const type = req.decoded.type;
  const providerType = req.decoded.providerType;
  const zoneCode = req.decoded.zone_code;
  const provinceCode = req.decoded.provinceCode;
  try {
    if (type == 'MANAGER') {
      const rs: any = await model.admitPuiCaseSummary(db);
      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
      // } else if (providerType == 'ZONE') {
      //   const rs: any = await model.admitConfirmCaseSummaryProvince(db, zoneCode);
      //   res.send({ ok: true, rows: rs, code: HttpStatus.OK });
      // } else if (providerType == 'SSJ') {
      //   const rs: any = await model.admitConfirmCaseSummaryProvince(db, zoneCode, provinceCode);
      //   res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, code: HttpStatus.UNAUTHORIZED });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/homework', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const type = req.decoded.type;
  try {
    if (type == 'MANAGER') {
      const rs: any = await model.homework(db);
      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, code: HttpStatus.UNAUTHORIZED });

    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/homework-detail', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const type = req.decoded.type;
  const filter = req.query.filter;
  try {
    if (type == 'MANAGER') {
      const rs: any = await model.homeworkDetail(db, filter);
      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, code: HttpStatus.UNAUTHORIZED });

    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/summary-local-quarantine-zone', async (req: Request, res: Response) => {
  const db = req.dbReport;
  try {
    const rs: any = await model.summaryLocalQuarantineZone(db);
    for (const v of rs[0]) {
      v.zone_code = +v.zone_code;
    }
    res.send({ ok: true, rows: rs[0], code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/summary-local-quarantine-zone/2', async (req: Request, res: Response) => {
  const db = req.dbReport;
  try {
    const rs: any = await model.summaryLocalQuarantineZone2(db);
    for (const v of rs[0]) {
      v.zone_code = +v.zone_code;
    }
    res.send({ ok: true, rows: rs[0], code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/summary-local-quarantine-province', async (req: Request, res: Response) => {
  const db = req.dbReport;
  try {
    const rs: any = await model.summaryLocalQuarantineProvince(db);
    for (const v of rs[0]) {
      v.zone_code = +v.zone_code;
    }
    res.send({ ok: true, rows: rs[0], code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/local-quarantine', async (req: Request, res: Response) => {
  const db = req.dbReport;

  try {
    const rs: any = await model.localQuarantineApi();
    const json = JSON.parse(rs);
    // const rsd: any = await model.getCountLocalQuarantine(db);
    // if (json.rowCount !== rsd[0].rows) {
    //   console.log(1);
    //   await model.removeLocalQuarantine(db);
    //   const data: any = [];
    //   for (const v of json.rowList) {
    //     const obj: any = {};
    //     obj.person_id = v.idPerson;
    //     obj.cid = v.idNo;
    //     obj.title_name = v.thTitle;
    //     const fullname = v.thFullName.split(' ');
    //     obj.first_name = fullname[0] || null;
    //     obj.last_name = fullname[1] || null;
    //     obj.tel = v.tel;
    //     obj.arrival_date = v.actualArrivalDate === null ? null : moment(v.actualArrivalDate).format('YYYY-MM-DD');
    //     obj.status = v.status;
    //     obj.send_date = v.sentDate === null ? null : moment(v.sentDate).format('YYYY-MM-DD');
    //     obj.hospital_name = v.hospitalName;
    //     obj.checkin_date = v.checkInDate === null ? null : moment(v.checkInDate).format('YYYY-MM-DD HH:mm:ss');
    //     obj.checkout_date = v.checkOutDate === null ? null : moment(v.checkOutDate).format('YYYY-MM-DD HH:mm:ss');
    //     const checkout = v.causeOfCheckOut.split('>');
    //     obj.couse_of_checkout = checkout[0].toString().trim() || null;
    //     if (checkout.length == 2) {
    //       obj.province_of_checkout = checkout[1].toString().trim() || null;
    //     }
    //     obj.last_quarantine_province = v.lastQuarantineProvince;
    //     data.push(obj);
    //   }
    //   await model.insertLocalQuarantine(db, data);
    // }
    // const person = model.getLocalQuarantine(db);

    res.send({ ok: true, rows: json, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/local-quarantine-hotel', async (req: Request, res: Response) => {
  const db = req.dbReport;

  try {
    // const rs: any = await model.localQuarantineHotelApi();
    // const json = JSON.parse(rs);

    // for (const v of json.rows) {
    //   const obj: any = {};
    //   obj.id_lq = v.id_lq;
    //   obj.hotel_name = v.hotelName;
    //   obj.address_hotel = v.address_hotel;
    //   obj.subdistrict = v.subDistrict;
    //   obj.district = v.district;
    //   obj.province = v.province;
    //   obj.latitude = v.latitude;
    //   obj.longitude = v.longitude;
    //   obj.contact_name = v.contactName;
    //   obj.total_capacity = v.status.total_capacity;
    //   obj.no_bed_lock = v.status.noBedLocked;
    //   obj.occupancy = v.status.occupancy;
    //   obj.check_in = v.status.check_in;

    //   await model.insertLocalQuarantineHotel(db, obj);
    // }

    const rs: any = await model.getLocalQuarantineHotel(db);
    for (const v of rs[0]) {
      v.zone_code = +v.zone_code;
    }

    res.send({ ok: true, rows: rs[0], code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


// router.get('/xxx', async (req: Request, res: Response) => {
//   const db = req.dbReport;
//   const month = '2020-07';

//   try {

//     const rs :any = await model.summary1(db,month);
//     console.log(rs[0]);


//     res.send({ ok: true, rows: rs, code: HttpStatus.OK });
//   } catch (error) {
//     console.log(error);
//     res.send({ ok: false, error: error.message, code: HttpStatus.OK });
//   }
// });

function toString(value) {
  if (value || value == 0) {
    return value.toString();
  } else {
    return '';
  }
}

function toNumber(value) {
  if (value || value == 0) {
    return +value;
  } else {
    return 0;
  }
}
async function setDataDischargeDaily(rs) {
  const data = await orderBy(map(groupBy(rs, vgz => { return vgz.zone_code }), (vmz, kmz) => {
    return {
      zone_code: kmz,
      DISCHARGE: countBy(vmz, { "status": "DISCHARGE" }).true || 0,
      NEGATIVE: countBy(vmz, { "status": "NEGATIVE" }).true || 0,
      REFER: countBy(vmz, { "status": "REFER" }).true || 0,
      DEATH: countBy(vmz, { "status": "DEATH" }).true || 0,
      value: orderBy(map(groupBy(vmz, vgp => { return vgp.province_name }), (vmp, kmp) => {
        return {
          province_name: kmp,
          DISCHARGE: countBy(vmp, { "status": "DISCHARGE" }).true || 0,
          NEGATIVE: countBy(vmp, { "status": "NEGATIVE" }).true || 0,
          REFER: countBy(vmp, { "status": "REFER" }).true || 0,
          DEATH: countBy(vmp, { "status": "DEATH" }).true || 0,
          value: orderBy(map(groupBy(vmp, vgh => { return vgh.hospname }), (vmh, kmh) => {
            return {
              hospname: kmh,
              DISCHARGE: countBy(vmh, { "status": "DISCHARGE" }).true || 0,
              NEGATIVE: countBy(vmh, { "status": "NEGATIVE" }).true || 0,
              REFER: countBy(vmh, { "status": "REFER" }).true || 0,
              DEATH: countBy(vmh, { "status": "DEATH" }).true || 0,
              value: vmh
            }
          }), 'hospname', 'asc')
        }
      }), 'province_name', 'asc')
    }
  }), 'zone_code', 'asc')

  return data;
}

router.get('/discharge-daily', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const date = req.query.date || moment().format('YYYY-MM-DD');
  try {
    const rs: any = await model.dischargeCase(db, date);
    const data = await setDataDischargeDaily(rs);
    res.send({ ok: true, rows: data, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/discharge-daily/excel', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const date = req.query.date || moment().format('YYYY-MM-DD');
  try {
    const rs: any = await model.dischargeCase(db, date);
    let row = 2
    var wb = new excel4node.Workbook();
    var ws = wb.addWorksheet('Sheet 1');
    ws.cell(1, 1).string('zone_code');
    ws.cell(1, 2).string('จังหวัด');
    ws.cell(1, 3).string('รหัสโรงพยาบาล');
    ws.cell(1, 4).string('โรงพยาบาล');
    ws.cell(1, 5).string('hn');
    ws.cell(1, 6).string('an');
    ws.cell(1, 7).string('status');
    ws.cell(1, 8).string('date_admit');
    ws.cell(1, 9).string('date_discharge');
    ws.cell(1, 10).string('refer_hospcode');
    ws.cell(1, 11).string('refer_hospname');
    for (const item of rs) {
      item.date_admit = moment(item.date_admit).format('DD/MM/YYYY')
      item.date_discharge = moment(item.date_discharge).format('DD/MM/YYYY')
      ws.cell(row, 1).string(toString(item.zone_code));
      ws.cell(row, 2).string(toString(item.province_name));
      ws.cell(row, 3).string(toString(item.hospcode));
      ws.cell(row, 4).string(toString(item.hospname));
      ws.cell(row, 5).string(toString(item.hn));
      ws.cell(row, 6).string(toString(item.an));
      ws.cell(row, 7).string(toString(item.status));
      ws.cell(row, 8).string(toString(item.date_admit));
      ws.cell(row, 9).string(toString(item.date_discharge));
      ws.cell(row, 10).string(toString(item.refer_hospcode));
      ws.cell(row, 11).string(toString(item.refer_hospname));
      row++;
    }
    
    
    fse.ensureDirSync(process.env.TMP_PATH);
    let filename = `discharge-daily` + moment().format('x') + '.xlsx'
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
    res.send({ ok: false, message: error, code: HttpStatus.OK });
  }
});

router.get('/lab-positive', async (req: Request, res: Response) => {
  const db = req.dbReport;
  try {
    const rs: any = await model.labPositive(db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});
export default router;