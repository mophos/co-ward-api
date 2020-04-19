// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import { Router, Request, Response } from 'express';

import { BalanceModel } from '../../models/balance';
import { UserModel } from '../../models/user';

const balanceModel = new BalanceModel();
const userModel = new UserModel();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  let db = req.db;
  let query = req.query.query
  const hospcode = req.decoded.hospcode;
  try {
    let rs: any = await userModel.getListUser(db, hospcode, query);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.delete('/remove/:id', async (req: Request, res: Response) => {
  let db = req.db;
  const id = req.params.id
  try {
    let rs: any = await userModel.deleteUser(db, id);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/get-user-right', async (req: Request, res: Response) => {
  let db = req.db;
  let userId = req.query.userId
  let groupName = req.query.groupName
  try {
    let rs: any = await userModel.getUserRight(db, userId, groupName);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.put('/update-user-right/:id', async (req: Request, res: Response) => {
  const id: any = req.params.id
  const data: any = req.body.data

  try {
    await userModel.deleteUserRight(req.db, id);
    await userModel.insertUserRight(req.db, data);
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;