// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import * as moment from "moment"
import { Router, Request, Response } from 'express';
import { filter, chunk, map } from 'lodash';
import { RestockModel } from '../../models/restock';
import { SerialModel } from '../../models/serial';
import { SuppliesMinMaxModel } from '../../models/supplies_min_max';
const uuidv4 = require('uuid/v4');


const serialModel = new SerialModel();
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
      code:  await serialModel.getSerial(req.db, 'RS'),
      created_by: decoded.id
    }
    rsHead = await restockModel.insertRestock(req.db, head);
    let hocp_: any = await restockModel.getSuppliesRestockByHosp(req.db);
    let _hosp = chunk(hocp_, 15)
    let hospData = []
    let dataSet = []
    for (const hocp of _hosp) {
      let data: any = await restockModel.getSuppliesRestockByBalance(req.db, map(hocp, 'hospcode'));
      for (const _hocp of hocp) {
        let detailId = uuidv4();
        hospData.push({
          id: detailId,
          restock_id: rsHead,
          hospcode: _hocp.hospcode,
        })
        let tmp = filter(data, { 'hospcode': _hocp.hospcode })
        for (const _data of tmp) {
          dataSet.push({
            restock_detail_id: detailId,
            supplies_id: _data.supplies_id,
            qty: +_data.max - +_data.qty
          })
        }
      }
    }
    await restockModel.insertRestockDetail(req.db, hospData);
    await restockModel.insertRestockDetailItem(req.db, dataSet);
    res.send({ ok: true, code: HttpStatus.OK });

  } catch (error) {
    console.log(error.message);
    await restockModel.deleteRestock(req.db, rsHead[0]);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


export default router;
