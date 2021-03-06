// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
import * as _ from 'lodash';
import { Router, Request, Response } from 'express';

import { BedModel } from '../../models/bed';
import { SuppliesModel } from '../../models/supplies';

const bedModel = new BedModel();
const suppliesModel = new SuppliesModel();

const router: Router = Router();


router.get('/check-bed', async (req: Request, res: Response) => {
  try {
    let rs = await bedModel.checkBed(req.db);
    const data = [];
    const zoneCode = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];
    for (let i = 0; i < 13; i++) {
      const detail = _.filter(rs, { zone_code: zoneCode[i] });
      const provinces = _.map(detail, 'province_code');
      const province = _.uniq(provinces);
      const province_ = [];
      for (const p of province) {
        const _detail: any = _.filter(detail, { province_code: p });
        province_.push({
          province_code: _detail[0].province_code,
          province_name: _detail[0].province_name,
          hospitals: _detail
        })
        // const obj
      }
      data.push({
        zone_code: i + 1,
        provinces: province_
      });
    }
    res.send({ ok: true, rows: data, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/remain/hosp/qty', async (req: Request, res: Response) => {
  try {
    let rs = await bedModel.getRemainHosp(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/check-supplies', async (req: Request, res: Response) => {
  try {
    let rs = await suppliesModel.checkSupplies(req.db, null);
    const data = [];
    const zoneCode = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];
    for (let i = 0; i < 13; i++) {
      const detail = _.filter(rs, { zone_code: zoneCode[i] });
      const provinces = _.map(detail, 'province_code');
      const province = _.uniq(provinces);
      const province_ = [];
      for (const p of province) {
        const _detail: any = _.filter(detail, { province_code: p });
        province_.push({
          province_code: _detail[0].province_code,
          province_name: _detail[0].province_name,
          hospitals: _detail
        })
        // const obj
      }
      data.push({
        zone_code: i + 1,
        provinces: province_
      });
    }
    res.send({ ok: true, rows: data, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


export default router;