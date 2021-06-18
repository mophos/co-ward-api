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

router.get('/', async (req: Request, res: Response) => {
  const db = req.db;
  const key = req.query.key;
  const type = req.query.type;
  const obj: any = {};
  const token: any = await model.getToken(db);
  console.log(key, type);

  try {
    const rs: any = await model.getPerson(db, key);
    const rsd: any = await labCovidAdd(db, key, type);
    if (rsd.sat_id) {
      obj.sat_id = rsd.sat_id;
      obj.telephone = rsd.telephone;
    }
    if (!rs.length) {
      const rsM: any = await model.infoCid(key, token[0].token);
      const smh: any = await model.getSmarthealth(key, token[0].token);
      if (rsM.length) {
        console.log('มหาดไทย');
        const rsa: any = await model.infoCidAddress(key, token[0].token);
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
        const smha: any = await model.getSmarthealthAddress(key, token[0].token);
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



async function labCovidAdd(db, key, type) {
  try {
    let set: any = false;
    const rs: any = await model.apiLogin();
    if (rs.ok) {
      let lab: any;
      if (type === 'THAI') {
        lab = await model.getLabCovidCid(key, rs.token);
        set = true;
      } else if (type === 'FOREIGN') {
        lab = await model.getLabCovidPassport(key, rs.token);
        set = true;
      }
      if (set) {
        const obj: any = {};
        if (lab.ok) {
          if (lab.res[0].sick_sub_district != null) {
            obj.tambon_code = lab.res[0].sick_sub_district.substring(4, 6);
            obj.ampur_code = lab.res[0].sick_sub_district.substring(2, 4);
            obj.province_code = lab.res[0].sick_sub_district.substring(0, 2);
            const adds: any = await model.getAddress(db, obj.tambon_code, obj.ampur_code, obj.province_code);
            if (adds[0] !== undefined) {
              obj.tambon_name = adds[0].tambon_name;
              obj.ampur_name = adds[0].ampur_name;
              obj.province_name = adds[0].province_name;
            }
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
      }
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