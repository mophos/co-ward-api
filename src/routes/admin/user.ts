// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
import * as crypto from 'crypto';

import * as moment from "moment"
import { Router, Request, Response } from 'express';

import { UserModel } from '../../models/user';

const userModel = new UserModel();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  try {
    const limit: any = req.query.limit || 100
    const offset: any = req.query.offset || 0
    const query: any = req.query.query || ''
    let rs: any = await userModel.getUser(req.db, +limit, +offset, query);

    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/total', async (req: Request, res: Response) => {
  try {
    const query: any = req.query.query || ''
    let rs: any = await userModel.getUserTotal(req.db, query);

    res.send({ ok: true, rows: rs[0].count, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id
  try {
    let rs: any = await userModel.getUserById(req.db, id);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
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
      let _data: any;
      // _data.code = data.code;
      // _data.name = data.name;
      // _data.unit = data.unit;
      // _data.remark = data.remark;
      data.updated_by = decoded.id;
      data.updated_at = moment().format('YYYY-MM-DD HH:mm:ss')
      data.password = crypto.createHash('md5').update(data.password).digest('hex');
      let rs: any = await userModel.updateUser(req.db, id, data);
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
      data.created_at = moment().format('YYYY-MM-DD HH:mm:ss')
      data.password = crypto.createHash('md5').update(data.password).digest('hex');
      let rs: any = await userModel.insertUser(req.db, data);
      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: 'ข้อมูลไม่ครบ', code: HttpStatus.OK });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = req.params.id
  try {
    const userId = req.decoded.id || 0;
    let rs: any = await userModel.deleteUser(req.db, id, userId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


export default router;