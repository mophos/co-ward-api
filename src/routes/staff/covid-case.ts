
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
    _.findIndex(right, { name: 'STAFF_APPROVED_DRUGS' }) > -1 ? type.push('DRUG') : null;
    _.findIndex(right, { name: 'STAFF_APPROVED_SUPPLIES' }) > -1 ? type.push('SUPPLIES') : null;
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
      await covidCaseModel.updatePerson(db, data.personId, person);
      const patient = {
        hn: data.hn
      }
      await covidCaseModel.updatePatient(db, data.patientId, patient);


      res.send({ ok: true, code: HttpStatus.OK });

    } else {
      res.send({ ok: false, error: `คุณไม่สามารถแก้ไขได้ เนื่องจากเกินกำหนดเวลา` });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.put('/confirm-date', async (req: Request, res: Response) => {
  const hospitalId = req.decoded.hospitalId;
  const date = req.body.date;
  const id = req.body.id;
  const db = req.db;
  try {
    const _data = {
      confirm_date: date
    }
    const covidCase = await covidCaseModel.updateCovidCaseAllow(db, id, _data);
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const hospitalId = req.decoded.hospitalId;
  const db = req.db;
  const userId = req.decoded.id;
  const data = req.body.data;

  try {
    const timeCut = await basicModel.timeCut();
    const person = {
      cid: data.cid || null,
      passport: data.passport || null,
      title_id: data.titleId,
      first_name: data.fname,
      middle_name: data.mname || null,
      last_name: data.lname,
      gender_id: data.genderId || null,
      people_type: data.peopleType || null,
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
    if (data.type == 'REFER') {
      const dis = {
        update_by: userId,
        status: 'REFER'
      }
      await covidCaseModel.updateDischarge(db, data.covidCaseId, dis)

      const detail: any = {
        covid_case_id: data.covidCaseId,
        status: 'REFER',
        gcs_id: null,
        bed_id: null,
        medical_supplie_id: null,
        create_by: userId
      }
      if (!timeCut.ok) {
        detail.entry_date = moment().add(1, 'days').format('YYYY-MM-DD');
      } else {
        detail.entry_date = moment().format('YYYY-MM-DD');
      }
      await covidCaseModel.saveCovidCaseDetail(db, detail);


      personId = data.personId;
    } else {
      const rs = await covidCaseModel.savePerson(db, person);
      if (rs[0].insertId == 0) {
        if (data.type == 'PASSPORT') {
          const rs = await covidCaseModel.getPersonByPassport(db, data.passport);
          if (rs.length) {
            personId = rs[0].id
          }
        } else if (data.type == 'CID') {
          const rs = await covidCaseModel.getPersonByCid(db, data.cid);
          if (rs.length) {
            personId = rs[0].id
          }
        }
      } else {
        personId = rs[0].insertId;
      }
    }

    const patient = {
      hospital_id: hospitalId,
      hn: data.hn,
      person_id: personId
    }

    const rsP = await covidCaseModel.getPatientByPersonId(db, hospitalId, personId);
    let patientId;
    if (rsP.length) {
      patientId = rsP[0].id;
    } else {
      const sp = await covidCaseModel.savePatient(db, patient);
      patientId = sp[0];
    }

    const _data: any = {
      patient_id: patientId,
      status: 'ADMIT',
      an: data.an,
      date_admit: data.admitDate,
      confirm_date: data.confirmDate,
      created_by: userId
    }
    _data.updated_entry = moment().format('YYYY-MM-DD');
    if (!timeCut.ok) {
      _data.updated_entry = _data.date_entry = moment().add(1, 'days').format('YYYY-MM-DD');
    } else {
      _data.updated_entry = _data.date_entry = moment().format('YYYY-MM-DD');
    }

    const covidCaseId = await covidCaseModel.saveCovidCase(db, _data);
    // const detail: any = {
    //   covid_case_id: covidCaseId[0],
    //   status: 'ADMIT',
    //   gcs_id: data.gcsId,
    //   bed_id: data.bedId,
    //   medical_supplie_id: data.medicalSupplieId || null,
    //   create_by: userId
    // }

    for await (const v of data.detail) {
      const obj: any = {};
      obj.covid_case_id = covidCaseId[0];
      obj.status = 'ADMIT';
      obj.gcs_id = v.gcs_id;
      obj.bed_id = v.bed_id;
      obj.medical_supplie_id = v.medical_supplie_id || null;
      obj.create_by = userId;
      obj.entry_date = v.date;
      obj.created_by = userId;
      const covidCaseDetailId = await covidCaseModel.saveCovidCaseDetail(db, obj);
      const _covidCaseDetailId = covidCaseDetailId[0].insertId;

      const generic = await basicModel.getGenerics(db);
      for (const i of v.drugs) {
        const item: any = {
          covid_case_detail_id: _covidCaseDetailId,
          generic_id: i.generic_id,
        }
        const idx = _.findIndex(generic, { 'id': +i.generic_id });
        if (idx > -1) {
          item.qty = generic[idx].first_pay_qty;
          i.qty = generic[idx].first_pay_qty;
        }
        await covidCaseModel.saveCovidCaseDetailItem(db, item);
      }
    }

    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/old', async (req: Request, res: Response) => {
  const hospitalId = req.decoded.hospitalId;
  const db = req.db;
  const data = req.body.data;
  const userId = req.decoded.id;
  try {
    const person = {
      cid: data.cid || null,
      passport: data.passport || null,
      title_id: data.titleId,
      first_name: data.fname,
      middle_name: data.mname || null,
      last_name: data.lname,
      gender_id: data.genderId,
      people_type: data.peopleType || null,
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
    const rs = await covidCaseModel.savePerson(db, person);
    if (rs[0].insertId == 0) {
      if (data.type == 'PASSPORT') {
        const rs = await covidCaseModel.getPersonByPassport(db, data.passport);
        if (rs.length) {
          personId = rs[0].id
        }
      } else if (data.type == 'CID') {
        const rs = await covidCaseModel.getPersonByCid(db, data.cid);
        if (rs.length) {
          personId = rs[0].id
        }
      }
    } else {
      personId = rs[0].insertId;
    }

    const patient = {
      hospital_id: hospitalId,
      hn: data.hn,
      person_id: personId
    }

    const rsP = await covidCaseModel.getPatientByPersonId(db, hospitalId, personId);
    let patientId;
    if (rsP.length) {
      patientId = rsP[0].id;
    } else {
      const sp = await covidCaseModel.savePatient(db, patient);
      patientId = sp[0];
    }


    const timeCut = await basicModel.timeCut();

    const _data: any = {
      patient_id: patientId,
      an: data.an,
      date_admit: data.admitDate,
      confirm_date: data.confirmDate,
      date_entry: moment().format('YYYY-MM-DD'),
      hospital_id_refer: data.hospitalId,
      reason: data.reason,
      date_discharge: data.dateDischarge,
      status: data.status,
      created_by: userId,
      case_type: 'OLD_CASE'
    }
    _data.updated_entry = moment().format('YYYY-MM-DD');

    if (!timeCut.ok) {
      _data.updated_entry = _data.date_entry = moment().add(1, 'days').format('YYYY-MM-DD');
    } else {
      _data.updated_entry = _data.date_entry = moment().format('YYYY-MM-DD');
    }
    const covidCaseId = await covidCaseModel.saveCovidCase(db, _data);
    let i = 0;
    for (const v of data.date) {
      const detail: any = {
        covid_case_id: covidCaseId[0],
        status: i == data.date.length - 1 ? data.status : 'ADMIT',
        created_by: userId,
        entry_date: moment(v).format('YYYY-MM-DD')
      }
      const covidCaseDetailId = await covidCaseModel.saveCovidCaseOldDetail(db, detail);
      i++;
    }
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
      const currentNoRd = await covidCaseModel.countRequisitionhospitalDrugs(db, hospitalId)
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
      const currentNoRs = await covidCaseModel.countRequisitionhospitalSupplies(db, hospitalId)
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
  const userId = req.decoded.id;
  try {
    const timeCut = await basicModel.timeCut();
    const detail: any = {
      covid_case_id: data.covid_case_id || null,
      gcs_id: data.gcs_id || null,
      bed_id: data.bed_id || null,
      medical_supplie_id: data.medical_supplie_id || null,
      create_by: userId,
      status: data.status
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
      console.log(item);

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

router.get('/details', async (req: Request, res: Response) => {
  const covidCaseId = req.query.covidCaseId;
  try {
    let rs: any = await covidCaseModel.getDetails(req.db, covidCaseId);
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
  const userId = req.decoded.id;

  try {
    const dateCheck = moment(data.dateDischarge)
    if (dateCheck.isBefore(moment(), 'days')) {
      let rs: any = await covidCaseModel.getCovidCaseDetailId(req.db, detail.covid_case_id, moment(dateCheck).format('YYYY-MM-DD'))
      for (const i of rs) {
        await covidCaseModel.removeRequisition(req.db, i.id)
        await covidCaseModel.removeCovidCaseDetailItem(req.db, i.id)
        await covidCaseModel.removeCovidCaseDetail(req.db, i.id)
      }
    }

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
      medical_supplie_id: detail.medical_supplie_id || null,
      create_by: userId
    }
    const timeCut = await basicModel.timeCut();
    if (!timeCut.ok) {
      objD.entry_date = moment().add(1, 'days').format('YYYY-MM-DD');
    } else {
      objD.entry_date = moment().format('YYYY-MM-DD');
    }
    let rs: any = await covidCaseModel.updateDischarge(req.db, detail.covid_case_id, obj);
    await covidCaseModel.saveCovidCaseDetail(req.db, objD);

    res.send({ ok: true, rows: 0, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/requisition', async (req: Request, res: Response) => {
  let data = req.body.data;
  let dataReqId = req.body.dataReqId;
  const userId = req.decoded.id || 0;

  try {
    dataReqId = Array.isArray(dataReqId) ? dataReqId : [dataReqId];
    const _data: any = [];
    for (const v of data) {
      console.log(v);

      if (v.stock_qty - v.requisition_qty < 0) {
      } else {
        const obj: any = {};
        obj.hospital_id = v.hospital_id;
        obj.generic_id = v.generic_id;
        obj.qty = v.requisition_qty;
        obj.created_by = userId;
        _data.push(obj);
      }
    }
    const approveDate = moment().format('YYYY-MM-DD');
    if (data.length == _data.length) {
      await covidCaseModel.decreaseStockQty(req.db, _data);
      await covidCaseModel.updateReq(req.db, dataReqId, approveDate, userId);
      res.send({ ok: true, message: 'ดำเนินการสำเร็จ', code: HttpStatus.OK });
    } else {
      res.send({ ok: true, message: 'จำนวนยาไม่พอจ่าย', code: HttpStatus.OK });
    }

  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/update/old-patient', async (req: Request, res: Response) => {
  const db = req.db;
  const data = req.body.data;
  const userId = req.decoded.id || 0;

  try {
    await covidCaseModel.removeCovidCaseDetailByCaseId(db, data[0].covid_case_id);
    let idx = 0;
    for (const v of data) {
      const detail: any = {
        covid_case_id: v.covid_case_id,
        status: idx == data.length - 1 ? 'DISCHARGE' : 'ADMIT',
        gcs_id: v.gcs_id,
        bed_id: v.bed_id,
        medical_supplie_id: v.medical_supplie_id,
        create_by: userId,
        entry_date: v.date
      }
      await covidCaseModel.saveCovidCaseDetail(db, detail);
      idx++;
    }

    res.send({ ok: true, message: 'ดำเนินการสำเร็จ', code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/list/old-patient', async (req: Request, res: Response) => {
  const db = req.db;
  const hospitalId = req.decoded.hospitalId;

  try {
    const rs: any = await covidCaseModel.listOldPatient(db, hospitalId);

    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/list/old-patient/details', async (req: Request, res: Response) => {
  const db = req.db;
  const id = req.query.id;

  try {
    const rs: any = await covidCaseModel.oldPatientDetail(db, id);

    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;