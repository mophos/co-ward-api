// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import * as moment from "moment"
import * as _ from 'lodash';
import { Router, Request, Response } from 'express';
import { filter, chunk, map } from 'lodash';
import { RestockModel } from '../../models/restock';
import { SuppliesModel } from '../../models/supplies';
import { SuppliesMinMaxModel } from '../../models/supplies_min_max';
import { SerialModel } from '../../models/serial';
import { PayModel } from '../../models/pay';
const xl = require('excel4node');
const uuidv4 = require('uuid/v4');
const fse = require('fs-extra');
const path = require('path')

const serialModel = new SerialModel();
const restockModel = new RestockModel();
const payModel = new PayModel();
const suppliesMinMaxModel = new SuppliesMinMaxModel();
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
    ws.cell(2, 1).string('โรงพยาบาล')
    ws.cell(2, 2).string('id')
    ws.cell(1, 1).string('โรงพยาบาล')
    ws.cell(1, 2).string('id')
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
      let items = await restockModel.getRestockDetailItems(db, map(_d, 'id'))
      for (const d of _d) {
        ws.cell(row, 1).string(d.hospname.toString());
        ws.cell(row, 2).string(d.id.toString());
        lockCell(ws, xl.getExcelCellRef(row, 1))
        lockCell(ws, xl.getExcelCellRef(row, 2))
        let tmp = filter(items, { 'restock_detail_id': d.id })
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
    const balanceTHPD = await restockModel.getBalanceFromTHPD();
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

router.get('/approved', async (req: Request, res: Response) => {
  try {
    const restockId = req.query.restockId;
    const db = req.db;
    const balanceTHPD = await restockModel.getBalanceFromTHPD();
    const qtyRequest = await restockModel.getSumSuppliesFromRestockId(db, restockId);
    const enoguh = await checkBalanceFromTHPD(qtyRequest, balanceTHPD)
    if (enoguh) {
      // พอ
      const detail: any = await restockModel.getRestockDetail(db, restockId);
      // console.log(detail.length);
      // let detailCode = map(detail, (v) => { return { 'hospcode': v.hospcode } })
      // console.log(detailCode);
      
      // for (const d of detail) {
        console.log(detail[0]);
        
        const payId = await payModel.saveHead(db, detail);
      //   await payModel.selectInsertDetail(db, payId, d.id);
      //   console.log(payId, d.id);

      //   // const items: any = await restockModel.getRestockDetailItem(db, d.restock_detail_id);
      //   // for (const iterator of oitemsbject) {

      //   // }

      // }
    } else {
      // ไม่พอ ทำค้างจ่าย
    }


    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
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
export default router;
