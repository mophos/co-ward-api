// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
import * as moment from "moment"
import { Router, Request, Response } from 'express';

import { PayModel } from '../../models/pay';

const payModel = new PayModel();
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
  try {
    const obj: any = {};
    obj.src_hospital_id = srcHospitalId;
    obj.dst_hospital_id = data.hospitalId;
    obj.qty = data.qty;
    obj.created_at = moment().format('YYYY-MM-DD HH:mm:ss');
    let rs: any = await payModel.insertSergicalMask(req.db, obj);
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
    console.log(rs);

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

export default router;