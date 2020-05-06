// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import { Router, Request, Response } from 'express';
import * as moment from "moment"
import { ReceivesModel } from '../../models/receives';
import { BasicModel } from '../../models/basic';

const receiveModel = new ReceivesModel();
const router: Router = Router();
const basicModel = new BasicModel();

router.get('/fulfill', async (req: Request, res: Response) => {
  const hospitalId = req.decoded.hospitalId;
  const db = req.db;
  try {
    const rs: any = await receiveModel.getFulFill(db, hospitalId);
    for (const i of rs) {
      let detail: any;
      if (i.type == 'DRUG') {
        detail = await receiveModel.getFulFillDetailDrugs(db, i.id, hospitalId);
      } else if (i.type == 'SUPPLIES') {
        detail = await receiveModel.getFulFillDetailSupplies(db, i.id, hospitalId);
      } else if (i.type == 'SURGICALMASK') {
        detail = await receiveModel.getFulFillDetailSurgicalMask(db, i.id, hospitalId);
      }
      i.details = detail;

    }
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const data = req.body.data;
    const items: any = [];
    const userId = req.decoded.id || 0;
    const rs: any = await receiveModel.updateFulfill(req.db, data.type, data.id, userId);
    if (rs) {
      for (const v of data.details) {
        const obj: any = {};
        obj.hospital_id = v.hospital_id;
        obj.generic_id = v.generic_id;
        obj.qty = v.qty;
        obj.created_by = userId;

        items.push(obj);
      }
      await receiveModel.insertWmGenerics(req.db, items);
    }
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;