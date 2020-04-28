// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
import { uniqBy, filter, map } from 'lodash';
import { Router, Request, Response } from 'express';
import { FullfillModel } from '../../models/fulfill';
import { sumBy } from 'lodash';
import { SerialModel } from '../../models/serial';
import { PayModel } from '../../models/pay';
import * as moment from 'moment';

const request = require("request");
const uuidv4 = require('uuid/v4');
const model = new FullfillModel();
const payModel = new PayModel();
const serialModel = new SerialModel();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  const type = req.query.type;
  try {
    let rs: any = await model.getProducts(req.db, type);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/drugs', async (req: Request, res: Response) => {
  const data = req.body.data;
  const db = req.db;
  const userId = req.decoded.id;
  try {
    const head = {
      created_by: userId,
      code: await serialModel.getSerial(db, 'FD')
    }
    const fulfillId = await model.saveFulFillDrug(db, head);
    const hospitals = uniqBy(data, 'hospital_id');
    for (const h of hospitals) {
      const obj: any = {
        fulfill_drug_id: fulfillId[0],
        hospital_id: h.hospital_id
      }
      const fulfillDetailId = await model.saveFulFillDrugDetail(db, obj);
      const _data = filter(data, { 'hospital_id': h.hospital_id });
      const items = [];
      for (const d of _data) {
        const item: any = {
          fulfill_drug_detail_id: fulfillDetailId,
          generic_id: d.generic_id,
          qty: d.fill_qty
        }
        items.push(item);
      }
      await model.saveFulFillDrugDetailItem(db, items);
    }
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/drugs', async (req: Request, res: Response) => {

  const db = req.db;
  try {
    const rs: any = await model.getFulFillDrugs(db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/drugs/approved', async (req: Request, res: Response) => {

  const db = req.db;
  const data = req.body.data;
  const userId = req.decoded.id;
  try {
    const ids = map(data, 'id');
    const rs: any = await model.getFulFillDrugDetailItems(db, ids);
    if (rs.length) {
      // await model.saveQTY(db, rs);
      await model.approvedDrugs(db, ids, userId);
      res.send({ ok: true, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: 'ไม่มีรายการให้อนุมัติ', code: HttpStatus.OK });
    }
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/supplies', async (req: Request, res: Response) => {
  const data = req.body.data;
  const db = req.db;
  const userId = req.decoded.id;
  try {
    const head = {
      created_by: userId,
      code: await serialModel.getSerial(db, 'FS')
    }
    const fulfillId = await model.saveFulFillSupplies(db, head);
    const hospitals = uniqBy(data, 'hospital_id');
    for (const h of hospitals) {
      const obj: any = {
        fulfill_supplies_id: fulfillId[0],
        hospital_id: h.hospital_id
      }
      const fulfillDetailId = await model.saveFulFillSuppliesDetail(db, obj);
      const _data = filter(data, { 'hospital_id': h.hospital_id });
      const items = [];
      for (const d of _data) {
        const item: any = {
          fulfill_supplies_detail_id: fulfillDetailId,
          generic_id: d.generic_id,
          qty: d.fill_qty
        }
        items.push(item);
      }
      await model.saveFulFillSuppliesDetailItem(db, items);
    }
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/supplies', async (req: Request, res: Response) => {

  const db = req.db;
  try {
    const rs: any = await model.getFulFillSupplies(db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/supplies/approved', async (req: Request, res: Response) => {

  const db = req.db;
  const data = req.body.data;
  const userId = req.decoded.id;
  try {
    const ids = map(data, 'id');
    const rs: any = await model.getFulFillSuppliesDetailItems(db, ids);
    if (rs.length) {
      // await model.saveQTY(db, rs);
      await model.approvedSupplies(db, ids, userId);
      res.send({ ok: true, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: 'ไม่มีรายการให้อนุมัติ', code: HttpStatus.OK });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/min-max/get-hopsnode', async (req: Request, res: Response) => {
  try {
    let rs: any = await model.getHospNode(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/detail/surgical-mask-details', async (req: Request, res: Response) => {
  const id = req.query.id;
  try {
    let rs: any = await model.getDetailSurgicalMasks(req.db, id);

    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


router.post('/surgical-mask', async (req: Request, res: Response) => {
  const hosptypeCode = req.body.hosptypeCode;
  const totalQty = req.body.totalQty;

  try {
    let rs: any = await model.getHospital(req.db, hosptypeCode);
    let totalWeek1 = sumBy(rs, 'week1');
    let totalWeek2 = sumBy(rs, 'week2');
    let totalWeek3 = sumBy(rs, 'week3');
    let totalWeek4 = sumBy(rs, 'week4');

    for (const v of rs) {
      v.month_usage_qty = v.month_usage_qty === null ? 0 : v.month_usage_qty;
      v.per1 = (((v.week1 / totalWeek1) * totalQty) / 50);
      v.per2 = (((v.week2 / totalWeek2) * totalQty) / 50);
      v.per3 = (((v.week3 / totalWeek3) * totalQty) / 50);
      v.per4 = (((v.week4 / totalWeek4) * totalQty) / 50);

      v.per1 = v.per1.toFixed(0) * 50;
      v.per2 = v.per2.toFixed(0) * 50;
      v.per3 = v.per3.toFixed(0) * 50;
      v.per4 = v.per4.toFixed(0) * 50;
    }
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/min-max/get-drug-min-max', async (req: Request, res: Response) => {
  let hospitalId = req.query.hospitalId;
  try {
    let rs: any = await model.getDrugMinMax(req.db, hospitalId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/min-max/save', async (req: Request, res: Response) => {
  const db = req.db;
  const data = req.body.data;
  const hospId = data[0].hospital_id;

  try {

    await model.removeMinMax(db, hospId);
    await model.saveMinMax(db, data);
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/surgical-mask/save', async (req: Request, res: Response) => {
  const db = req.db;
  const data = req.body.data;
  const week = req.body.week;
  const id = req.decoded.id;

  const hospData = [];
  const dataSet = [];
  let head = {
    code: await serialModel.getSerial(db, 'FSM'),
    created_by: id
  }
  const rsHead = await model.saveHeadSurgicalMask(db, head);

  try {
    let qty = 0;
    for (const v of data) {
      let detailId = uuidv4();
      hospData.push({
        id: detailId,
        fulfill_surgical_mask_id: rsHead,
        hospital_id: v.hospital_id,
      })

      if (week == 1) {
        qty = v.per1;
      } else if (week == 2) {
        qty = v.per2;
      } else if (week == 3) {
        qty = v.per3;
      } else if (week == 4) {
        qty = v.per4;
      }

      dataSet.push({
        fulfill_surgical_mask_detail_id: detailId,
        generic_id: v.generic_id,
        qty: qty
      })
    }
    await model.saveDetailSurgicalMask(req.db, hospData);
    await model.saveItemSurgicalMask(req.db, dataSet);

    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    await model.delHeadSurgicalMask(req.db, rsHead)
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/drugs-sum-details', async (req: Request, res: Response) => {
  const db = req.db;
  const id = req.query.id;
  try {
    const rs: any = await model.drugSumDetails(db, id);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/approved-surgicak-mask', async (req: Request, res: Response) => {
  const db = req.db;
  const id = req.query.data;
  const userId = req.decoded.id;

  try {
    let detail: any = await model.getFulfillDetails(db, id);
    let payId = await payModel.saveHead(db, detail);
    let start = payId[0];
    let end = detail.length + payId[0];
    await payModel.selectInsertDetail(db, start, end);
    let rs = await sendTHPD(db, start, end);
    for (const v of id) {
      const obj: any = {};
      obj.is_approved = 'Y';
      obj.approved_by = userId;
      obj.approved_date = moment().format('YYYY-MM-DD HH:mm:ss');
      await payModel.updateFulfillSurgicalMask(db, v, obj);
    }
    res.send({ ok: true, rows: [rs, start, end], code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/supplies-sum-details', async (req: Request, res: Response) => {
  const db = req.db;
  const id = req.query.id;
  try {
    const rs: any = await model.suppliesSumDetails(db, id);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


router.get('/list/surgical-mask', async (req: Request, res: Response) => {
  try {
    let rs: any = await model.getListSurgicalMasks(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


async function sendTHPD(db, start, end) {
  for (let v = start; v < end; v++) {
    let rsHead: any = await payModel.paySurgicalMaskHead(db, v);
    rsHead = rsHead[0];

    const obj: any = {};

    obj.con_no = rsHead[0].con_no;
    obj.s_name = 'องค์การเภสัชกรรม';
    obj.s_address = '75/1 ถ.พระรามที่ 6';
    obj.s_subdistrict = 'ทุ่งพญาไท';
    obj.s_district = 'ราชเทวี';
    obj.s_province = 'กรุงเทพมหานคร';
    obj.s_lat = '13.7667625';
    obj.s_lon = '100.5285502';
    obj.s_zipcode = '10400';
    obj.s_tel = '022038000';
    obj.s_email = 'info@gpo.or.th';
    obj.s_contact = 'องค์การเภสัชกรรม';

    obj.r_name = rsHead[0].hospname;
    obj.r_address = rsHead[0].address;
    obj.r_subdistrict = rsHead[0].tambon_name;
    obj.r_district = rsHead[0].ampur_name;
    obj.r_province = rsHead[0].province_name;
    obj.r_lat = rsHead[0].lat === null ? '0' : rsHead[0].lat;
    obj.r_lon = rsHead[0].long === null ? '0' : rsHead[0].long;
    obj.r_zipcode = rsHead[0].zipcode;
    obj.r_tel = rsHead[0].telephone === null ? '-' : rsHead[0].telephone;
    obj.r_email = rsHead[0].email;
    obj.r_contact = rsHead[0].contact;

    obj.c_name = 'กระทรวงสาธารณสุข';
    obj.c_address = 'ถนนติวานนท์';
    obj.c_subdistrict = 'ตลาดขวัญ';
    obj.c_district = 'เมืองนนทบุรี';
    obj.c_province = 'นนทบุรี';
    obj.c_zipcode = '11000';
    obj.c_tel = '025902185';
    obj.c_email = 'ictmoph@gmail.com';
    obj.c_contact = 'กระทรวงสาธารณสุข';

    obj.pickup_date = moment(rsHead[0].created_at).format('YYYY-MM-DD');
    obj.service_code = 'ND';
    obj.cod_type = 'credit';
    obj.transport_company = 'DXPLACE';
    obj.company_code = '0';
    obj.group_ref_id = '-';

    let rsDetail: any = await payModel.payDetails(db, v);
    let detail = [];

    for (const j of rsDetail) {
      const objD: any = {};
      if (j.qty > 0) {
        objD.name = j.name;
        objD.qty = j.qty;
        objD.code = 'C1';
        objD.sku_id = 'C1';
        objD.unit = j.unit_name;
        objD.width = 0;
        objD.length = 0;
        objD.height = 0;
        objD.weight = 0;
        detail.push(objD);
      }
    }
    obj.product_detail = detail;

    if (obj.product_detail.length) {
      await sandData(obj).then(async (body: any) => {
        body = body.body;
        console.log(body);
        const objR: any = {};
        if (body) {
          if (body.success) {
            objR.ref_order_no = body.ref_order_no;
            objR.message = body.message;
          } else {
            objR.message = body.message;
          }
          await payModel.updatePay(db, objR, v);
        }
      }).catch((error) => {
        console.log(error);
      })
    }
  }
}

async function sandData(data) {
  return new Promise((resolve: any, reject: any) => {
    var options = {
      method: 'POST',
      url: process.env.URL_THPD_ORDER,
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