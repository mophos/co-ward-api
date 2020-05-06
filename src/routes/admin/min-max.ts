// / <reference path="../../typings.d.ts" />
import { map } from 'lodash';
import * as HttpStatus from 'http-status-codes';
import { Router, Request, Response } from 'express';

import { MinMaxModel } from '../../models/min-max';

const model = new MinMaxModel();
const router: Router = Router();


router.get('/get-hopsnode-drugs', async (req: Request, res: Response) => {
  try {
    let rs: any = await model.getHospNodeDrugs(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/get-hopsnode-supplies', async (req: Request, res: Response) => {
  try {
    let rs: any = await model.getHospNodeSupplies(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/get-min-max', async (req: Request, res: Response) => {
  let hospitalId = req.query.hospitalId;
  const type = req.query.type;
  try {
    let rs: any = await model.getMinMax(req.db, hospitalId, type);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/save', async (req: Request, res: Response) => {
  const db = req.db;
  const data = req.body.data;
  const hospId = data[0].hospital_id;
  const type = req.query.type;
  const decoded = req.decoded;

  try {
    const genericIds = map(data, 'generic_id');
    await model.removeMinMax(db, hospId, genericIds);
    data.created_by = decoded.id || 0;
    await model.saveMinMax(db, data);
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


export default router;