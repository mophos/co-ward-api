// / <reference path="../../typings.d.ts" />
import * as HttpStatus from 'http-status-codes';
import * as moment from "moment"
import * as _ from 'lodash';
import { Router, Request, Response } from 'express';
import { filter, chunk, map, groupBy } from 'lodash';
import { RestockModel } from '../../models/restock';
import { SuppliesModel } from '../../models/supplies';
import { SerialModel } from '../../models/serial';
import { PayModel } from '../../models/pay';
const xl = require('excel4node');
const uuidv4 = require('uuid/v4');
const path = require('path')
const request = require("request");

const serialModel = new SerialModel();
const restockModel = new RestockModel();
const payModel = new PayModel();
const suppliesModel = new SuppliesModel();
const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    let rs: any = await restockModel.getRestock(req.db);
    let rsTotal: any = await restockModel.getRestockTotal(req.db);
    res.send({ ok: true, rows: rs, total: rsTotal[0].count, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/approved', async (req: Request, res: Response) => {
  try {
    let rs: any = await restockModel.getRestockApproved(req.db);
    let rsTotal: any = await restockModel.getRestockTotalApproved(req.db);
    res.send({ ok: true, rows: rs, total: rsTotal[0].count, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/detail/:id', async (req: Request, res: Response) => {
  const id = req.params.id
  try {
    let rs: any = await restockModel.getRestockDetail(req.db, id);
    let rsTotal: any = await restockModel.getRestockDetailTotal(req.db, id);
    res.send({ ok: true, rows: rs, total: rsTotal[0].count, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/create', async (req: Request, res: Response) => {
  const decoded = req.decoded
  let rsHead: any
  try {
    let head = {
      code: await serialModel.getSerial(req.db, 'RS'),
      created_by: decoded.id
    }
    rsHead = await restockModel.insertRestock(req.db, head);
    let hocp_: any = await restockModel.getSuppliesRestockByHosp(req.db);
    let _hosp = chunk(hocp_, 15)
    let hospData = []
    let dataSet = []
    for (const hocp of _hosp) {
      let data: any = await restockModel.getSuppliesRestockByBalance(req.db, map(hocp, 'hospcode'));
      for (const _hocp of hocp) {
        let detailId = uuidv4();
        hospData.push({
          id: detailId,
          restock_id: rsHead,
          hospcode: _hocp.hospcode,
        })
        let tmp = filter(data, { 'hospcode': _hocp.hospcode })
        for (const _data of tmp) {
          dataSet.push({
            restock_detail_id: detailId,
            supplies_id: _data.supplies_id,
            qty: +_data.max - +_data.qty
          })
        }
      }
    }
    await restockModel.insertRestockDetail(req.db, hospData);
    await restockModel.insertRestockDetailItem(req.db, dataSet);
    res.send({ ok: true, code: HttpStatus.OK });

  } catch (error) {
    console.log(error.message);
    await restockModel.deleteRestock(req.db, rsHead[0]);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/create/pay-now', async (req: Request, res: Response) => {
  const data = req.body.data;
  const decoded = req.decoded

  let rsHead: any;
  let hospData = [];
  let dataSet = [];
  try {
    let head = {
      code: await serialModel.getSerial(req.db, 'RS'),
      created_by: decoded.id
    }
    rsHead = await restockModel.insertRestock(req.db, head);
    for (const v of data) {
      let detailId = uuidv4();
      hospData.push({
        id: detailId,
        restock_id: rsHead,
        hospcode: v.hospcode,
      })
      for (const j of v.items) {
        dataSet.push({
          restock_detail_id: detailId,
          supplies_id: j.id,
          qty: j.qty
        })
      }
    }
    await restockModel.insertRestockDetail(req.db, hospData);
    await restockModel.insertRestockDetailItem(req.db, dataSet);

    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error.message);
    await restockModel.deleteRestock(req.db, rsHead[0]);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/import', async (req: Request, res: Response) => {
  const data: any = req.body.data

  try {
    await restockModel.removeTemp(req.db);
    let rm = map(groupBy(data, 'restock_detail_id'), (k, v) => {
      return v
    });

    await restockModel.insert(req.db, data);
    await restockModel.remove(req.db, rm);
    let rs = await restockModel.update(req.db);

    if (rs.length) {
      await restockModel.removeTemp(req.db);
    }

    res.send({ ok: true });
  } catch (error) {
    res.send({ ok: false, message: error })
  }
});

router.get('/list-hospital', async (req: Request, res: Response) => {
  let restockId = req.query.restockId
  let typesId = req.query.typesId
  try {
    let rs: any = await restockModel.getListHospital(req.db, restockId, typesId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/list-supplies', async (req: Request, res: Response) => {
  let restockDetailId = req.query.restockDetailId
  try {
    let rs: any = await restockModel.getListSupplies(req.db, restockDetailId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.put('/update-supplies/:id', async (req: Request, res: Response) => {
  const id: any = req.params.id
  const data: any = req.body.data

  try {
    await restockModel.deleteRestockDetailItem(req.db, id);
    await restockModel.insertRestockDetailItem(req.db, data);
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.put('/remove-restock/:id', async (req: Request, res: Response) => {
  const id: any = req.params.id

  try {
    await restockModel.removeRestock(req.db, id);
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/export/:id', async (req: Request, res: Response) => {
  try {
    console.log('export');

    const id = req.params.id
    const db = req.db;
    const wb = new xl.Workbook();
    var ws = wb.addWorksheet('Sheet 1');
    const lockCell = (worksheet, range) => {
      worksheet.addDataValidation({
        type: "textLength",
        error: "This cell is locked",
        operator: "equal",
        sqref: range,
        formulas: [""],
      });
    };

    const info: any = await restockModel.getRestockInfo(db, id);
    const detail: any = await restockModel.getRestockDetail(db, id);
    const supplies: any = await suppliesModel.getSuppliesActived(db);
    const supplieId = [];
    // ws.column(2).hide();
    // ws.column(2).freeze(2);
    // ws.column(1).setWidth(36);
    // ws.row(1).hide();
    // ws.row(2).freeze();
    ws.cell(2, 2).string('โรงพยาบาล')
    ws.cell(2, 1).string('id')
    ws.cell(1, 2).string('โรงพยาบาล')
    ws.cell(1, 1).string('id')
    let col = 3
    for (const s of supplies) {
      supplieId.push({ idx: col, id: s.id });

      ws.cell(1, col).string(s.code);
      ws.cell(2, col++).string(s.name);
      lockCell(ws, xl.getExcelCellRef(1, col))
      lockCell(ws, xl.getExcelCellRef(2, col))
    }
    let row = 3;
    let _detail = chunk(detail, 500)

    for (const _d of _detail) {
      let items = await restockModel.getRestockDetailItems(db, map(_d, 'restock_detail_id'))
      for (const d of _d) {

        ws.cell(row, 1).string(d.restock_detail_id.toString());
        ws.cell(row, 2).string(d.hospname.toString());
        lockCell(ws, xl.getExcelCellRef(row, 1))
        lockCell(ws, xl.getExcelCellRef(row, 2))
        let tmp = filter(items, { 'restock_detail_id': d.restock_detail_id })
        for (const i of tmp) {
          const idx = _.findIndex(supplieId, { 'id': i.supplies_id })
          if (idx > -1) {
            ws.cell(row, supplieId[idx].idx).string(i.qty.toString() || '0')
          }
        }
        row++;
      }
    }

    let filename = `restock_` + info[0].code + `_` + moment().format('x');
    let filenamePath = path.join(process.env.TMP_PATH, filename + '.xlsx');
    wb.write(filenamePath, function (err, stats) {
      if (err) {
        console.error(err);
        res.send({ ok: false, error: err })
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + filename);
        res.sendfile(filenamePath);
      }
    });
    // res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/check-approved', async (req: Request, res: Response) => {
  try {
    const restockId = req.query.restockId;
    const db = req.db;
    const balanceTHPD = await restockModel.getBalanceFromTHPD(db);
    const qtyRequest = await restockModel.getSumSuppliesFromRestockId(db, restockId);
    const enoguh = await checkBalanceFromTHPD(qtyRequest, balanceTHPD)
    if (enoguh) {
      // พอ
      res.send({ ok: true, code: HttpStatus.OK });
    } else {
      // ไม่พอ
      res.send({ ok: false, error: 'สินค้าไม่พอจ่าย' });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/suppiles', async (req: Request, res: Response) => {
  const db = req.db;

  try {
    const rs = await restockModel.getSuppliesHos(db);
    for (const v of rs) {
      v.qty = 0;
    }
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/approved-all', async (req: Request, res: Response) => {
  const db = req.db;
  const restockId = req.query.data;

  try {
    let balanceTHPD = await restockModel.getBalanceFromTHPD(db);
    let qtyRequest = await restockModel.getSumSuppliesFromRestockId(db, restockId);
    let enough = await checkBalanceFromTHPD(qtyRequest, balanceTHPD);
    if (enough) {
      // พอ
      let detail: any = await restockModel.getRestockDetails(db, restockId);
      let payId = await payModel.saveHead(db, detail);
      let start = payId[0];
      let end = detail.length + payId[0];
      await payModel.selectInsertDetail(db, start, end);
      let rs = await sendTHPD(db, start, end);
      res.send({ ok: true, rows: [rs, start, end], code: HttpStatus.OK });
    } else {
      // ไม่พอ ทำค้างจ่าย
      let data: any = [];
      for (const q of qtyRequest) {
        const idx = _.findIndex(balanceTHPD, { 'type_code': q.supplies_code });
        if (idx > -1) {
          if (q.qty > balanceTHPD[idx].qty) {
            const obj: any = {};
            obj.hospcode = q.hospcode;
            obj.id = q.supplies_id;
            obj.supplies_code = q.supplies_code;
            obj.qty = q.qty - balanceTHPD[idx].qty;
            data.push(obj);
          }
        }
      }
      res.send({ ok: true, rows: data, code: HttpStatus.OK });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

function checkBalanceFromTHPD(qtyRequest, qtyTHPD) {
  for (const q of qtyRequest) {
    const idx = _.findIndex(qtyTHPD, { 'type_code': q.supplies_code });

    if (idx > -1) {
      if (q.qty > qtyTHPD[idx].qty) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}

async function sendTHPD(db, start, end) {
  for (let v = start; v < end; v++) {
    let rsHead: any = await payModel.payHead(db, v);
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
        objD.code = j.code;
        objD.sku_id = j.code;
        objD.unit = j.unit;
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
        if (body.success) {
          objR.ref_order_no = body.ref_order_no;
          objR.message = body.message;
        } else {
          objR.message = body.message;
        }
        await payModel.updatePay(db, objR, v);
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
      url: 'http://gw.dxplace.com/api/dxgateways/placeorder',
      // url: 'http://gw.dxplace.com/api/gateways/placeorder',
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
