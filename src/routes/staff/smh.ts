// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import { Router, Request, Response } from 'express';
import { smhModel } from '../../models/smh';
import { SerialModel } from '../../models/serial';
import moment = require('moment');

const model = new smhModel();
const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
  const db = req.db;
  const key = req.query.key;
  const obj: any = {};

  try {
    const cowardRows = await model.findPersonCoward(db, key);
    const colabRows = await model.findPersonColab(db, key);
    if (cowardRows.length > 0) {
      console.log('co-ward');
      const rs: any = await model.getPerson(db, key);
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
      obj.country_code = 20;

      res.send({ ok: true, rows: obj, code: HttpStatus.OK });
    } else if (colabRows.length > 0) {
      console.log('colab');
      const rs: any = await model.getPersonColab(db, key);
      obj.ampur_name = rs[0].ampur_name;
      obj.tambon_name = rs[0].tambon_name;
      obj.province_name = rs[0].province_name;
      obj.first_name = rs[0].first_name;
      obj.last_name = rs[0].last_name;
      obj.birth_date = await checkDate(moment(rs[0].birth_date).format('YYYYMMDD'));
      obj.telephone = rs[0].telephone;

      obj.house_no = rs[0].address;
      obj.ampur_code = rs[0].subdistrict_code ? rs[0].subdistrict_code.substr(2, 2) : null;
      obj.tambon_code = rs[0].subdistrict_code ? rs[0].subdistrict_code.substr(4, 2) : null;
      obj.province_code = rs[0].province_code;
      obj.zipcode = rs[0].zip_code;
      obj.country_name = 'ไทย';
      obj.country_code = 20;
      res.send({ ok: true, rows: obj, code: HttpStatus.OK });
    } else if (key.length === 13) {
      console.log('api');
      const apiRs: any = await model.getApiExchangeCid(key)
      const rows = apiRs.rows[0];
      if (rows.birthdate.substr(5, 2) || rows.birthdate.substr(8, 2)) {
        rows.birthdate = rows.birthdate.substr(0, 4) + '-01-01';
      }
      const bdate = (+moment(rows.birthdate).format('YYYY') - 543) + '-' + moment(rows.birthdate).format('MM') + '-' + moment(rows.birthdate).format('DD')
      obj.ampur_name = rows.district_name;
      obj.tambon_name = rows.subdistrict_name;
      obj.province_name = rows.province_name;
      obj.first_name = rows.fname;
      obj.last_name = rows.lname;
      obj.birth_date = bdate;

      obj.house_no = rows.houseno + ' ' + rows.moo;
      obj.ampur_code = rows.district_code;
      obj.tambon_code = rows.subdistrict_code;
      obj.province_code = rows.province_code;
      obj.country_name = 'ไทย';
      obj.country_code = 20;
      res.send({ ok: true, rows: obj, code: HttpStatus.OK });
    } else {
      res.send({ ok: true })
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

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