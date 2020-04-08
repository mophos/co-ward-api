// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
import * as moment from "moment"
import { Router, Request, Response } from 'express';

import { Requisition } from '../../models/requisition';
import { SerialModel } from '../../models/serial';
const serialModel = new SerialModel();

const model = new Requisition();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  let db = req.db;
  let hospcode = req.decoded.hospcode

  try {
    let rs: any = await model.getlist(db, hospcode);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/', async (req: Request, res: Response) => {
  let hospcode = req.decoded.hospcode;
  let id = req.decoded.id;
  let data = req.body.data;

  let head = {
    code: await serialModel.getSerial(req.db, 'RQ'),
    created_by: id,
    hospcode: hospcode,
    date: moment().format('YYYY-MM-DD HH:mm:ss')
  }
  let headId: any = await model.saveHead(req.db, head);

  try {
    for (const v of data) {
      let detail = {
        requisition_id: headId,
        hn: v.hn,
        hospcode: v.hospcode,
        cid: v.cid,
        passport: v.passport,
        fname: v.fname,
        lname: v.lname,
        title_id: v.title_id,
        reason: v.reason,
        tel: v.tel
      }
      let detailId = await model.saveDetail(req.db, detail);
      for (const j of v.generics) {
        let items = {
          requisition_detail_id: detailId,
          generic_id: j.id,
          qty: j.qty
        }
        await model.saveItem(req.db, items);
      }
    }
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    await model.delHead(req.db, headId[0]);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;