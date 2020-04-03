// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import * as moment from "moment"
import { Router, Request, Response } from 'express';

import { HospitalModel } from '../../models/hospital';

const hospitalModel = new HospitalModel();
const router: Router = Router();


router.get('/types', async (req: Request, res: Response) => {
  try {
    let rs: any = await hospitalModel.getHospTypes(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/', async (req: Request, res: Response) => {
  const hosptypeId = req.query.hosptype_id || undefined;
  const query = req.query.query || '';
  const limit = req.query.limit || 100;
  const offset = req.query.offset || 0;
  try {
    let rs: any = await hospitalModel.getHospByType(req.db, +offset, +limit, query, hosptypeId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/total', async (req: Request, res: Response) => {
  const hosptypeId = req.query.hosptype_id || undefined;
  const query = req.query.query || '';
  try {
    let rs: any = await hospitalModel.getHospByTypeTotal(req.db, query, hosptypeId);
    res.send({ ok: true, rows: rs[0].count, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;
