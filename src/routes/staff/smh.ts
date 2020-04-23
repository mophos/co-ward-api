// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import { Router, Request, Response } from 'express';

import { smhModel } from '../../models/smh';
import { SerialModel } from '../../models/serial';

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
    obj.ampur_code = rsa.data.districtCode;
    obj.tambon_code = rsa.data.subdistrictCode;
    obj.province_code = rsa.data.provinceCode;
    obj.zipcode = z[0].zip_code;
    obj.country_code = 20;
    obj.village = rsa.data.villageNo;
    obj.country_name = 'ไทย';
    obj.ampur_name = rsa.data.districtDesc;
    obj.tambon_name = rsa.data.subdistrictDesc;
    obj.province_name = rsa.data.provinceDesc;

    res.send({ ok: true, rows: obj, code: HttpStatus.OK });
  } catch (error) {
    try {
      const smh: any = await model.getSmarthealth(cid, token[0].token);
      const smha: any = await model.getSmarthealthAddress(cid, token[0].token);

      const z: any = await model.getZipcode(db, smha.tambon + smha.ampur + smha.changwat);
      const sName: any = await model.getSubdistrict(db, smha.tambon);
      const dName: any = await model.getDistrict(db, smha.ampur);
      const pName: any = await model.getProvince(db, smha.changwat);

      obj.title_id = +smh.prename;
      obj.first_name = smh.name;
      obj.last_name = smh.lame;
      obj.gender_id = smh.sex;
      obj.birth_date = smh.birth;

      obj.house_no = smha.houseno;
      obj.ampur_code = smha.districtCode;
      obj.tambon_code = smha.subdistrictCode;
      obj.province_code = smha.provinceCode;
      obj.zipcode = z[0].zipcode;
      obj.country_code = 20;
      obj.country_name = 'ไทย';
      obj.ampur_name = dName;
      obj.tambon_name = sName;
      obj.province_name = pName;

      res.send({ ok: true, rows: obj, code: HttpStatus.OK });
    } catch (error) {
      res.send({ ok: false, error: error.message, code: HttpStatus.OK });
    }
  }
});

export default router;