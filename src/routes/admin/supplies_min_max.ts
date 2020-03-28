// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import * as moment from "moment"
import { Router, Request, Response } from 'express';

import { SuppliesMinMaxModel } from '../../models/supplies_min_max';

const suppliesMinMaxModel = new SuppliesMinMaxModel();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  const hopscode = req.decoded.hopscode
  try {
    let rs: any = await suppliesMinMaxModel.getSuppliesMinMax(req.db, hopscode);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const id: any = +req.params.id
  const data: any = req.body.data
  const decoded = req.decoded;

  try {
    if (typeof id === 'number' && typeof data === 'object' && id && data) {
      let _data: any;
      // _data.code = data.code;
      // _data.name = data.name;
      // _data.unit = data.unit;
      // _data.remark = data.remark;
      data.update_by = decoded.id;
      data.update_at = moment().format('YYYY-MM-DD HH:MM:SS')

      let rs: any = await suppliesMinMaxModel.updateSuppliesMinMax(req.db, id, data);
      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: 'ข้อมูลไม่ครบ', code: HttpStatus.OK });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});



export default router;