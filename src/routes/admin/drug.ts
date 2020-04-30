// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import * as moment from "moment"
import { Router, Request, Response } from 'express';

import { DrugsModel } from '../../models/drug';

const drugsModel = new DrugsModel();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  const limit: any = req.query.limit || 100
  const offset: any = req.query.offset || 0
  const query: any = req.query.query || ''

  try {
    let rs: any = await drugsModel.getDrugs(req.db, +limit, +offset, query);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/total', async (req: Request, res: Response) => {
  try {
    const query: any = req.query.query || ''
    let rs: any = await drugsModel.getDrugsTotal(req.db, query);

    res.send({ ok: true, rows: rs[0].count, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const id: any = +req.params.id
  const data: any = req.body.data
  const decoded = req.decoded;

  try {
    if (typeof id === 'number' && typeof data === 'object' && id && data) {
      data.updated_by = decoded.id;
      let rs: any = await drugsModel.updateDrugs(req.db, id, data);
      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: 'ข้อมูลไม่ครบ', code: HttpStatus.OK });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const data: any = req.body.data || {}
  const decoded = req.decoded;
  try {
    if (typeof data === 'object' && data) {
      data.created_by = decoded.id;
      let rs: any = await drugsModel.insertDrugs(req.db, data);
      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: 'ข้อมูลไม่ครบ', code: HttpStatus.OK });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id: any = req.params.id
  try {
    const userId = req.decoded.id || 0;
    let rs: any = await drugsModel.deleteDrugs(req.db, id, userId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;