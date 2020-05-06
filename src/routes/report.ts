import { ReportModel } from '../models/report';
/// <reference path="../../typings.d.ts" />
import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';

import * as _ from 'lodash';
import moment = require('moment');
import { FullfillModel } from '../models/fulfill';
import { DrugsModel } from '../models/drug';
import { SuppliesModel } from '../models/supplies';
const excel4node = require('excel4node');
const path = require('path')
const fse = require('fs-extra');
const fs = require('fs');
const model = new ReportModel();
const fullfillModel = new FullfillModel();
const drugsModel = new DrugsModel();
const suppliesModel = new SuppliesModel();
const router: Router = Router();
import { json2csv } from 'json-2-csv';
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

router.get('/get-gcs-admit', async (req: Request, res: Response) => {
  const db = req.db;
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
      const hospital: any = await model.getHospital(db)
      let sumProvince = 0;
      let severe = 0;
      for (const p of province) {
        const _province: any = {};
        _province.province_name = p.name_th;
        const s = _.filter(hospital, { province_code: p.code })
        const hosp = [];
        const gcs: any = await model.getGcsAdmit(db, date)
        for (const h of s) {
          const _hospital: any = {};
          _hospital.province_name = p.name_th;
          const _gcs = _.filter(gcs, { hospital_id: h.id })
          if (_gcs.length) {
            const obj: any = {
              hospital_id: h.id,
              hospcode: h.hospcode,
              hospname: h.hospname,
              count: _gcs[0].count,
              severe: _gcs[0].severe,
              moderate: _gcs[0].moderate,
              mild: _gcs[0].mild,
              ip_pui: _gcs[0].ip_pui,
              asymptomatic: _gcs[0].asymptomatic
            };
            hosp.push(obj);
          }
        }
        _province.hospitals = hosp;

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
  const db = req.db;
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
      const hospital: any = await model.getHospital(db)
      // let sumProvince = 0;
      let severe = 0;
      for (const p of province) {
        const _province: any = {};
        _province.province_name = p.name_th;
        const s = _.filter(hospital, { province_code: p.code })
        const hosp = [];
        const gcs: any = await model.getGcs(db, date)
        for (const h of s) {
          const _hospital: any = {};
          _hospital.province_name = p.name_th;
          const obj: any = {
            hospital_id: h.id,
            hospcode: h.hospcode,
            hospname: h.hospname
          };
          const _gcs = _.filter(gcs, { hospital_id: h.id })

          obj.details = _gcs;

          let sum = 0;
          hosp.push(obj);
        }
        _province.hospitals = hosp;

        provinces.push(_province);
      }
      zone.severe
      // zone.sum = sumProvince;
      zone.provinces = provinces;
      data.push(zone);
    }
    res.send({ ok: true, rows: data, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/get-medicals', async (req: Request, res: Response) => {
  const db = req.db;
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
      const hospital: any = await model.getHospitalDrugs(db)
      for (const p of province) {
        const _province: any = {};
        _province.province_name = p.name_th;
        const _hosp = _.filter(hospital, { province_code: p.code })
        const hosp = [];
        const sup: any = await model.getMedicals(db)
        for (const h of _hosp) {
          const _hospital: any = {};
          _hospital.province_name = p.name_th;
          const obj = {
            hospital_id: h.id,
            hospcode: h.hospcode,
            hospname: h.hospname
          };
          const _sup = _.filter(sup, { hospital_id: h.id })
          for (const s of _sup) {
            obj[s.generic_id] = s.qty;
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
router.get('/admin/get-bed', async (req: Request, res: Response) => {
  const db = req.db;

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
      const _bed = _.filter(bed, { hospital_id: h.id })
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

router.get('/admin/get-bed/excel', async (req: Request, res: Response) => {
  const db = req.db;
  try {
    var wb = new excel4node.Workbook();
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
    const hospital: any = await model.getHospitalByType(db);
    const hosp = [];
    const bed: any = await model.getBad(db)
    for (const h of hospital) {
      const obj = {
        hospital_id: h.id,
        hospcode: h.hospcode,
        hospname: h.hospname
      };
      const _bed = _.filter(bed, { hospital_id: h.id })
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
  const db = req.db;
  const date = req.query.date;
  const provinceCode = req.decoded.provinceCode;

  try {
    var wb = new excel4node.Workbook();
    var ws = wb.addWorksheet('Sheet 1');

    ws.cell(1, 1).string('โรงพยาบาล');
    ws.cell(1, 2).string('จำนวนผู้ป่วย');
    ws.cell(1, 3).string('Sever');
    ws.cell(1, 4).string('Moderate');
    ws.cell(1, 5).string('Mild');
    ws.cell(1, 6).string('Asymptomatic');
    ws.cell(1, 7).string('IP PUI');

    let row = 2;

    const hospital: any = await model.getHospital(db);
    const s = _.filter(hospital, { province_code: provinceCode })
    const hosp: any = [];
    const gcs: any = await model.getGcsAdmit(db, date)
    for (const h of s) {
      const _gcs = _.filter(gcs, { hospital_id: h.id })
      if (_gcs.length) {
        const obj: any = {
          hospital_id: h.id,
          hospcode: h.hospcode,
          hospname: h.hospname,
          count: _gcs[0].count,
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
      ws.cell(row, 2).string(toString(h.count));
      ws.cell(row, 3).string(toString(h['severe']));
      ws.cell(row, 4).string(toString(h['moderate']));
      ws.cell(row, 5).string(toString(h['mild']));
      ws.cell(row, 6).string(toString(h['asymptomatic']));
      ws.cell(row, 7).string(toString(h['ip_pui']));
      row++;
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
  const db = req.db;
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
      const hospital: any = await model.getHospital(db)
      for (const p of province) {
        const _province: any = {};
        _province.province_name = p.name_th;
        const _hosp = _.filter(hospital, { province_code: p.code })
        const hosp = [];
        const bed: any = await model.getBad(db)
        for (const h of _hosp) {
          const _hospital: any = {};
          _hospital.province_name = p.name_th;
          const obj = {
            hospital_id: h.id,
            hospcode: h.hospcode,
            hospname: h.hospname
          };
          const _bed = _.filter(bed, { hospital_id: h.id })
          for (const b of _bed) {
            obj[b.bed_name + '_qty'] = b.qty;
            obj[b.bed_name + '_covid_qty'] = b.covid_qty;
            obj[b.bed_name + '_usage_qty'] = b.usage_qty;
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

router.get('/get-professional', async (req: Request, res: Response) => {
  const db = req.db;
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
      const hospital: any = await model.getHospital(db)
      for (const p of province) {
        const _province: any = {};
        _province.province_name = p.name_th;
        const _hosp = _.filter(hospital, { province_code: p.code })
        const hosp = [];
        const pro: any = await model.getProfessional(db)
        for (const h of _hosp) {
          const _hospital: any = {};
          _hospital.province_name = p.name_th;
          const obj = {
            hospital_id: h.id,
            hospcode: h.hospcode,
            hospname: h.hospname
          };
          const _pro = _.filter(pro, { hospital_id: h.id })
          for (const p of _pro) {
            obj['p_' + p.professional_id] = p.qty;
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

router.get('/get-medicals', async (req: Request, res: Response) => {
  const db = req.db;
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
      const hospital: any = await model.getHospital(db)
      for (const p of province) {
        const _province: any = {};
        _province.province_name = p.name_th;
        const _hosp = _.filter(hospital, { province_code: p.code })
        const hosp = [];
        const sup: any = await model.getSupplies(db, date)
        for (const h of _hosp) {
          const _hospital: any = {};
          _hospital.province_name = p.name_th;
          const obj = {
            hospital_id: h.id,
            hospcode: h.hospcode,
            hospname: h.hospname
          };
          const _sup = _.filter(sup, { hospital_id: h.id })
          for (const s of _sup) {
            obj[s.generic_id] = s.qty;
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

router.get('/get-supplies', async (req: Request, res: Response) => {
  const db = req.db;
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
      const hospital: any = await model.getHospital(db)
      for (const p of province) {
        const _province: any = {};
        _province.province_name = p.name_th;
        const _hosp = _.filter(hospital, { province_code: p.code })
        const hosp = [];
        const sup: any = await model.getSupplies(db, date)
        for (const h of _hosp) {
          const _hospital: any = {};
          _hospital.province_name = p.name_th;
          const obj = {
            hospital_id: h.id,
            hospcode: h.hospcode,
            hospname: h.hospname
          };
          const _sup = _.filter(sup, { hospital_id: h.id })
          for (const s of _sup) {
            obj[s.generic_id] = s.qty;
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

router.get('/get-gcs/export', async (req: Request, res: Response) => {
  const db = req.db;
  const _provinceCode = req.decoded.provinceCode;
  const date = req.query.date;

  try {
    var wb = new excel4node.Workbook();
    var ws = wb.addWorksheet('Sheet 1');

    let row = 2;
    ws.cell(1, 1).string('โรงพยาบาล');
    ws.cell(1, 2).string('วันที่ Admit');
    ws.cell(1, 3).string('HN');
    ws.cell(1, 4).string('สถานะ');
    const hospital: any = await model.getHospital(db)
    const s = _.filter(hospital, { province_code: _provinceCode })
    const gcs: any = await model.getGcs(db, date);
    moment.locale('th');
    for (const h of s) {
      const _gcs = _.filter(gcs, { hospital_id: h.id })
      for (const g of _gcs) {
        ws.cell(row, 1).string(h.hospname);
        ws.cell(row, 2).string(toString(g.hn));
        ws.cell(row, 3).string(moment(g.date_admit).format('D MMMM ') + ((+moment(g.date_admit).format('YYYY')) + 543));
        ws.cell(row++, 4).string(toString(g.status));
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
    // res.send({ ok: true, rows: data, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/get-supplies/export', async (req: Request, res: Response) => {
  const db = req.db;
  const _provinceCode = req.decoded.provinceCode;
  const date = req.query.date;

  try {
    var wb = new excel4node.Workbook();
    var ws = wb.addWorksheet('Sheet 1');

    let row = 2;
    ws.cell(1, 1).string('โรงพยาบาล');
    ws.cell(1, 2).string('Surgical Gown');
    ws.cell(1, 3).string('Cover All-1');
    ws.cell(1, 4).string('Cover All-2');
    ws.cell(1, 5).string('N95');
    ws.cell(1, 6).string('Shoe Cover');
    ws.cell(1, 7).string('Surgical hood');
    ws.cell(1, 8).string('Long glove');
    ws.cell(1, 9).string('Face shield');
    ws.cell(1, 10).string('Surgical Mask');
    ws.cell(1, 11).string('Powered air-purifying respirator');
    const hospital: any = await model.getHospital(db)
    const _hosp = _.filter(hospital, { province_code: _provinceCode });
    const sup: any = await model.getSupplies(db, date)
    for (const h of _hosp) {
      const _sup = _.filter(sup, { hospital_id: h.id })
      for (const s of _sup) {
        ws.cell(row, 1).string(h.hospname);

        if (s.generic_id == 9) {
          ws.cell(row, 2).string(toString(s.qty))
        } else if (s.generic_id == 10) {
          ws.cell(row, 3).string(toString(s.qty))
        } else if (s.generic_id == 11) {
          ws.cell(row, 4).string(toString(s.qty))
        } else if (s.generic_id == 12) {
          ws.cell(row, 5).string(toString(s.qty))
        } else if (s.generic_id == 13) {
          ws.cell(row, 6).string(toString(s.qty))
        } else if (s.generic_id == 14) {
          ws.cell(row, 7).string(toString(s.qty))
        } else if (s.generic_id == 15) {
          ws.cell(row, 8).string(toString(s.qty))
        } else if (s.generic_id == 16) {
          ws.cell(row, 9).string(toString(s.qty))
        } else if (s.generic_id == 17) {
          ws.cell(row, 10).string(toString(s.qty))
        } else if (s.generic_id == 18) {
          ws.cell(row, 11).string(toString(s.qty))
        };
      }
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
    // res.send({ ok: true, rows: 0, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/fulfill-drugs', async (req: Request, res: Response) => {
  const db = req.db;
  let id = req.query.id
  var wb = new excel4node.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  try {
    id = Array.isArray(id) ? id : [id];
    let drug: any = await drugsModel.getDrugsActived(db)
    let rs: any = await fullfillModel.getFulFillDrugItems(req.db, drug, _.map(id, (v) => { return +v }));
    ws.cell(1, 1).string('ร.พ./รายการยา');
    let col = 2
    for (const items of drug) {
      ws.cell(1, col++).string(items.name);
    }
    let row = 1
    for (const items of rs) {
      col = 2
      ws.cell(++row, 1).string(items.hospname);
      for (const itemD of drug) {
        if (itemD.name in items)
          console.log(items[itemD.name]);
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

router.get('/fulfill-supplies', async (req: Request, res: Response) => {
  const db = req.db;
  let id = req.query.id
  var wb = new excel4node.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  try {
    id = Array.isArray(id) ? id : [id];
    let supplies: any = await suppliesModel.getSuppliesActived(db)
    let rs: any = await fullfillModel.getFulFillSupplesItems(req.db, supplies, _.map(id, (v) => { return +v }));
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
          console.log(items[itemD.name]);
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

function toString(value) {
  if (value || value == 0) {
    return value.toString();
  } else {
    return '';
  }
}


router.get('/province-case-date', async (req: Request, res: Response) => {
  const db = req.db;
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
        const idx = _.findIndex(data, { 'province_code': i.province_code });
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


export default router;