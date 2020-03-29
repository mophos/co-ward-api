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
    res.send({ ok: true, rows: rs, total: rsTotal[0].count, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/detail/:id', async (req: Request, res: Response) => {
  const id = req.params.id
  try {
    let rs: any = await restockModel.getRestockDetail(req.db, id);
    let rsTotal: any = await restockModel.getRestockDetailTotal(req.db, id);
    res.send({ ok: true, rows: rs, total: rsTotal[0].count, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/create', async (req: Request, res: Response) => {
  const decoded = req.decoded
  let rsHead: any
  try {
    let head = {
      created_by: decoded.id
    }
    rsHead = await restockModel.insertRestock(req.db, head);
    let hocp: any = await restockModel.getSuppliesRestockByHosp(req.db);
    for (const _hocp of hocp) {
      let hospData = {
        restock_id: rsHead,
        hospcode: _hocp.hospcode,
      }
      let rsDetail: any = await restockModel.insertRestockDetail(req.db, hospData);
      let data: any = await restockModel.etSuppliesRestockByBalance(req.db, _hocp.hospcode);
      let dataSet = []
      for (const _data of data) {
        dataSet.push({
          restock_detail_id: rsDetail,
          supplies_id: _data.supplies_id,
          qty: +_data.max - +_data.qty
        })
      }
      await restockModel.insertRestockDetailItem(req.db, dataSet);

    }
    res.send({ ok: true, code: HttpStatus.OK });

  } catch (error) {
    console.log(error.message);
    await restockModel.deleteRestock(req.db, rsHead[0]);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


export default router;
