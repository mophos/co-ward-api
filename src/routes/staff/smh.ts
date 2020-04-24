// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import { Router, Request, Response } from 'express';

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
  const rs: any = await model.getPerson(db, cid);

  try {
    if (!rs.length) {
      const rs: any = await model.infoCid(cid, token[0].token);
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
      obj.birth_date = (+(rs.data.dateOfBirth.toString().substring(0, 4)) - 543) + '-' + rs.data.dateOfBirth.toString().substring(4, 6) + '-' + rs.data.dateOfBirth.toString().substring(6, 8);

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
    } else {
      const add: any = await model.getAddress(db, rs[0].tambon_code, rs[0].ampur_code, rs[0].province_code);

      obj.title_id = rs[0].title_id;
      obj.first_name = rs[0].first_name;
      obj.middlie_name = rs[0].middlie_name;
      obj.last_name = rs[0].last_name;
      obj.people_type = rs[0].people_type;
      obj.middle_name = rs[0].middle_name;
      obj.gender_id = rs[0].gender_id;
      obj.birth_date = moment(rs[0].birth_date).format('YYYY-MM-DD');
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
      obj.ampur_name = add[0].ampur_name;
      obj.tambon_name = add[0].tambon_name;
      obj.province_name = add[0].province_name;
    }

    res.send({ ok: true, rows: obj, code: HttpStatus.OK });
  } catch (error) {
    try {
      const smh: any = await model.getSmarthealth(cid, token[0].token);
      const smha: any = await model.getSmarthealthAddress(cid, token[0].token);
      const add: any = await model.getAddress(db, smha.tambon, smha.ampur, smha.changwat);

      obj.title_id = +smh.prename;
      obj.first_name = smh.name;
      obj.last_name = smh.lame;
      obj.gender_id = smh.sex;
      obj.birth_date = smh.birth;

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

      res.send({ ok: true, rows: obj, code: HttpStatus.OK });
    } catch (error) {
      res.send({ ok: false, error: error.message, code: HttpStatus.OK });
    }
  }
});

export default router;