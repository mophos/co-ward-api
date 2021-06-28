// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import * as moment from "moment"
import { Router, Request, Response } from 'express';

import { PatientModel } from '../../models/patients';
import { CovidCaseModel } from '../../models/covid-case';

const patientModel = new PatientModel();
const covidCaseModel = new CovidCaseModel();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  const hospitalId: any = req.query.hospitalId
  const startDate: any = req.query.startDate || null;
  const endDate: any = req.query.endDate || null;

  try {
    let rs: any = await patientModel.getPatientDischarge(req.db, hospitalId, startDate, endDate);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


router.post('/', async (req: Request, res: Response) => {
  const data = req.body.data;
  const dateDC = req.body.dateDC;
  const userId = req.decoded.id;
  const db = req.db;
  try {
    // console.log(dateDC);
    // console.log(data);
    for (const i of data) {
      const dateCheck = moment(dateDC)
      if (dateCheck.isBefore(moment(), 'days')) {
        let rs: any = await covidCaseModel.getCovidCaseDetailId(db, i.id, moment(dateCheck).format('YYYY-MM-DD'))
        for (const r of rs) {
          await covidCaseModel.removeRequisition(db, r.id)
          await covidCaseModel.removeCovidCaseDetailItem(db, r.id)
          await covidCaseModel.removeCovidCaseDetail(db, r.id)
        }
      }
      const r: any = await covidCaseModel.getMaxCovidCaseDetail(db, i.id);
      let status = 'DISCHARGE';
      if (r.gcs_id == 5) {
        status = 'NEGATIVE';
      }

      const objD: any = {
        covid_case_id: i.id,
        gcs_id: r[0].gcs_id,
        bed_id: r[0].bed_id,
        status: status,
        medical_supplie_id: r[0].medical_supplie_id || null,
        create_by: userId,
        entry_date: dateDC
      }
      // const timeCut = await basicModel.timeCut();
      // if (!timeCut.ok) {
      //   objD.entry_date = moment().add(1, 'days').format('YYYY-MM-DD');
      // } else {
      //   objD.entry_date = moment().format('YYYY-MM-DD');
      // }
      let rs: any = await covidCaseModel.updateDischarge(req.db, i.id, { status, date_discharge: dateDC, updated_by: userId });
      await covidCaseModel.saveCovidCaseDetail(req.db, objD);

    }

    res.send({ ok: true, rows: 0, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});
export default router;