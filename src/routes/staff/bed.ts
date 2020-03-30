// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import { Router, Request, Response } from 'express';

import { BedModel } from '../../models/bed';

const bedModel = new BedModel();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  const hospcode = req.decoded.hospcode;

  try {
    let rs: any
    rs = await bedModel.getBalanceBeds(req.db, hospcode);
    if (rs.length === 0) {
      rs = await bedModel.getBeds(req.db);
      for (const v of rs) {
        v.total = 0;
        v.usage_bed = 0;
      }
    }
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/check-bed', async (req: Request, res: Response) => {
  const provinceCode = req.decoded.provinceCode;

  try {
    let rs = await bedModel.getBedHospital(req.db, provinceCode);

    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const data = req.body.data;
  const hospcode = req.decoded.hospcode;
  const hospitalId = req.decoded.hospital_id;
  const userId = req.decoded.id;

  try {
    let _data = [];
    let __data = [];
    const head: any = {};
    head.hospcode = hospcode;
    head.created_by = userId;
    let headId = await bedModel.saveHead(req.db, head);

    for (const v of data) {
      const obj: any = {};
      obj.bed_history_id = headId;
      obj.bed_id = v.bed_id;
      obj.total = v.total;
      obj.usage_bed = v.usage_bed;
      _data.push(obj);
    }

    for (const v of data) {
      const obj: any = {};
      obj.bed_id = v.bed_id;
      obj.total = v.total;
      obj.usage_bed = v.usage_bed;
      obj.hospcode = hospcode;
      obj.hospital_id = hospitalId;
      __data.push(obj);
    }

    await bedModel.saveDetail(req.db, _data);
    await bedModel.del(req.db, hospcode);
    await bedModel.saveCurrent(req.db, __data);
    await
      res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;