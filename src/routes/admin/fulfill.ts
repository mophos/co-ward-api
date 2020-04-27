// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import * as moment from "moment"
import { uniqBy, filter, map } from 'lodash';
import { Router, Request, Response } from 'express';

import { FullfillModel } from '../../models/fulfill';
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
    const rs: any = await model.getFulFill(db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/drugs/approved', async (req: Request, res: Response) => {

  const db = req.db;
  const data = req.body.data;
  try {
    const ids = map(data, 'id');
    const rs: any = await model.getFulFillDetailItems(db, ids);
    await model.approved(db, ids);
    res.send({ ok: true, code: HttpStatus.OK });
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


export default router;