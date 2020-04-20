
// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
import * as moment from 'moment';
import { Router, Request, Response } from 'express';

import { ApproveDrugsModel } from '../../models/approve-drugs';
import { BasicModel } from '../../models/basic';
import { SerialModel } from '../../models/serial';
import * as _ from 'lodash';

const serialModel = new SerialModel();
const approveDrugsModel = new ApproveDrugsModel();
const basicModel = new BasicModel();
const router: Router = Router();


router.get('/node', async (req: Request, res: Response) => {
  const hospitalId = req.decoded.hospitalId;
  try {
    let rs: any = await approveDrugsModel.getListHosp(req.db, hospitalId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/node/requisition', async (req: Request, res: Response) => {
  const reqId = req.query.reqId;
  try {
    let rs: any = await approveDrugsModel.getListDrug(req.db, reqId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/node/detail', async (req: Request, res: Response) => {
  const hospitalIdClient = req.query.hospitalIdClient;
  const right = req.decoded.rights;
  try {
    const type = [];
    let rs: any = await approveDrugsModel.getListHospDetail(req.db, hospitalIdClient, type);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/node/detail/client', async (req: Request, res: Response) => {
  const hospitalId = req.decoded.hospitalId;
  try {
    let rs: any = await approveDrugsModel.getListHospDetailClient(req.db, hospitalId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/approved', async (req: Request, res: Response) => {
  const hospitalId = req.decoded.hospitalId;
  try {
    let rs: any = await approveDrugsModel.getListApproved(req.db, hospitalId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/approved-detail', async (req: Request, res: Response) => {
  const hospitalId = req.decoded.hospitalId;
  const id = req.query.id;
  try {
    let rs: any = await approveDrugsModel.getListApprovedDetail(req.db, id);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


export default router;