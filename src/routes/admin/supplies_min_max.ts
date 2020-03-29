// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
const path = require('path')
import * as moment from "moment"
import { Router, Request, Response } from 'express';
import { filter } from 'lodash';
import { SuppliesMinMaxModel } from '../../models/supplies_min_max';
import { HospitalModel } from '../../models/hospital';
const excel4node = require('excel4node');

const hospitalModel = new HospitalModel();
const suppliesMinMaxModel = new SuppliesMinMaxModel();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  const hospcode = req.query.hospcode
  try {
    let rs: any = await suppliesMinMaxModel.getSuppliesMinMax(req.db, hospcode);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


router.get('/balance', async (req: Request, res: Response) => {
  const hospcode = req.query.hospcode
  try {
    let rs: any = await suppliesMinMaxModel.getSuppliesMinMaxByBalance(req.db, hospcode);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/hosp-balance', async (req: Request, res: Response) => {
  try {
    const hosptype_code = req.query.hosptype_code || undefined;
    const ministry_code = req.query.ministry_code || undefined;
    const sub_ministry_code = req.query.sub_ministry_code || undefined;
    let rs: any = await suppliesMinMaxModel.getSuppliesMinMaxByHosp(req.db, sub_ministry_code, ministry_code, hosptype_code);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/balance/total', async (req: Request, res: Response) => {
  const hospcode = req.query.hospcode
  try {
    let rs: any = await suppliesMinMaxModel.getSuppliesMinMaxByBalanceTotal(req.db, hospcode);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/hosp-balance/total', async (req: Request, res: Response) => {
  try {
    const hosptype_code = req.query.hosptype_code || undefined;
    const ministry_code = req.query.ministry_code || undefined;
    const sub_ministry_code = req.query.sub_ministry_code || undefined;
    let rs: any = await suppliesMinMaxModel.getSuppliesMinMaxByHospTotal(req.db, sub_ministry_code, ministry_code, hosptype_code);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


router.post('/', async (req: Request, res: Response) => {
  const hospcode: any = req.query.hospcode
  const data: any = req.body.data
  const decoded = req.decoded;

  try {
    if (typeof hospcode === 'string' && hospcode && data.length) {
      for (const _data of data) {
        _data.hospcode = hospcode
        _data.created_by = decoded.id;
      }
      await suppliesMinMaxModel.deleteSuppliesMinMax(req.db, hospcode);
      let rs: any = await suppliesMinMaxModel.insertSuppliesMinMax(req.db, data);
      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: 'ข้อมูลไม่ครบ', code: HttpStatus.OK });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


router.get('/export-balanc', async (req: Request, res: Response) => {
  try {
    let filename = this.peopleId + `balanc` + moment().format('x');
    let filenamePath = path.join(process.env.TMP_PATH, filename + '.xlsx');
    const wb = new excel4node.Workbook();
    const ws = wb.addWorksheet('Sheet 1');
    let rsType: any = await hospitalModel.getHospTypes(req.db);
    rsType = rsType[0]
    let rs: any = await suppliesMinMaxModel.getSuppliesMinMaxByBalance(req.db);
    let _data = []
    let col = 1
    
    rsType.forEach(element => {
      console.log(element);

      _data.push({ name: element.name, data: filter(rs, { sub_ministry_code: element.sub_ministry_code, ministry_code: element.ministry_code, hosptype_code: element.hosptype_code }) })
    });

    res.send({ ok: true, rows: _data, code: HttpStatus.OK });
    // ws.cell(1, 1).string('วัน/เดือน/ปี');
    // ws.cell(1, 2).string('เลขที่ใบเบิก');
    // ws.cell(1, 3).string('ราคา/หน่วย');
    // ws.cell(1, 4).string('หน่วยนับ');
    // ws.cell(1, 5).string('จำนวนจ่าย');
    // ws.cell(1, 6).string('รวม');
    // ws.cell(1, 7).string('จ่ายให้');
    // ws.cell(1, 8).string('กลุ่มยา 1');
    // ws.cell(1, 9).string('กลุ่มยา 2');
    // ws.cell(1, 14).string('กลุ่มยา 3');
    // ws.cell(1, 15).string('กลุ่มยา 4');

    // wb.write(filenamePath, function (err, stats) {
    //   if (err) {
    //     console.error(err);
    //     res.send({ ok: false, error: err })
    //   } else {
    //     res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    //     res.setHeader("Content-Disposition", "attachment; filename=" + filename);
    //     res.sendfile(filenamePath);
    //   }
    // });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});



export default router;