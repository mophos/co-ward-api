// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import * as moment from "moment"
import { Router, Request, Response } from 'express';

import { PatientModel } from '../../models/patients';

const patientModel = new PatientModel();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  const hospitalId: any = req.query.hospitalId

  try {
    let rs: any = await patientModel.getPatientDischarge(req.db, hospitalId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;