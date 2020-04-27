import { ReportModel } from '../models/report';
/// <reference path="../../typings.d.ts" />
import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import * as _ from 'lodash';
import moment = require('moment');
const excel4node = require('excel4node');
const path = require('path')
const fse = require('fs-extra');
const fs = require('fs');
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
          const obj: any = {
            hospital_id: h.id,
            hospcode: h.hospcode,
            hospname: h.hospname
          };
          const _gcs = _.filter(gcs, { hospital_id: h.id })
          let sum = 0;
          for (const g of _gcs) {
            sum += g.count;
            obj[g.gcs_name] = g.count;
            p[g.gcs_name] += g.count;
          }
          obj.sum = sum;
          sumProvince += obj.sum;
          hosp.push(obj);
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
          // for (const g of _gcs) {
          //   sum += g.count;
          //   obj[g.gcs_name] = g.count;
          //   p[g.gcs_name] += g.count;
          // }
          // obj.sum = sum;
          // sumProvince += obj.sum;
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
  const userId = req.decoded.id;
  try {
    const _provinces: any = await model.getProvinces(db, userId);
    let pCode: any = [];
    for (const v of _provinces) {
      pCode.push(v.province_code)
    }

    let provinces: any = [];
    for (const z of _provinces) {
      const province = await model.getProvince(db, null, z.province_code);
      const hospital: any = await model.getProvinceHospital(db, pCode)
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
    }
    res.send({ ok: true, rows: provinces, code: HttpStatus.OK });
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
  const providerType = req.decoded.providerType;
  const zoneCode = req.decoded.zone_code;
  const type = req.decoded.type;
  const _provinceCode = req.decoded.provinceCode;
  const date = req.query.date;
  const zone = req.query.zone;
  var wb = new excel4node.Workbook();
  var ws = wb.addWorksheet('Sheet 1');

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
    let row = 2
    ws.cell(1, 1).string('เขต');
    ws.cell(1, 2).string('จังหวัด');
    ws.cell(1, 3).string('รหัสโรงพยาบาล');
    ws.cell(1, 4).string('โรงพยาบาล');
    ws.cell(1, 5).string('จำนวนผู้ป่วย');
    ws.cell(1, 6).string('Severe');
    ws.cell(1, 7).string('Moderate');
    ws.cell(1, 8).string('Mild');
    ws.cell(1, 9).string('Asymptomatic');
    ws.cell(1, 10).string('IP PUI');
    for (const z of zoneCodes) {
      const zone: any = {};
      zone.name = z;
      ws.cell(row, 1).string(z);
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
        ws.cell(row, 2).string(p.name_th);
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
          let sum = 0;
          for (const g of _gcs) {
            sum += g.count;
            obj[g.gcs_name] = g.count || 0;
            p[g.gcs_name] += g.count || 0;
          }

          obj.sum = sum;
          sumProvince += obj.sum;
          hosp.push(obj);

          ws.cell(row, 3).string(h.hospcode);
          ws.cell(row, 4).string(h.hospname);
          ws.cell(row, 5).number(+obj.sum || 0);
          ws.cell(row, 6).number(+obj['Severe'] || 0);
          ws.cell(row, 7).number(+obj['Moderate'] || 0);
          ws.cell(row, 8).number(+obj['Mild'] || 0);
          ws.cell(row, 9).number(+obj['Asymptomatic'] || 0);
          ws.cell(row++, 10).number(+obj['IP PUI'] || 0);
        }
        _province.hospitals = hosp;

        provinces.push(_province);
      }
      zone.severe
      zone.sum = sumProvince;
      zone.provinces = provinces;
      data.push(zone);
    }

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `get_gcs`+ moment().format('x');
    let filenamePath = path.join(process.env.TMP_PATH, filename + '.xlsx');

    wb.write(filenamePath, function (err, stats) {
      if (err) {
        console.error(err);
        fse.removeSync(filenamePath);
        res.send({ ok: false, error: err })
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + filename);
        res.sendfile(filenamePath,(v)=>{
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

export default router;