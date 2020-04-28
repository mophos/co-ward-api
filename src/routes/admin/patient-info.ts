// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import { Router, Request, Response } from 'express';
import { smhModel } from '../../models/smh';

const model = new smhModel();
const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
  const db = req.db;
  const keys = req.query.keys;
  try {
    const rs: any = await model.apiLogin();
    const lab: any = await model.getLabCovid(keys, rs.token);
    const data: any = [];
    if (lab.ok) {
      for (const v of lab.res) {
        const obj: any = {};
        obj.tname = v.title_name;
        obj.fname = v.first_name;
        obj.lname = v.last_name;
        obj.tel = v.mobile;
        obj.sat_id = v.sat_id;

        if (v.sick_sub_district !== null && v.sick_province !== null && v.sick_district !== null) {
          const provinceCode: any = v.sick_sub_district.substring(0, 2);
          const ampurCode: any = v.sick_sub_district.substring(2, 4);
          const tambonCode: any = v.sick_sub_district.substring(4, 6);
          const add: any = await model.getAddress(db, tambonCode, ampurCode, provinceCode);

          obj.ampur_name = add[0].ampur_name;
          obj.tambon_name = add[0].tambon_name;
          obj.province_name = add[0].province_name;
          obj.house_no = v.sick_house_no;
          obj.village = v.sick_village;
          obj.road = v.sick_road;
        }
        data.push(obj);
      }
    } else {
      const rs: any = await model.getPerson(db, keys);
      for (const v of rs) {
        const obj: any = {};
        obj.tname = v.title_name;
        obj.fname = v.first_name;
        obj.lname = v.last_name;
        obj.tel = v.telephone;

        if (v.province_code !== null && v.ampur_code !== null && v.tambon_code !== null) {
          const add: any = await model.getAddress(db, v.tambon_code, v.ampur_code, v.province_code);

          obj.ampur_name = add[0].ampur_name;
          obj.tambon_name = add[0].tambon_name;
          obj.province_name = add[0].province_name;
          obj.house_no = v.sick_house_no;
          obj.village = v.sick_village;
          obj.road = v.sick_road;
        }
        data.push(obj);
      }
    }

    res.send({ ok: true, rows: data, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});
export default router;