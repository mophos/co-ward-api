// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
import * as moment from "moment"
import { Router, Request, Response } from 'express';

import { PayModel } from '../../models/pay';
import { BasicModel } from '../../models/basic';

const payModel = new PayModel();
const basicModel = new BasicModel();
const router: Router = Router();
const request = require("request");

router.get('/', async (req: Request, res: Response) => {
  try {
    let rs: any = await payModel.getPay(req.db, req.decoded.hospcode);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/surgical-mask', async (req: Request, res: Response) => {
  const hospitalId = req.decoded.hospitalId;
  try {
    let rs: any = await payModel.getSurgicalMask(req.db, hospitalId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const data = req.body.data;
  const srcHospitalId = req.decoded.hospitalId;
const userId = req.decoded.id || 0;

  try {
    const timeCut: any = await basicModel.timeCut();
    const obj: any = {};
    if (timeCut.ok) {
      obj.entry_date = moment().format('YYYY-MM-DD');
    } else {
      obj.entry_date = moment().add(1, 'days').format('YYYY-MM-DD');
    }
    obj.src_hospital_id = srcHospitalId;
    obj.dst_hospital_id = data.hospitalId;
    obj.qty = data.qty;
    obj.created_at = moment().format('YYYY-MM-DD HH:mm:ss');
    obj.created_by = userId;
    let rs: any = await payModel.insertSergicalMask(req.db, obj);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.put('/', async (req: Request, res: Response) => {
  const data = req.body.data;
  const id = req.query.id;
  try {
const userId = req.decoded.id || 0;

    const obj: any = {};
    obj.qty = data.qty;
    let rs: any = await payModel.updateSergicalMask(req.db, obj, id, userId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/:id/:conNo', async (req: Request, res: Response) => {
  const id = req.params.id;
  const conNo = req.params.conNo;
  try {
    let rs: any = await payModel.getPayDetail(req.db, id);
    let rsOrder: any = await getOrder({ con_no: conNo });
    if (rsOrder.body.success) {
      if (rsOrder.body.data.status === 'GWS00') {

      }
    }
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

async function getOrder(data) {
  return new Promise((resolve: any, reject: any) => {
    var options = {
      method: 'POST',
      url: 'http://gw.dxplace.com/api/dxgateways/getorder',
      agentOptions: {
        rejectUnauthorized: false
      },
      headers:
      {
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        'app_id': process.env.APP_ID,
        'app_key': process.env.APP_KEY
      },
      body: data,
      json: true
    };

    request(options, async function (error, body) {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      };
    });
  });
}


router.delete('/:id', async (req: Request, res: Response) => {
  const id = req.params.id
  try {
    const timeCut: any = await basicModel.timeCut();
    if (timeCut.ok) {
      let rs: any = await payModel.delPay(req.db, id);
      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: `ขณะนี้เกินเวลา ${moment(timeCut).format('HH:mm').toString()} ไม่สามารถลบได้` });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


export default router;