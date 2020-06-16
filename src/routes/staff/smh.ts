// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import { Router, Request, Response } from 'express';
import { replace } from 'lodash';
import { smhModel } from '../../models/smh';
import { SerialModel } from '../../models/serial';
import moment = require('moment');

const model = new smhModel();
const serialModel = new SerialModel();
const router: Router = Router();

var c = 0;
var t;
var timer_is_on = 0;

function timedCount() {
  c = c + 1;
  t = setTimeout(timedCount, 1000);
}

function startCount() {
  if (!timer_is_on) {
    timer_is_on = 1;
    timedCount();
  }
}

function stopCount() {
  clearTimeout(t);
  timer_is_on = 0;
}

router.get('/', async (req: Request, res: Response) => {
  const db = req.db;
  const cid = req.query.cid;
  const obj: any = {};
  const token: any = await model.getToken(db);

  try {
    const rs: any = await model.getPerson(db, cid);
    if (!rs.length) {
      const rsM: any = await model.infoCid(cid, token[0].token);
      const smh: any = await model.getSmarthealth(cid, token[0].token);
      const rsd: any = await labCovidAdd(db, cid);
      if (rsd.sat_id) {
        obj.sat_id = rsd.sat_id;
        obj.telephone = rsd.telephone;
      }
      if (rsM.length) {
        console.log('มหาดไทย');
        const rsa: any = await model.infoCidAddress(cid, token[0].token);

        const sCode = serialModel.paddingNumber(rsa.data.subdistrictCode, 2);
        const dCode = serialModel.paddingNumber(rsa.data.districtCode, 2);
        const pCode = serialModel.paddingNumber(rsa.data.provinceCode, 2);
        const z: any = await model.getZipcode(db, pCode + dCode + sCode);

        obj.title_id = rs.data.titleCode;
        obj.first_name = rs.data.firstName;
        obj.last_name = rs.data.lastName;
        obj.middle_name = rs.data.middleName;
        obj.gender_id = rs.data.genderCode;
        // obj.birth_date = await checkDate(rs.data.dateOfBirth.toString());
        obj.birth_date = await checkDate(null);

        obj.house_no = rsa.data.houseNo;
        obj.ampur_code = dCode;
        obj.tambon_code = sCode;
        obj.province_code = pCode;
        obj.zipcode = z[0].zip_code;
        obj.country_code = 20;
        obj.village = rsa.data.villageNo;
        obj.country_name = 'ไทย';
        obj.ampur_name = rsa.data.districtDesc;
        obj.tambon_name = rsa.data.subdistrictDesc;
        obj.province_name = rsa.data.provinceDesc;
      } else if (smh.cid != undefined) {
        console.log('Smart Health');
        const smha: any = await model.getSmarthealthAddress(cid, token[0].token);
        const add: any = await model.getAddress(db, smha.tambon, smha.ampur, smha.changwat);
        obj.title_id = +smh.prename;
        obj.first_name = smh.name;
        obj.last_name = smh.lname;
        obj.gender_id = smh.sex;
        obj.birth_date = await checkDate(moment(smh.birth).format('YYYYMMDD'));

        obj.house_no = smha.houseno;
        obj.ampur_code = smha.districtCode;
        obj.tambon_code = smha.subdistrictCode;
        obj.province_code = smha.provinceCode;
        obj.zipcode = add[0].zip_code;
        obj.country_code = 20;
        obj.country_name = 'ไทย';
        obj.ampur_name = add[0].ampur_name;
        obj.tambon_name = add[0].tambon_name;
        obj.province_name = add[0].province_name;
      } else if (Object.values(rsd).length) {
        console.log('covid-lab');
        Object.assign(obj, rsd);
      } else {
        obj.country_code = 20;
        obj.country_name = 'ไทย';
      }
    } else {
      console.log('co-ward');
      if (rs[0].tambon_code != null || rs[0].ampur_code != null || rs[0].province_code != null) {
        const add: any = await model.getAddress(db, rs[0].tambon_code, rs[0].ampur_code, rs[0].province_code);
        obj.ampur_name = add[0].ampur_name;
        obj.tambon_name = add[0].tambon_name;
        obj.province_name = add[0].province_name;
      }
      obj.title_id = rs[0].title_id;
      obj.first_name = rs[0].first_name;
      obj.middlie_name = rs[0].middlie_name;
      obj.last_name = rs[0].last_name;
      obj.people_type = rs[0].people_type;
      obj.middle_name = rs[0].middle_name;
      obj.gender_id = rs[0].gender_id;
      obj.birth_date = await checkDate(moment(rs[0].birth_date).format('YYYYMMDD'));
      obj.telephone = rs[0].telephone;

      obj.house_no = rs[0].house_no;
      obj.room_no = rs[0].room_no;
      obj.ampur_code = rs[0].ampur_code;
      obj.tambon_code = rs[0].tambon_code;
      obj.province_code = rs[0].province_code;
      obj.zipcode = rs[0].zipcode;
      obj.country_code = rs[0].country_code;
      obj.village = rs[0].village;
      obj.village_name = rs[0].village_name;
      obj.road = rs[0].road;
      obj.country_name = 'ไทย';
    }

    res.send({ ok: true, rows: obj, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

async function labCovid(cid) {
  const rs: any = await model.apiLogin();
  if (rs.ok) {
    const lab: any = await model.getLabCovid(cid, rs.token);
    const obj: any = {};
    if (lab.ok) {
      obj.sat_id = lab.res[0].sat_id;
      obj.telephone = replace(lab.res[0].mobile, /\s/g, '');
    }
    return obj;
  } else {
    return false;
  }
}

async function labCovidAdd(db, cid) {
  try {
    const rs: any = await model.apiLogin();
    if (rs.ok) {
      const lab: any = await model.getLabCovid(cid, rs.token);
      const obj: any = {};
      if (lab.ok) {
        const tambonCode: any = lab.res[0].sick_sub_district;
        const ampurCode: any = lab.res[0].sick_district;
        const provinceCode: any = lab.res[0].sick_province;

        if (tambonCode != null) {
          obj.tambon_code = tambonCode;
          const subd: any = await model.getSubDistrict(db, tambonCode);
          obj.tambon_name = subd[0].name_th;
        }
        if (ampurCode != null) {
          obj.ampur_code = ampurCode;
          const d: any = await model.getDistrict(db, ampurCode);
          obj.ampur_name = d[0].name_th;
        }
        if (provinceCode != null) {
          obj.province_code = provinceCode;
          const p: any = await model.getProvince(db, provinceCode);
          obj.province_name = p[0].name_th;
        }
        obj.country_name = 'ไทย';
        obj.country_code = 20;
        obj.gender_id = null;
        obj.sat_id = lab.res[0].sat_id;
        obj.first_name = lab.res[0].first_name;
        obj.last_name = lab.res[0].last_name;
        obj.telephone = replace(lab.res[0].mobile, /\s/g, '');
        obj.house_no = lab.res[0].sick_house_no;
        obj.village = lab.res[0].sick_village;
        obj.road = lab.res[0].sick_road;
      }
      return obj;
    } else {
      return false;
    }
  } catch (error) {
    return error;
  }
}

async function checkDate(date) {
  try {
    if (date.length == 8) {
      var year = (date.toString().substring(0, 4));
      var month = (date.toString().substring(4, 6));
      var day = (date.toString().substring(6, 8));
      if (year == '0000') {
        year = moment().format('YYYY');
      }

      if (month == '00') {
        month = moment().format('MM');
      }

      if (day == '00') {
        day = moment().format('DD');
      }

      date = year + '-' + month + '-' + day;
      return date;
    } else {
      return 'empty';
    }
  } catch (error) {
    return 'empty';
  }
}

export default router;