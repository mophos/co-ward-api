// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import * as moment from "moment"
import { Router, Request, Response } from 'express';

import { RestockModel } from '../../models/restock';
import { SuppliesMinMaxModel } from '../../models/supplies_min_max';

const restockModel = new RestockModel();
const suppliesMinMaxModel = new SuppliesMinMaxModel();
const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    let rs: any = await restockModel.getRestock(req.db);
    let rsTotal: any = await restockModel.getRestockTotal(req.db);
    res.send({ ok: true, rows: rs, total: rsTotal.count, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/detail/:id', async (req: Request, res: Response) => {
 const id = req.params.id
  try {
    let rs: any = await restockModel.getRestockDetail(req.db, id);
    let rsTotal: any = await restockModel.getRestockDetailTotal(req.db, id);
    res.send({ ok: true, rows: rs, total: rsTotal, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/create', async (req: Request, res: Response) => {
  const decoded = req.decoded
  let rsHead: any
  try {
    let data: any = await suppliesMinMaxModel.getSuppliesMinMaxByBalance(req.db);
    let head = {
      created_at: moment().format('YYYY-MM-DD HH:MM:SS'),
      created_by: decoded.id
    }
    rsHead = await restockModel.insertRestock(req.db, head);
    let dataSet = []
    for (const _data of data) {
      dataSet.push({
        restock_id: rsHead,
        hospcode: _data.hospcode,
        supplies_id: _data.supplies_id,
        qty: +_data.max - +_data.qty
      })
    }
    let rsDetail: any = await restockModel.insertRestockDetail(req.db, dataSet);

    res.send({ ok: true, rows: rsDetail, code: HttpStatus.OK });
  } catch (error) {
    console.log(error.message);
    await restockModel.deleteRestock(req.db, rsHead[0]);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


export default router;
