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


router.put('/:id/:hospcode', async (req: Request, res: Response) => {
  const id: any = +req.params.id
  const hospcode: any = req.params.hospcode
  const data: any = req.body.data
  const decoded = req.decoded;

  try {
    if (typeof id === 'number' && typeof data === 'object' && id && data) {
      let _data: any;
      data.updated_by = decoded.id;
      data.updated_at = moment().format('YYYY-MM-DD HH:MM:SS')

      let rs: any = await suppliesMinMaxModel.updateSuppliesMinMax(req.db, id, hospcode, data);
      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: 'ข้อมูลไม่ครบ', code: HttpStatus.OK });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});



export default router;