// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import * as moment from "moment"
import { uniqBy, filter, map } from 'lodash';
import { Router, Request, Response } from 'express';
import { FullfillModel } from '../../models/fulfill';
import { sumBy } from 'lodash';
import { SerialModel } from '../../models/serial';

const model = new FullfillModel();
const serialModel = new SerialModel();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  const type = req.query.type;
  try {
    let rs: any = await model.getProducts(req.db, type);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/surgical-mask', async (req: Request, res: Response) => {
  try {
    let rs: any = await model.getListSurgicalMasks(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/drugs', async (req: Request, res: Response) => {
  const data = req.body.data;
  const db = req.db;
  const userId = req.decoded.id;
  try {
    const head = {
      created_by: userId,
      code: await serialModel.getSerial(db, 'FD')
    }
    const fulfillId = await model.saveFulFillDrug(db, head);
    const hospitals = uniqBy(data, 'hospital_id');
    for (const h of hospitals) {
      const obj: any = {
        fulfill_drug_id: fulfillId[0],
        hospital_id: h.hospital_id
      }
      const fulfillDetailId = await model.saveFulFillDrugDetail(db, obj);
      const _data = filter(data, { 'hospital_id': h.hospital_id });
      const items = [];
      for (const d of _data) {
        const item: any = {
          fulfill_drug_detail_id: fulfillDetailId,
          generic_id: d.generic_id,
          qty: d.fill_qty
        }
        items.push(item);
      }
      await model.saveFulFillDrugDetailItem(db, items);
    }
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/drugs', async (req: Request, res: Response) => {

  const db = req.db;
  try {
    const rs: any = await model.getFulFillDrugs(db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/drugs/approved', async (req: Request, res: Response) => {

  const db = req.db;
  const data = req.body.data;
  const userId = req.decoded.id;
  try {
    const ids = map(data, 'id');
    const rs: any = await model.getFulFillDrugDetailItems(db, ids);
    if (rs.length) {
      await model.saveQTY(db, rs);
      await model.approved(db, ids, userId);
      res.send({ ok: true, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: 'ไม่มีรายการให้อนุมัติ', code: HttpStatus.OK });
    }
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/supplies', async (req: Request, res: Response) => {
  const data = req.body.data;
  const db = req.db;
  const userId = req.decoded.id;
  try {
    const head = {
      created_by: userId,
      code: await serialModel.getSerial(db, 'FS')
    }
    const fulfillId = await model.saveFulFillSupplies(db, head);
    const hospitals = uniqBy(data, 'hospital_id');
    for (const h of hospitals) {
      const obj: any = {
        fulfill_supplies_id: fulfillId[0],
        hospital_id: h.hospital_id
      }
      const fulfillDetailId = await model.saveFulFillSuppliesDetail(db, obj);
      const _data = filter(data, { 'hospital_id': h.hospital_id });
      const items = [];
      for (const d of _data) {
        const item: any = {
          fulfill_supplies_detail_id: fulfillDetailId,
          generic_id: d.generic_id,
          qty: d.fill_qty
        }
        items.push(item);
      }
      await model.saveFulFillSuppliesDetailItem(db, items);
    }
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/supplies', async (req: Request, res: Response) => {

  const db = req.db;
  try {
    const rs: any = await model.getFulFillSupplies(db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/supplies/approved', async (req: Request, res: Response) => {

  const db = req.db;
  const data = req.body.data;
  const userId = req.decoded.id;
  try {
    const ids = map(data, 'id');
    const rs: any = await model.getFulFillSuppliesDetailItems(db, ids);
    if (rs.length) {
      await model.saveQTY(db, rs);
      await model.approved(db, ids, userId);
      res.send({ ok: true, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: 'ไม่มีรายการให้อนุมัติ', code: HttpStatus.OK });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/min-max/get-hopsnode', async (req: Request, res: Response) => {
  try {
    let rs: any = await model.getHospNode(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/surgical-mask', async (req: Request, res: Response) => {
  const hosptypeCode = req.body.hosptypeCode;
  const totalQty = req.body.totalQty;

  try {
    let rs: any = await model.getHospital(req.db, hosptypeCode);
    let totalWeek1 = sumBy(rs, 'week1');
    let totalWeek2 = sumBy(rs, 'week2');
    let totalWeek3 = sumBy(rs, 'week3');
    let totalWeek4 = sumBy(rs, 'week4');

    for (const v of rs) {
      v.month_usage_qty = v.month_usage_qty === null ? 0 : v.month_usage_qty;
      v.per1 = (((((100 * v.week1) / totalWeek1) * totalQty) / 100) / 50);
      v.per2 = (((((100 * v.week2) / totalWeek2) * totalQty) / 100) / 50);
      v.per3 = (((((100 * v.week3) / totalWeek3) * totalQty) / 100) / 50);
      v.per4 = (((((100 * v.week4) / totalWeek4) * totalQty) / 100) / 50);

      v.per1 = v.per1.toFixed(0) * 50;
      v.per2 = v.per2.toFixed(0) * 50;
      v.per3 = v.per3.toFixed(0) * 50;
      v.per4 = v.per4.toFixed(0) * 50;
    }
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/min-max/get-drug-min-max', async (req: Request, res: Response) => {
  let hospitalId = req.query.hospitalId;
  try {
    let rs: any = await model.getDrugMinMax(req.db, hospitalId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/min-max/save', async (req: Request, res: Response) => {
  const db = req.db;
  const data = req.body.data;
  const hospId = data[0].hospital_id;

  try {

    await model.removeMinMax(db, hospId);
    await model.saveMinMax(db, data);
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/drugs-sum-details', async (req: Request, res: Response) => {
  const db = req.db;
  const id = req.query.id;
  try {
    const rs: any = await model.drugSumDetails(db, id);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


export default router;