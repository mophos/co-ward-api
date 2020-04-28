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
        detail = await receiveModel.getFulFillDetailDrugs(db, i.id);
      } else if (i.type == 'SUPPLIES') {
        detail = await receiveModel.getFulFillDetailSupplies(db, i.id);
      } else if (i.type == 'SURGICALMASK') {
        detail = await receiveModel.getFulFillDetailSupplies(db, i.id);
      }
      i.details = detail;

    }
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


export default router;