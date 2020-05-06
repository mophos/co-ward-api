// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import { Router, Request, Response } from 'express';
import * as moment from "moment"
import { BalanceModel } from '../../models/balance';
import { BasicModel } from '../../models/basic';

const balanceModel = new BalanceModel();
const router: Router = Router();
const basicModel = new BasicModel();

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

router.get('/receives', async (req: Request, res: Response) => {
  const hospitalId = req.decoded.hospitalId;

  try {
    let rs: any = await balanceModel.getReceives(req.db, hospitalId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/get-receives-detail', async (req: Request, res: Response) => {
  const id = req.query.id;
  try {
    let rs: any = await balanceModel.getReceivesDetail(req.db, id);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/get-receives-generics', async (req: Request, res: Response) => {
  try {
    let rs: any = await balanceModel.getReceivesGenerics(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/save', async (req: Request, res: Response) => {
  try {
    const data = req.body.data;
    const hospitalId = req.decoded.hospitalId;
    const userId = req.decoded.id;
    const timeCut: any = await basicModel.timeCut();
    const obj: any = {};
    if (timeCut.ok) {
      obj.entry_date = moment().format('YYYY-MM-DD');
    } else {
      obj.entry_date = moment().add(1, 'days').format('YYYY-MM-DD');
    }
    obj.hospital_id = hospitalId;
    obj.created_by = userId;
    const receiveId = await balanceModel.saveHeadReceives(req.db, obj)
    let id = receiveId[0].insertId;
    if (!id) {
      const _id = await balanceModel.getId(req.db, obj);
      id = _id[0].id;
    }
    const currents = [];
    for (const i of data) {
      const obj = {
        wm_receive_id: id,
        generic_id: i.generic_id,
        qty: i.qty
      }
      currents.push(obj);
    }
    await balanceModel.saveDetailReceives(req.db, currents);
    res.send({ ok: true, code: HttpStatus.OK });
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
      await balanceModel.update(req.db, i.id, i.qty, userId);
    }
    await balanceModel.updateLog(req.db, logs);
    await balanceModel.updateHead(req.db, id, userId);
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;