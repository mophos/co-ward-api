// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
import { Router, Request, Response } from 'express';
import * as crypto from 'crypto';
import { BedModel } from '../../models/setting';

const model = new BedModel();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  const db = req.db;
  const hospcode = req.decoded.hospcode;
  try {
    const rs = await model.info(db, hospcode);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/user', async (req: Request, res: Response) => {
  const db = req.db;
  const userId = req.decoded.id;
  try {
    const rs = await model.userInfo(db, userId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const db = req.db;
  const data = req.body.data;
  const hospcode = req.decoded.hospcode;
  try {
    const rs = await model.update(db, data[0], hospcode);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.put('/user', async (req: Request, res: Response) => {
  const db = req.db;
  const data = req.body.data;
  const userId = req.decoded.id;
  try {
    if (data[0].password !== undefined) {
      for (const v of data) {
        v.password = crypto.createHash('md5').update(v.password).digest('hex');
      }
    }
    const rs = await model.updateUser(db, data[0], userId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;