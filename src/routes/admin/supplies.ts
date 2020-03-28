// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import { Router, Request, Response } from 'express';

import { SuppliesModel } from '../../models/supplies';

const suppliesModel = new SuppliesModel();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  try {
    let rs: any = await suppliesModel.getSupplies(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const id: number = req.params.id
  try {
    let rs: any = await suppliesModel.getSuppliesById(req.db, id);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const id: any = req.body.id
  const data: any = req.body.data
  const decoded = req.decoded;

  try {
    if (id && data) {
      let _data: any;
      _data.code = data.code;
      _data.name = data.name;
      _data.unit = data.unit;
      _data.remark = data.remark;
      _data.update_at = data.unit;
      _data.unit = data.unit;
      
      let rs: any = await suppliesModel.getSupplies(req.db);
      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: 'ข้อมูลไม่ครบ', code: HttpStatus.OK });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const data: any = req.body.data
  try {
    let rs: any = await suppliesModel.getSupplies(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id: number = req.params.id
  try {
    let rs: any = await suppliesModel.getSuppliesById(req.db, id);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


export default router;