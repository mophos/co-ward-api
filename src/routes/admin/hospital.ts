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
    res.send({ ok: true, rows: rs[0], code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/', async (req: Request, res: Response) => {
  const hosptype_code = req.query.hosptype_code || undefined;
  const ministry_code = req.query.ministry_code || undefined;
  const sub_ministry_code = req.query.sub_ministry_code || undefined;
  const query = req.query.query || '';
  const limit = req.query.limit || 100;
  const offset = req.query.offset || 0;
  try {
    let rs: any = await hospitalModel.getHospByType(req.db, +offset, +limit, query, sub_ministry_code, ministry_code, hosptype_code);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/total', async (req: Request, res: Response) => {
  const hosptype_code = req.query.hosptype_code || undefined;
  const ministry_code = req.query.ministry_code || undefined;
  const sub_ministry_code = req.query.sub_ministry_code || undefined;
  const query = req.query.query || '';
  try {
    let rs: any = await hospitalModel.getHospByTypeTotal(req.db, query, sub_ministry_code, ministry_code, hosptype_code);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;
