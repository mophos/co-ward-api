// / <reference path="../../typings.d.ts" />

import { Router, Request, Response } from 'express';
import { DrugsModel } from '../../models/drug';

import * as HttpStatus from 'http-status-codes';
import * as moment from "moment"

const drugsModel = new DrugsModel();
const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
  const db = req.db;
  const hospcode = req.decoded.hospcode;
  try {
    let rs: any
    rs = await drugsModel.getDrugStock(db, hospcode);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/actived', async (req: Request, res: Response) => {
  const db = req.db;
  try {
    let rs: any
    rs = await drugsModel.getDrugsActived(db);
    console.log(rs);
    
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/details/:id', async (req: Request, res: Response) => {
  const db = req.db;
  const id = req.params.id;
  try {
    let rs: any
    rs = await drugsModel.getDrugStockDetails(db, id);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;