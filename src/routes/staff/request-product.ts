// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
import * as moment from "moment"
import { Router, Request, Response } from 'express';

import { RequestProductModel } from '../../models/request-products';
import { SerialModel } from '../../models/serial';
const serialModel = new SerialModel();

const model = new RequestProductModel();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  let db = req.db;
  let hospitalId = req.decoded.hospitalId
  try {
    let rs: any = await model.getlist(db, hospitalId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/product-types', async (req: Request, res: Response) => {
  let db = req.db;
  try {
    let rs: any = await model.getProductTypes(db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/products', async (req: Request, res: Response) => {
  let db = req.db;
  const typeId = req.query.typeId == '' || req.query.typeId == 'null' ? null : req.query.typeId;
  try {
    let rs: any = await model.getProducts(db, typeId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});
router.get('/generics', async (req: Request, res: Response) => {
  let db = req.db;
  let hospcode = req.decoded.hospcode
  try {
    let rs: any = await model.getGenerics(db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/info', async (req: Request, res: Response) => {
  let db = req.db;
  let id = req.query.id
  try {
    const head: any = await model.getHead(db, id);
    const detail: any = await model.getDetail(db, id);
    for (const i of detail) {
      const items: any = await model.getDetailItem(db, i.id);
      i.generics = items;
    }
    res.send({ ok: true, rows: detail, head: head[0], code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const hospcode = req.decoded.hospcode;
  const id = req.decoded.id;
  const head = req.body.head;
  const detail = req.body.detail;

  const _head = {
    code: await serialModel.getSerial(req.db, 'RQ'),
    created_by: id,
    hospcode: req.decoded.hospcode,
    hospcode_req: head.hospcode,
    date: moment().format('YYYY-MM-DD HH:mm:ss')
  }
  let headId: any = await model.saveHead(req.db, _head);

  try {
    for (const v of detail) {
      let detail = {
        requisition_id: headId,
        hn: v.hn,
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