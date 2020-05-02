import * as express from 'express';
import { Router, Request, Response } from 'express';
import { Jwt } from '../models/jwt';

import * as HttpStatus from 'http-status-codes';
import { Login } from '../models/login'
import { ThpdModel } from '../models/thpd';
import { BasicModel } from '../models/basic';
import { Requisition } from '../models/requisition';
import { CovidCaseModel } from '../models/covid-case';
import { SerialModel } from '../models/serial';
import { BedModel } from '../models/setting';
import { cloneDeep } from 'lodash';
const jwt = new Jwt();
const basicModel = new BasicModel();
const covidCaseModel = new CovidCaseModel();
const serialModel = new SerialModel();
const settingModel = new BedModel();
import * as moment from 'moment';
const model = new Login();
const router: Router = Router();
const requisition = new Requisition();
const thpdModel = new ThpdModel();
router.get('/', (req: Request, res: Response) => {
  res.send({ ok: true, message: 'Welcome to RESTful api server!', code: HttpStatus.OK });
});

router.get('/version', (req: Request, res: Response) => {
  res.send({ ok: true, message: '1.3.0', code: HttpStatus.OK });
});

router.get('/demo', (req: Request, res: Response) => {
  if (process.env.DEMO == 'Y') {
    res.send({ ok: true });
  } else {
    res.send({ ok: false });
  }
});

router.get('/date', (req: Request, res: Response) => {
  res.send({ ok: true, rows: moment().format('YYYY-MM-DD HH:mm:ss'), code: HttpStatus.OK });
});

router.get('/date-time-cut', async (req: Request, res: Response) => {
  const timeCut: any = await basicModel.timeCut();
  if (timeCut.ok) {
    res.send({ ok: true, rows: moment().format('YYYY-MM-DD'), code: HttpStatus.OK });
  } else {
    res.send({ ok: true, rows: moment().add(1, 'days').format('YYYY-MM-DD'), code: HttpStatus.OK });
  }
});

router.get('/time-cut', async (req: Request, res: Response) => {
  try {
    const timeCut = await basicModel.timeCut();
    res.send(timeCut);
  } catch (error) {
    res.send({ ok: false, error: error });
  }
});

router.post('/order_sync', async (req: Request, res: Response) => {
  try {
    const db = req.db
    const obj: any = {};
    obj.text = JSON.stringify(req.body);
    obj.con_no = req.body.con_no || null;
    obj.status = req.body.status || null;
    obj.status_name = req.body.status_name || null;
    obj.status_name_th = req.body.status_name_th || null;
    obj.tracking = req.body.tracking || null;
    obj.updated = req.body.updated || null;
    obj.detail = req.body.detail || null;
    await thpdModel.logThpd(db, obj);
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error });
  }
});

router.get('/status', async (req: Request, res: Response) => {
  try {
    const db = req.db
    const rs: any = await thpdModel.getPay(db);
    for (const i of rs) {
      const obj = {
        con_no: i.co_no
      }
      const result: any = await thpdModel.getOrder(obj);
      const _result = result.body
      if (_result.success) {
        const data = {
          status_code: _result.data.status,
          status_name: _result.data.status_name,
          status_name_th: _result.data.status_name_th,
          status_update: moment(_result.data.update, 'X').format('YYYY-MM-DD HH:mm:ss'),
          tracking: _result.data.tracking
        }
        await thpdModel.updatePay(db, i.id, data);
      }

    }
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error });
  }
});


router.get('/updatereq', async (req: Request, res: Response) => {
  try {
    const timeKey = req.query.timeKey;
    if (process.env.TIME_KEY == timeKey) {
      const db = req.db
      const userId = req.decoded ? req.decoded.id : 0;

      // RD
      const headDrug: any = await requisition.getHeadCovidCaseDrugs(db);
      for (const i of headDrug) {
        const drugs = await requisition.getDetailCovidCaseDrugs(db, i.covid_case_detail_id);
        if (drugs.length > 0) {
          const currentNoRd = await covidCaseModel.countRequisitionhospital(db, i.hospital_id_client)
          const newSerialNoRd = await serialModel.paddingNumber(currentNoRd[0].count + 1, 5)

          const headRd = {
            hospital_id_node: i.hospital_id_node,
            hospital_id_client: i.hospital_id_client,
            covid_case_detail_id: i.covid_case_detail_id,
            code: 'RD-' + i.hospital_id_client_code + '-' + newSerialNoRd,
            type: 'DRUG'
          }

          const requisitionIdRd = await covidCaseModel.saveRequisition(db, headRd);
          const detailRd = [];
          for (const d of drugs) {
            const obj = {
              requisition_id: requisitionIdRd[0],
              generic_id: d.generic_id,
              qty: d.qty
            }
            detailRd.push(obj);
          }
          await covidCaseModel.saveRequisitionDetail(db, detailRd);
        }
      }

      // RS
      const headSupplies: any = await requisition.getHeadCovidCaseSupplies(db);
      for (const i of headSupplies) {
        const supplies = await requisition.getDetailCovidCaseSupplies(db, i.covid_case_detail_id);
        if (supplies.length > 0) {
          const currentNoRs = await covidCaseModel.countRequisitionhospital(db, i.hospital_id_client)
          const newSerialNoRs = await serialModel.paddingNumber(currentNoRs[0].count + 1, 5)

          const headRs = {
            hospital_id_node: i.hospital_id_node,
            hospital_id_client: i.hospital_id_client,
            covid_case_detail_id: i.covid_case_detail_id,
            code: 'RS-' + i.hospital_id_client_code + '-' + newSerialNoRs,
            type: 'SUPPLIES'
          }

          const requisitionIdRd = await covidCaseModel.saveRequisition(db, headRs);
          const detailRs = [];
          for (const d of supplies) {
            const obj = {
              requisition_id: requisitionIdRd[0],
              generic_id: d.generic_id,
              qty: d.qty
            }
            detailRs.push(obj);
          }
          await covidCaseModel.saveRequisitionDetail(db, detailRs);
        }
      }

      await requisition.updateIsRequisition(db, userId);
      res.send({ ok: true, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: 'token ไม่ถูกต้อง' });
    }
  } catch (error) {
    console.log(error);
    
    res.send({ ok: false, error: error });
  }
});

router.get('/close-systems', async (req: Request, res: Response) => {
  const db = req.db;
  const timeKey = req.query.timeKey;
  const userId = 0;
  try {
    if (process.env.TIME_KEY == timeKey) {
      await basicModel.closeSystems(db, userId);
      res.send({ ok: true });
    } else {
      res.send({ ok: false, error: 'token ไม่ถูกต้อง' });
    }
  } catch (error) {
    res.send({ ok: false, error: error });
  }
});

router.get('/open-systems', async (req: Request, res: Response) => {
  const db = req.db;
  const userId = 0;
  const timeKey = req.query.timeKey;
  try {
    if (process.env.TIME_KEY == timeKey) {
      await basicModel.openSystems(db, userId);
      res.send({ ok: true });
    } else {
      res.send({ ok: false, error: 'token ไม่ถูกต้อง' });
    }
  } catch (error) {
    res.send({ ok: false, error: error });
  }
});

router.post('/broadcast', async (req: Request, res: Response) => {
  const db = req.db;
  const userId = 0;
  const timeKey = req.query.timeKey;
  const message = req.body.message;
  try {
    if (process.env.TIME_KEY == timeKey) {
      await basicModel.broadcast(db, message, userId);
      res.send({ ok: true });
    } else {
      res.send({ ok: false, error: 'token ไม่ถูกต้อง' });
    }
  } catch (error) {
    res.send({ ok: false, error: error });
  }
});

router.get('/systemUpdate', async (req: Request, res: Response) => {
  let db = req.db
  const timeKey = req.query.timeKey;
  try {
    if (process.env.TIME_KEY == timeKey) {
      let rs: any = await systemUpdate(db);
      if (rs.ok) {
        res.send({ ok: true, rows: rs.rows, code: HttpStatus.OK });
      } else {
        res.send({ ok: false, error: rs.error, code: HttpStatus.OK });
      }
    } else {
      res.send({ ok: false, error: 'token ไม่ถูกต้อง' });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

async function systemUpdate(db) {
  try {
    var items = [];
    let lcd = await settingModel.getLastCaseDetails(db)
    let nowDate = moment(moment(), 'YYYY-MM-DD')
    for (const item of lcd) {
      let _items = await settingModel.getLastCaseDetailItems(db, item.id)
      let startDate = moment(moment(item.entry_date), 'YYYY-MM-DD');
      let _detail = cloneDeep(item)
      while (startDate.isBefore(nowDate)) {
        startDate = startDate.add(1, 'days');
        let set_date = moment(startDate).format('YYYY-MM-DD')
        const caseDetailId = await covidCaseModel.saveCovidCaseDetail(db, {
          covid_case_id: _detail.covid_case_id,
          gcs_id: _detail.gcs_id,
          bed_id: _detail.bed_id,
          medical_supplie_id: _detail.medical_supplie_id,
          patient_id: _detail.patient_id,
          entry_date: set_date,
          status: _detail.status,
          date_admit: _detail.date_admit,
          hospital_id: _detail.hospital_id,
          is_requisition: _detail.is_requisition,
          create_by: 0
        });
        const _covidCaseDetailId = caseDetailId[0].insertId == 0 ? _detail.id : caseDetailId[0].insertId
        items.push({
          covid_case_detail_id: cloneDeep(_covidCaseDetailId),
          generic_id: _items.generic_id,
          qty: _items.qty,
          created_by: 0
        });
      }
      await covidCaseModel.saveCovidCaseDetailItem(db, items);
    }
    return { ok: true, rows: lcd.length }
  } catch (error) {
    console.log(error)
    return { ok: false, error: error.message }
  }
}

export default router;