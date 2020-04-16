
// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import { Router, Request, Response } from 'express';

import { CovidCaseModel } from '../../models/covid-case';
import { BasicModel } from '../../models/basic';
import { SerialModel } from '../../models/serial';
import * as _ from 'lodash';

const serialModel = new SerialModel();
const covidCaseModel = new CovidCaseModel();
const basicModel = new BasicModel();
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

router.get('/node', async (req: Request, res: Response) => {
  const hospitalId = req.decoded.hospitalId;
  try {
    let rs: any = await covidCaseModel.getListHosp(req.db, hospitalId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/node/requisition', async (req: Request, res: Response) => {
  const reqId = req.query.reqId;
  try {
    let rs: any = await covidCaseModel.getListDrug(req.db, reqId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/node/detail', async (req: Request, res: Response) => {
  const hospitalIdClient = req.query.hospitalIdClient;
  try {
    let rs: any = await covidCaseModel.getListHospDetail(req.db, hospitalIdClient);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/node/detail/client', async (req: Request, res: Response) => {
  const hospitalId = req.decoded.hospitalId;
  try {
    let rs: any = await covidCaseModel.getListHospDetailClient(req.db, hospitalId);
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
  const hospcode = req.decoded.hospcode;
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
      telephone: data.tel,
      house_no: data.houseNo,
      room_no: data.roomNo,
      village: data.village,
      village_name: data.villageName,
      road: data.road,
      tambon_code: data.tambonId,
      ampur_code: data.ampurId,
      province_code: data.provinceId,
      zipcode: data.zipcode,
      country_code: data.countryId,
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
      an: data.an,
      date_admit: data.admitDate
    }
    const covidCaseId = await covidCaseModel.saveCovidCase(db, _data);
    const detail = {
      covid_case_id: covidCaseId,
      gcs_id: data.gcsId,
      bed_id: data.bedId,
      ventilator_id: data.ventilatorId
    }
    const covidCaseDetailId = await covidCaseModel.saveCovidCaseDetail(db, detail);
    const generic = await basicModel.getGenerics(db);
    const items = []
    for (const i of data.drugs) {
      const item: any = {
        covid_case_detail_id: covidCaseDetailId,
        generic_id: i.genericId,
      }
      const idx = _.findIndex(generic, { 'id': +i.genericId });
      if (idx > -1) {
        item.qty = generic[idx].first_pay_qty;
      }
      items.push(item);
    }
    await covidCaseModel.saveCovidCaseDetailItem(db, items);
    const resu: any = await saveDrug(db, hospitalId, hospcode, data.drugs, data.gcsId, hospitalType, covidCaseDetailId);
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

async function saveDrug(db, hospitalId, hospcode, drugs, gcsId, hospitalType, covidCaseDetailId) {
  try {

    const currentNo = await covidCaseModel.countRequisitionhospital(db, hospitalId)
    const newSerialNo = await serialModel.paddingNumber(currentNo[0].count + 1, 5)

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
      covid_case_detail_id: covidCaseDetailId,
      code: 'RQ-' + hospcode + '-' + newSerialNo
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
  const db = req.db;
  const data = req.body.data;
  const hospitalId = req.decoded.hospitalId;
  const hospcode = req.decoded.hospcode;
  const hospitalType = req.decoded.hospitalType;
  try {
    const detail = {
      covid_case_id: data.covid_case_id,
      gcs_id: data.gcs_id,
      bed_id: data.bed_id,
      ventilator_id: data.ventilator_id
    }
    const covidCaseDetailId = await covidCaseModel.saveCovidCaseDetail(db, detail);
    const generic = await basicModel.getGenerics(db);
    const items = []
    for (const i of data.drugs) {
      const item: any = {
        covid_case_detail_id: covidCaseDetailId,
        generic_id: i.genericId,
      }
      const idx = _.findIndex(generic, { 'id': +i.genericId });
      if (idx > -1) {
        item.qty = generic[idx].pay_qty;
      }
      items.push(item);
    }
    await covidCaseModel.saveCovidCaseDetailItem(db, items);
    const resu: any = await saveDrug(db, hospitalId, hospcode, data.drugs, data.gcs_id, hospitalType, covidCaseDetailId);
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
  const hospname = req.decoded.hospname;
  try {
    if (type == 'CID') {
      const rs: any = await covidCaseModel.checkCidSameHospital(db, hospitalId, cid);
      if (rs.length) {
        res.send({ ok: false, error: 'เคยบันทึก Case นี้ไปแล้ว' });
      } else {
        const rs: any = await covidCaseModel.checkCidAllHospital(db, cid);
        if (rs.length) {
          res.send({ ok: true, case: 'REFER', rows: rs[0] })
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

router.get('/beds', async (req: Request, res: Response) => {
  const db = req.db;
  const hospitalId = req.decoded.hospitalId;
  try {
    const rs = await covidCaseModel.getBeds(db, hospitalId);
    res.send({ ok: true, rows: rs })
  } catch (error) {
    res.send({ ok: false, error: error });
  }
});

router.get('/gcs', async (req: Request, res: Response) => {
  const db = req.db;
  const hospitalId = req.decoded.hospitalId;
  try {
    const rs = await covidCaseModel.getGcs(db, hospitalId);
    res.send({ ok: true, rows: rs[0] })
  } catch (error) {
    res.send({ ok: false, error: error });
  }
});

router.get('/ventilators', async (req: Request, res: Response) => {
  const db = req.db;
  const hospitalId = req.decoded.hospitalId;
  try {
    const rs = await covidCaseModel.getVentilators(db, hospitalId);
    res.send({ ok: true, rows: rs[0] })
  } catch (error) {
    res.send({ ok: false, error: error });
  }
});


router.post('/requisition-stock', async (req: Request, res: Response) => {
  const hospitalId = req.decoded.hospitalId;
  let id = req.body.id;
  try {
    id = Array.isArray(id) ? id : [id];
    let rs: any = await covidCaseModel.getRequisitionStock(req.db, id, hospitalId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/update/discharge', async (req: Request, res: Response) => {
  const data = req.body.data;
  try {
    const obj: any = {};
    obj.status = data.status;
    obj.date_discharge = data.dateDischarge;
    if (data.hospitalId !== undefined) {
      obj.hospital_id_refer = data.hospitalId;
      obj.reason = data.reason;
    }

    let rs: any = await covidCaseModel.updateDischarge(req.db, data.covidCaseId, obj);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/requisition', async (req: Request, res: Response) => {
  let data = req.body.data;
  let dataReqId = req.body.dataReqId;
  try {
    dataReqId = Array.isArray(dataReqId) ? dataReqId : [dataReqId];
    for (const v of data) {
      await covidCaseModel.updateStockQty(req.db, v.id, v.qty);
    }
    console.log(dataReqId, 'sdfkasdlfja;lsdkjfal;skdjf');

    await covidCaseModel.updateReq(req.db, dataReqId);
    res.send({ ok: true, rows: data, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


export default router;