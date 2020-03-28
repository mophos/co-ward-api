// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import { Router, Request, Response } from 'express';

import { BalanceModel } from '../../models/balance';

const balanceModel = new BalanceModel();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  try {
    console.log(req.decoded.hospcode);

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
    const userId = req.decoded.id;
    const head = {
      hospcode,
      created_by: userId
    }
    const balanceId = await balanceModel.saveHead(req.db, head);
    for (const i of data) {
      i.balance_id = balanceId
    }
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