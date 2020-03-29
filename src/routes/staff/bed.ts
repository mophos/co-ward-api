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
        v.qty = 0;
        v.usage = 0;
      }
    }
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const data = req.body.data;
    const hospcode = req.decoded.hospcode;
    for (const v of data) {
      v.hospcode = hospcode;
    }
    await bedModel.del(req.db, hospcode);
    await bedModel.save(req.db, data);
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;