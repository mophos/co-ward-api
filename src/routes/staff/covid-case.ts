
// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
import * as moment from 'moment';
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

router.delete('/', async (req: Request, res: Response) => {
  const covidCaseId = req.query.covidCaseId;
  try {
    const timeCut = await basicModel.timeCut();
    if (timeCut.ok) {
      let rs: any = await covidCaseModel.isDeleted(req.db, covidCaseId);
      if (rs) {
        res.send({ ok: true });
      } else {
        res.send({ ok: false, error: `คุณไม่สามารถลบได้ เนื่องจากเกินกำหนดเวลา` });
      }

    } else {
      res.send({ ok: false, error: timeCut.error });
    }
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
  const right = req.decoded.rights;
  try {
    const type = [];
    _.findIndex(right, { name: 'STAFF_COVID_CASE_DRUGS_APPROVED' }) > -1 ? type.push('DRUG') : null;
    _.findIndex(right, { name: 'STAFF_COVID_CASE_SUPPLIES_APPROVEDF' }) > -1 ? type.push('SUPPLIES') : null;
    console.log(type, _.findIndex(right, { name: 'STAFF_COVID_CASE_DRUGS_APPROVED' }), right);
    let rs: any = await covidCaseModel.getListHospDetail(req.db, hospitalIdClient, type);
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

router.put('/', async (req: Request, res: Response) => {
  const hospitalId = req.decoded.hospitalId;
  const data = req.body.data;
  const db = req.db;
  try {
    const _data = {
      an: data.an,
      date_admit: data.admitDate,
      confirm_date: data.confirmDate
    }
    const covidCase = await covidCaseModel.updateCovidCase(db, data.covidCaseId, _data);
    if (covidCase) {

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
        tambon_code: data.tambonCode,
        ampur_code: data.ampurCode,
        province_code: data.provinceCode,
        zipcode: data.zipcode,
        country_code: data.countryCode,
      }
      console.log(person);
      console.log(data.personId);

      const personId = await covidCaseModel.updatePerson(db, data.personId, person);


      const patient = {
        hn: data.hn
      }
      const patientId = await covidCaseModel.updatePatient(db, data.patientId, patient);


      res.send({ ok: true, code: HttpStatus.OK });

    } else {
      res.send({ ok: false, error: `คุณไม่สามารถแก้ไขได้ เนื่องจากเกินกำหนดเวลา` });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const hospitalId = req.decoded.hospitalId;
  const db = req.db;
  const data = req.body.data;
  try {
    const person = {
      cid: data.cid || null,
      passport: data.passport || null,
      title_id: data.titleId,
      first_name: data.fname,
      middle_name: data.mname || null,
      last_name: data.lname,
      gender_id: data.genderId,
      people_type: data.peopleType,
      birth_date: data.birthDate,
      telephone: data.tel || null,
      house_no: data.houseNo || null,
      room_no: data.roomNo || null,
      village: data.village || null,
      village_name: data.villageName || null,
      road: data.road || null,
      tambon_code: data.tambonCode || null,
      ampur_code: data.ampurCode || null,
      province_code: data.provinceCode || null,
      zipcode: data.zipcode || null,
      country_code: data.countryId,
    }

    let personId: any;
    let pid: any
    personId = await covidCaseModel.savePerson(db, person);
    if (personId[0].affectedRows) {
      if (data.passport) {
        pid = await covidCaseModel.getPersonByPassport(db, data.passport);
      } else {
        pid = await covidCaseModel.getPersonByCid(db, data.cid);
      }
      personId[0] = pid[0].id;
    }
    const patient = {
      hospital_id: hospitalId,
      hn: data.hn,
      person_id: personId[0]
    }
    const patientId = await covidCaseModel.savePatient(db, patient);
    const timeCut = await basicModel.timeCut();
    const _data: any = {
      patient_id: patientId,
      status: 'ADMIT',
      an: data.an,
      date_admit: data.admitDate,
      confirm_date: data.confirmDate
    }
    if (!timeCut.ok) {
      _data.date_entry = moment().add(1, 'days').format('YYYY-MM-DD');
    } else {
      _data.date_entry = moment().format('YYYY-MM-DD');
    }
    const covidCaseId = await covidCaseModel.saveCovidCase(db, _data);
    const detail: any = {
      covid_case_id: covidCaseId[0],
      status: 'ADMIT',
      gcs_id: data.gcsId,
      bed_id: data.bedId,
      medical_supplie_id: data.medicalSupplieId || null
    }
    if (!timeCut.ok) {
      detail.entry_date = moment().add(1, 'days').format('YYYY-MM-DD');
    } else {
      detail.entry_date = moment().format('YYYY-MM-DD');
    }
    const covidCaseDetailId = await covidCaseModel.saveCovidCaseDetail(db, detail);
    const _covidCaseDetailId = covidCaseDetailId[0].insertId;
    const generic = await basicModel.getGenerics(db);
    const items = []
    for (const i of data.drugs) {
      const item: any = {
        covid_case_detail_id: _covidCaseDetailId,
        generic_id: i.genericId,
      }
      const idx = _.findIndex(generic, { 'id': +i.genericId });
      if (idx > -1) {
        item.qty = generic[idx].first_pay_qty;
        i.qty = generic[idx].first_pay_qty;
      }
      items.push(item);
    }
    await covidCaseModel.saveCovidCaseDetailItem(db, items);
    // const resu: any = await saveDrug(db, hospitalId, hospcode, data.drugs, data.gcsId, hospitalType, covidCaseDetailId);
    // if (resu.ok) {
    res.send({ ok: true, code: HttpStatus.OK });
    // } else {
    //   res.send({ ok: false, error: resu.error, code: HttpStatus.OK });
    // }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/old', async (req: Request, res: Response) => {
  const hospitalId = req.decoded.hospitalId;
  const db = req.db;
  const data = req.body.data;
  try {
    const person = {
      cid: data.cid,
      passport: data.passport || null,
      title_id: data.titleId,
      first_name: data.fname,
      middle_name: data.mname,
      last_name: data.lname,
      gender_id: data.genderId,
      people_type: data.peopleType,
      birth_date: data.birthDate,
      telephone: data.tel,
      house_no: data.houseNo,
      room_no: data.roomNo,
      village: data.village,
      village_name: data.villageName,
      road: data.road,
      tambon_code: data.tambonCode,
      ampur_code: data.ampurCode,
      province_code: data.provinceCode,
      zipcode: data.zipcode,
      country_code: data.countryId,
    }

    let personId: any;
    personId = await covidCaseModel.savePerson(db, person);
    if (personId[0].affectedRows) {
      let pid = await covidCaseModel.getPersonByCid(db, data.cid);
      personId[0] = pid[0].id;
    }
    const patient = {
      hospital_id: hospitalId,
      hn: data.hn,
      person_id: personId[0]
    }
    const patientId = await covidCaseModel.savePatient(db, patient);
    const timeCut = await basicModel.timeCut();

    const _data = {
      patient_id: patientId,
      an: data.an,
      date_admit: data.admitDate,
      confirm_date: data.confirmDate,
      date_entry: moment().format('YYYY-MM-DD'),
      hospital_id_refer: data.hospitalId,
      reason: data.reason,
      date_discharge: data.dateDischarge,
      status: data.status
    }
    if (!timeCut.ok) {
      _data.date_entry = moment().add(1, 'days').format('YYYY-MM-DD');
    } else {
      _data.date_entry = moment().format('YYYY-MM-DD');
    }
    const covidCaseId = await covidCaseModel.saveCovidCase(db, _data);
    const detail: any = {
      covid_case_id: covidCaseId[0],
      status: data.status
    }
    if (!timeCut.ok) {
      detail.entry_date = moment().add(1, 'days').format('YYYY-MM-DD');
    } else {
      detail.entry_date = moment().format('YYYY-MM-DD');
    }
    const covidCaseDetailId = await covidCaseModel.saveCovidCaseOldDetail(db, detail);
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

async function saveDrug(db, hospitalId, hospcode, drugs, gcsId, hospitalType, covidCaseDetailId) {
  try {
    let hospitalIdNodeSupplies: any;
    let hospitalIdNodeDrugs: any;

    const nodeSupplies: any = await covidCaseModel.findNodeSupplies(db, hospitalId);
    if (nodeSupplies.length) {
      hospitalIdNodeSupplies = nodeSupplies[0].hospital_id;
    } else {
      hospitalIdNodeSupplies = hospitalId;
    }

    const nodeDrugs: any = await covidCaseModel.findNodeDrugs(db, hospitalId);
    if (nodeDrugs.length) {
      hospitalIdNodeDrugs = nodeDrugs[0].hospital_id;
    } else {
      hospitalIdNodeDrugs = hospitalId;
    }


    // RD
    if (drugs.length > 0) {
      const currentNoRd = await covidCaseModel.countRequisitionhospital(db, hospitalId)
      const newSerialNoRd = await serialModel.paddingNumber(currentNoRd[0].count + 1, 5)

      const headRd = {
        hospital_id_node: hospitalIdNodeDrugs,
        hospital_id_client: hospitalId,
        covid_case_detail_id: covidCaseDetailId,
        code: 'RD-' + hospcode + '-' + newSerialNoRd,
        type: 'DRUG'
      }

      const requisitionIdRd = await covidCaseModel.saveRequisition(db, headRd);
      const detailRd = [];
      for (const d of drugs) {
        const obj = {
          requisition_id: requisitionIdRd[0],
          generic_id: d.genericId,
          qty: d.qty
        }
        detailRd.push(obj);
      }

      await covidCaseModel.saveRequisitionDetail(db, detailRd);
    }

    if (gcsId) {
      // RS
      const currentNoRs = await covidCaseModel.countRequisitionhospital(db, hospitalId)
      const newSerialNoRs = await serialModel.paddingNumber(currentNoRs[0].count + 1, 5)

      const headRs = {
        hospital_id_node: hospitalIdNodeSupplies,
        hospital_id_client: hospitalId,
        covid_case_detail_id: covidCaseDetailId,
        code: 'RS-' + hospcode + '-' + newSerialNoRs,
        type: 'SUPPLUES'
      }

      const requisitionIdRs = await covidCaseModel.saveRequisition(db, headRs);
      const detailRs = [];
      const q = await covidCaseModel.getQtySupplues(db, gcsId, hospitalType)
      for (const d of q) {
        const obj = {
          requisition_id: requisitionIdRs[0],
          generic_id: d.generic_id,
          qty: d.qty
        }
        detailRs.push(obj);
      }
      await covidCaseModel.saveRequisitionDetail(db, detailRs);

    }

    return { ok: true };
  } catch (error) {
    console.log(error);
    return { ok: false, error: error };
  }
}

router.get('/present', async (req: Request, res: Response) => {
  const hospitalId = req.decoded.hospitalId;
  const query = req.query.query;
  try {
    let rs: any = await covidCaseModel.getCasePresent(req.db, hospitalId, query);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.put('/present', async (req: Request, res: Response) => {
  const db = req.db;
  const data = req.body.data;

  try {
    const timeCut = await basicModel.timeCut();
    const detail: any = {
      covid_case_id: data.covid_case_id || null,
      gcs_id: data.gcs_id || null,
      bed_id: data.bed_id || null,
      medical_supplie_id: data.medical_supplie_id || null
    }
    if (!timeCut.ok) {
      detail.entry_date = moment().add(1, 'days').format('YYYY-MM-DD');
    } else {
      detail.entry_date = moment().format('YYYY-MM-DD');
    }
    await covidCaseModel.removeCovidCaseDetailItem(db, data.covid_case_details_id)
    const covidCaseDetailId = await covidCaseModel.saveCovidCaseDetail(db, detail);

    const generic = await basicModel.getGenerics(db);
    const items = []
    for (const i of data.drugs) {
      const item: any = {
        covid_case_detail_id: covidCaseDetailId[0].insertId == 0 ? data.id : covidCaseDetailId[0].insertId,
        generic_id: i.genericId,
      }
      const idx = _.findIndex(generic, { 'id': +i.genericId });

      if (idx > -1) {
        item.qty = generic[idx].pay_qty;
        i.qty = generic[idx].pay_qty;
      }
      items.push(item);
    }
    await covidCaseModel.saveCovidCaseDetailItem(db, items);
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
        const rs: any = await covidCaseModel.checkCidAllHospital(db, hospitalId, cid);
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
        const rs: any = await covidCaseModel.checkPassportAllHospital(db, hospitalId, passport);
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
  const hospitalType = req.decoded.hospitalType;
  try {
    const rs = await covidCaseModel.getBeds(db, hospitalId, hospitalType);
    res.send({ ok: true, rows: rs })
  } catch (error) {
    res.send({ ok: false, error: error });
  }
});

router.get('/gcs', async (req: Request, res: Response) => {
  const db = req.db;
  const hospitalId = req.decoded.hospitalId;
  const hospitalType = req.decoded.hospitalType;
  try {
    const rs = await covidCaseModel.getGcs(db, hospitalId, hospitalType);
    res.send({ ok: true, rows: rs })
  } catch (error) {
    res.send({ ok: false, error: error });
  }
});

router.get('/gcs-bed', async (req: Request, res: Response) => {
  const db = req.db;
  const hospitalId = req.decoded.hospitalId;
  const hospitalType = req.decoded.hospitalType;
  try {
    const rsb = await covidCaseModel.getBeds(db, hospitalId, hospitalType);
    res.send({ ok: true, rows: rsb });
  } catch (error) {
    res.send({ ok: false, error: error });
  }
});

router.get('/ventilators', async (req: Request, res: Response) => {
  const db = req.db;
  const hospitalId = req.decoded.hospitalId;
  try {
    const rs = await covidCaseModel.getVentilators(db, hospitalId);
    res.send({ ok: true, rows: rs })
  } catch (error) {
    res.send({ ok: false, error: error });
  }
});
router.get('/medical-supplies', async (req: Request, res: Response) => {
  const db = req.db;
  const hospitalId = req.decoded.hospitalId;
  try {
    const rs = await covidCaseModel.getMedicalSupplies(db, hospitalId);
    res.send({ ok: true, rows: rs })
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
  const detail = req.body.detail;

  try {
    const obj: any = {};
    obj.status = data.status;
    obj.date_discharge = data.dateDischarge;
    if (data.hospitalId !== undefined) {
      obj.hospital_id_refer = data.hospitalId;
      obj.reason = data.reason;
    }

    const objD: any = {
      covid_case_id: detail.covid_case_id,
      gcs_id: detail.gcs_id,
      bed_id: detail.bed_id,
      status: data.status,
      medical_supplie_id: detail.medical_supplie_id || null
    }
    const timeCut = await basicModel.timeCut();
    if (!timeCut.ok) {
      objD.entry_date = moment().add(1, 'days').format('YYYY-MM-DD');
    } else {
      objD.entry_date = moment().format('YYYY-MM-DD');
    }
    let rs: any = await covidCaseModel.updateDischarge(req.db, data.covidCaseId, obj);
    await covidCaseModel.updateCovidCaseDetail(req.db, objD);

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