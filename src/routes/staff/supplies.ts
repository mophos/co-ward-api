// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import { Router, Request, Response } from 'express';
import { BasicModel } from '../../models/basic';
import { SuppliesModel } from '../../models/supplies';
import * as moment from 'moment';
const basicModel = new BasicModel();
const suppliesModel = new SuppliesModel();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  const db = req.db;
  const hospitalId = req.decoded.hospitalId;
  try {
    let rs: any = await suppliesModel.getSuppliesStock(db, hospitalId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


router.get('/actived', async (req: Request, res: Response) => {
  try {
    let rs: any = await suppliesModel.getSuppliesActived(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/details/:id', async (req: Request, res: Response) => {
  const db = req.db;
  const id = req.params.id;
  try {
    let rs: any = await suppliesModel.getSuppliesStockDetails(db, id);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const db = req.db;
  const userId = req.decoded.id;
  const hospitalId = req.decoded.hospitalId;
  const data = req.body.data;

  try {
    const timeCut = await basicModel.timeCut();
    if (timeCut.ok) {
      const head: any = {};
      head.date = moment().format('YYYY-MM-DD');
      head.create_by = userId;
      head.hospital_id = hospitalId;

      let rs: any = await suppliesModel.saveHead(db, head);
      let id = rs[0].insertId;
      if (!id) {
        const _id = await suppliesModel.getId(db, head);
        id = _id[0].id;
      }

      let detail: any = [];
      for (const v of data) {
        if (v.qty) {
          const objD: any = {};
          objD.wm_supplie_id = id;
          objD.generic_id = v.generic_id;
          objD.qty = v.qty || 0;
          objD.month_usage_qty = v.month_usage_qty || 0;
          detail.push(objD);
        }
      }
      await suppliesModel.saveDetail(db, detail);
      res.send({ ok: true, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: `ขณะนี้เกินเวลา ${moment(timeCut).format('HH:mm').toString()} ไม่สามารถบันทึกได้` });
    }
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});
export default router;