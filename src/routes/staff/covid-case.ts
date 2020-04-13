// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import { Router, Request, Response } from 'express';

import { CovidCaseModel } from '../../models/covid-case';

const covidCaseModel = new CovidCaseModel();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  const hospitalId = req.decoded.hospitalId;
  try {
    let rs: any = await covidCaseModel.getCase(req.db, hospitalId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/approved', async (req: Request, res: Response) => {
  const hospitalId = req.decoded.hospitalId;
  try {
    let rs: any = await covidCaseModel.getListApproved(req.db, hospitalId);
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
    let rs: any = await covidCaseModel.getListApprovedDetail(req.db, id);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const hospitalId = req.decoded.hospitalId;
  const hospitalType = req.decoded.hospitalType;
  const data = req.body.data;
  const db = req.db;
  try {
    const person = {
      cid: data.cid,
      passport: data.passport || null,
      title_id: data.titleId,
      first_name: data.fname,
      last_name: data.lname,
      gender_id: data.genderId,
      birth_date: data.birthDate,
      telephone: data.tel
    }
    const personId = await covidCaseModel.savePerson(db, person);
    const patient = {
      hospital_id: hospitalId,
      hn: data.hn,
      person_id: personId[0]
    }
    const patientId = await covidCaseModel.savePatient(db, patient);
    const _data = {
      patient_id: patientId,
      status: 'ADMIT',
      date_admit: data.dateAdmit
    }
    const covidCaseId = await covidCaseModel.saveCovidCase(req.db, _data);
    const detail = {
      covid_case_id: covidCaseId,
      gcs_id: data.gcsId,
      bed_id: data.bedId,
      respirator_id: data.respiratorId
    }
    const covidCaseDetailId = await covidCaseModel.saveCovidCaseDetail(req.db, detail);
    const items = []
    for (const i of data.drugs) {
      const item = {
        covid_case_detail_id: covidCaseDetailId,
        generic_id: i.genericId,
        qty: i.qty
      }
      items.push(item);
    }
    await covidCaseModel.saveCovidCaseDetailItem(req.db, items);
    const resu: any = await saveDrug(db, hospitalId, data.drugs, data.gcsId, hospitalType, covidCaseDetailId);
    if (resu.ok) {
      res.send({ ok: true, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: resu.error, code: HttpStatus.OK });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

async function saveDrug(db, hospitalId, drugs, gcsId, hospitalType, covidCaseDetailId) {
  try {
    const node: any = await covidCaseModel.findNode(db, hospitalId);
    let hospital_id_node;
    if (node.length) {
      hospital_id_node = node[0].hospital_id;
    } else {
      hospital_id_node = hospitalId;
    }
    const head = {
      hospital_id_node,
      hospital_id_client: hospitalId,
      covid_case_detail_id: covidCaseDetailId
    }

    const requisitionId = await covidCaseModel.saveRequisition(db, head);
    const detail = [];
    for (const d of drugs) {
      const obj = {
        requisition_id: requisitionId[0],
        generic_id: d.genericId,
        qty: d.qty
      }
      detail.push(obj);
    }
    const q = await covidCaseModel.getQtySupplues(db, gcsId, hospitalType)
    for (const d of q) {
      const obj = {
        requisition_id: requisitionId[0],
        generic_id: d.generic_id,
        qty: d.qty
      }
      detail.push(obj);
    }
    await covidCaseModel.saveRequisitionDetail(db, detail);
    return { ok: true };
  } catch (error) {
    console.log(error);
    
    return { ok: false, error: error };
  }
}

router.get('/present', async (req: Request, res: Response) => {
  const hospitalId = req.decoded.hospitalId;
  try {
    let rs: any = await covidCaseModel.getCasePresent(req.db, hospitalId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.put('/present', async (req: Request, res: Response) => {
  const data = req.body.data;
  const db = req.db;
  try {
    console.log(data);
    const detail = {
      covid_case_id: data.covid_case_id,
      gcs_id: data.gcs_id,
      bed_id: data.bed_id,
      respirator_id: data.respirator_id
    }
    await covidCaseModel.saveCovidCaseDetail(db, detail);
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/info', async (req: Request, res: Response) => {
  const hospitalId = req.decoded.hospitalId;
  const covidCaseId = req.query.covidCaseId;
  try {
    let rs: any = await covidCaseModel.getInfo(req.db, hospitalId, covidCaseId);
    res.send({ ok: true, rows: rs[0], code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/history', async (req: Request, res: Response) => {
  const personId = req.query.personId;
  try {
    let rs: any = await covidCaseModel.getHistory(req.db, personId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/check-register', async (req: Request, res: Response) => {
  const hospitalId = req.decoded.hospitalId;
  const cid = req.body.cid;
  const passport = req.body.passport;
  const type = req.body.type;
  const db = req.db;
  try {
    if (type == 'CID') {
      const rs: any = await covidCaseModel.checkCidSameHospital(db, hospitalId, cid);
      if (rs.length) {
        res.send({ ok: false, error: 'เคยบันทึก Case นี้ไปแล้ว' });
      } else {
        const rs: any = await covidCaseModel.checkCidAllHospital(db, cid);
        if (rs.length) {
          res.send({ ok: true, case: 'REFER' })
        } else {
          res.send({ ok: true, case: 'NEW' });
        }
      }
    } else if (type == 'PASSPORT') {
      const rs: any = await covidCaseModel.checkPassportSameHospital(db, hospitalId, passport);
      if (rs.length) {
        res.send({ ok: false, error: 'เคยบันทึก Case นี้ไปแล้ว' });
      } else {
        const rs: any = await covidCaseModel.checkPassportAllHospital(db, passport);
        if (rs.length) {
          res.send({ ok: true, case: 'REFER' })
        } else {
          res.send({ ok: true, case: 'NEW' });
        }
      }
    } else {
      res.send({ ok: false })
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


export default router;