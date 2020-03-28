// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import * as moment from "moment"
import { Router, Request, Response } from 'express';

import { SuppliesMinMaxModel } from '../../models/supplies_min_max';

const suppliesMinMaxModel = new SuppliesMinMaxModel();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  const hospcode = req.query.hospcode
  try {
    let rs: any = await suppliesMinMaxModel.getSuppliesMinMax(req.db, hospcode);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


router.get('/by-type', async (req: Request, res: Response) => {

  const hosptype_code = req.query.hosptype_code || undefined;
  const ministry_code = req.query.ministry_code || undefined;
  const sub_ministry_code = req.query.sub_ministry_code || undefined;
  try {
    let rs: any = await suppliesMinMaxModel.getSuppliesMinMaxBytype(req.db, sub_ministry_code, ministry_code, hosptype_code);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


router.post('/', async (req: Request, res: Response) => {
  const hospcode: any = req.query.hospcode
  const data: any = req.body.data
  const decoded = req.decoded;

  try {
    if (typeof hospcode === 'string' && hospcode && data.length) {
      for (const _data of data) {
        _data.hospcode = hospcode
        _data.created_by = decoded.id;
      }
      await suppliesMinMaxModel.deleteSuppliesMinMax(req.db, hospcode);
      let rs: any = await suppliesMinMaxModel.insertSuppliesMinMax(req.db, data);
      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: 'ข้อมูลไม่ครบ', code: HttpStatus.OK });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});



export default router;