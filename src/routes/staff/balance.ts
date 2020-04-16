// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import { Router, Request, Response } from 'express';

import { BalanceModel } from '../../models/balance';

const balanceModel = new BalanceModel();
const router: Router = Router();


router.get('/inventory-status', async (req: Request, res: Response) => {
  let limit = req.query.limit || 20;
  let offset = req.query.offset || 0;
  const hospitalId = req.decoded.hospitalId;
  try {
    let rs: any = await balanceModel.getInventoryStatus(req.db, +limit, +offset, hospitalId);
    let rsTotal: any = await balanceModel.getInventoryStatusTotal(req.db, hospitalId);
    res.send({ ok: true, rows: rs, total: rsTotal[0].count, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/supplies', async (req: Request, res: Response) => {
  const hospcode = req.decoded.hospcode;
  try {
    let rs: any = await balanceModel.getSupplies(req.db, hospcode);

    res.send({ ok: true, rows: rs, code: HttpStatus.OK, hospcode });
  } catch (error) {
    console.log(error);
    
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});
router.get('/', async (req: Request, res: Response) => {
  try {
    let rs: any = await balanceModel.getBalance(req.db, req.decoded.hospcode);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    let rs: any = await balanceModel.getBalanceDetail(req.db, id);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const data = req.body.data;
    const hospcode = req.decoded.hospcode;
    const hospitalId = req.decoded.hospitalId;
    const userId = req.decoded.id;
    const head = {
      hospcode,
      created_by: userId
    }
    const balanceId = await balanceModel.saveHead(req.db, head);
    const currents = [];
    for (const i of data) {
      i.balance_id = balanceId
      const obj = {
        hospcode: hospcode,
        supplies_id: i.supplies_id,
        qty: i.qty,
        usage_rate_day: i.usage_rate_day,
        hospital_id: hospitalId
      }
      currents.push(obj);
    }
    await balanceModel.removeCurrent(req.db, hospcode);
    await balanceModel.saveCurrent(req.db, currents);
    await balanceModel.saveDetail(req.db, data);
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const data = req.body.data;
    const userId = req.decoded.id;
    const logs = [];
    for (const i of data) {
      const log = {
        balance_detail_id: i.id,
        qty_old: i.qty_old,
        qty_new: i.qty,
        update_by: userId
      }
      logs.push(log);
      await balanceModel.update(req.db, i.id, i.qty);
    }
    await balanceModel.updateLog(req.db, logs);
    await balanceModel.updateHead(req.db, id, userId);
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});



export default router;