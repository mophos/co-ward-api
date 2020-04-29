// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
import { Router, Request, Response } from 'express';
import { sumBy, filter } from 'lodash';
import { ReportDmsModel } from '../../models/report-dms';
const excel4node = require('excel4node');
const path = require('path')
const fse = require('fs-extra');
import moment = require('moment');

const model = new ReportDmsModel();
const router: Router = Router();

router.get('/report1', async (req: Request, res: Response) => {
  const db = req.db;
  try {
    const rs: any = await model.report1(db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report2', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;

  try {
    const rs: any = await model.report2(db, date);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report3', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  try {
    const rs: any = await model.report3(db, date);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error, code: HttpStatus.OK });
  }
});

router.get('/report4', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;

  try {
    const rs: any = await model.report2(db, date);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report5', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;

  try {
    const rs: any = await model.report2(db, date);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report6', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;

  try {
    const hospital: any = await model.getHospitalByType(db);
    const hosp = [];
    const bed: any = await model.getBad(db)
    for (const h of hospital) {
      const obj = {
        hospital_id: h.id,
        hospcode: h.hospcode,
        hospname: h.hospname
      };
      const _bed = filter(bed, { hospital_id: h.id })
      for (const b of _bed) {
        obj[b.bed_name + '_qty'] = b.qty;
        obj[b.bed_name + '_covid_qty'] = b.covid_qty;
        obj[b.bed_name + '_usage_qty'] = b.usage_qty;
      }
      hosp.push(obj);
    }
    res.send({ ok: true, rows: hosp, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, message: error, code: HttpStatus.OK });
  }
});

router.get('/report7', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;

  try {
    const rs: any = await model.report2(db, date);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report8', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;

  try {
    const rs: any = await model.report2(db, date);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report9', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;

  try {
    const rs: any = await model.report2(db, date);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report10', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;

  try {
    const rs: any = await model.report2(db, date);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report1/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  var wb = new excel4node.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  var center = wb.createStyle({
    alignment: {
      wrapText: true,
      horizontal: 'center',
    },
  });
  var right = wb.createStyle({
    alignment: {
      wrapText: true,
      horizontal: 'right',
    },
  });
  try {
    const rs: any = await model.report1(db);
    ws.cell(1, 1, 3, 1, true).string('หน่วยงาน');
    ws.cell(1, 2, 3, 2, true).string('จำนวนโรงพยาบาล ');
    ws.cell(1, 3, 3, 3, true).string('เตียงทั้งหมด');
    ws.cell(1, 4, 1, 8, true).string('ประเภทเตียง').style(center);
    ws.cell(2, 4, 3, 4, true).string('(1) AIIR-ICU');
    ws.cell(2, 5, 2, 6, true).string('Isolate Room').style(center);
    ws.cell(3, 5).string('(2) Modified AIIR');
    ws.cell(3, 6).string('(3) Single room');
    ws.cell(2, 7, 3, 7, true).string('(4) Cohort ward (bed)');
    ws.cell(2, 8, 3, 8, true).string('(5) Hospitel (room)');

    ws.cell(4, 1).string('รวม');
    ws.cell(4, 2).string(toString(sumBy(rs, 'hospital_qty'))).style(right);
    ws.cell(4, 3).string(toString(sumBy(rs, 'bed_qty'))).style(right);
    ws.cell(4, 4).string(toString(sumBy(rs, 'aiir_qty'))).style(right);
    ws.cell(4, 5).string(toString(sumBy(rs, 'modified_aiir_qty'))).style(right);
    ws.cell(4, 6).string(toString(sumBy(rs, 'isolate_qty'))).style(right);
    ws.cell(4, 7).string(toString(sumBy(rs, 'cohort_qty'))).style(right);
    ws.cell(4, 8).string(toString(sumBy(rs, 'hospitel_qty'))).style(right);

    let row = 5;
    for (const items of rs) {
      console.log(items);
      ws.cell(row, 1).string(toString(items['name']));
      ws.cell(row, 2).string(toString(items['hospital_qty'])).style(right);
      ws.cell(row, 3).string(toString(items['bed_qty'])).style(right);
      ws.cell(row, 4).string(toString(items['aiir_qty'])).style(right);
      ws.cell(row, 5).string(toString(items['modified_aiir_qty'])).style(right);
      ws.cell(row, 6).string(toString(items['isolate_qty'])).style(right);
      ws.cell(row, 7).string(toString(items['cohort_qty'])).style(right);
      ws.cell(row, 8).string(toString(items['hospitel_qty'])).style(right);
      row += 1;
    }

    ws.cell(row, 1).string('รวม');
    ws.cell(row, 2).string(toString(sumBy(rs, 'hospital_qty'))).style(right);
    ws.cell(row, 3).string(toString(sumBy(rs, 'bed_qty'))).style(right);
    ws.cell(row, 4).string(toString(sumBy(rs, 'aiir_qty'))).style(right);
    ws.cell(row, 5).string(toString(sumBy(rs, 'modified_aiir_qty'))).style(right);
    ws.cell(row, 6).string(toString(sumBy(rs, 'isolate_qty'))).style(right);
    ws.cell(row, 7).string(toString(sumBy(rs, 'cohort_qty'))).style(right);
    ws.cell(row, 8).string(toString(sumBy(rs, 'hospitel_qty'))).style(right);

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `report1` + moment().format('x');
    let filenamePath = path.join(process.env.TMP_PATH, filename + '.xlsx');
    wb.write(filenamePath, function (err, stats) {
      if (err) {
        console.error(err);
        fse.removeSync(filenamePath);
        res.send({ ok: false, error: err })
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + filename);
        res.sendfile(filenamePath, (v) => {
          fse.removeSync(filenamePath);
        })
      }
    });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report2/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  var wb = new excel4node.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  try {
    const rs: any = await model.report2(db, date);
    ws.cell(1, 1, 2, 1, true).string('โรงพยาบาล');
    ws.cell(1, 2, 1, 5, true).string('ผู้ป่วยยืนยัน (Confirm Case)');
    ws.cell(1, 6, 2, 6, true).string('ผู้ป่วยเข้าเกณฑ์สงสัย PUI');
    ws.cell(1, 7, 2, 7, true).string('หน่วยงาน');

    ws.cell(2, 2).string('อาการรุนแรง\n(Severe Case)');
    ws.cell(2, 3).string('อาการรุนแรงปานกลาง\n(Moderate Case)');
    ws.cell(2, 4).string('อาการไม่รุนแรง\n(Mild Case)');
    ws.cell(2, 5).string('ผู้ป่วยผลบวกไม่มีอาการ\n(Asymptomatic)');

    ws.cell(3, 1).string('รวม');
    ws.cell(3, 2).string(toString(sumBy(rs, 'severe')));
    ws.cell(3, 3).string(toString(sumBy(rs, 'moderate')));
    ws.cell(3, 4).string(toString(sumBy(rs, 'mild')));
    ws.cell(3, 5).string(toString(sumBy(rs, 'asymptomatic')));
    ws.cell(3, 6).string(toString(sumBy(rs, 'ip_pui')));
    ws.cell(3, 7).string('');
    let row = 4;
    for (const items of rs) {
      console.log(items);
      ws.cell(row, 1).string(toString(items['hospname']));
      ws.cell(row, 2).string(toString(items['severe']));
      ws.cell(row, 3).string(toString(items['moderate']));
      ws.cell(row, 4).string(toString(items['mild']));
      ws.cell(row, 5).string(toString(items['asymptomatic']));
      ws.cell(row, 6).string(toString(items['ip_pui']));
      ws.cell(row++, 7).string(toString(items['hosp_sub_min_name']));
    }
    ws.cell(row, 1).string('รวม');
    ws.cell(row, 2).string(toString(sumBy(rs, 'severe')));
    ws.cell(row, 3).string(toString(sumBy(rs, 'moderate')));
    ws.cell(row, 4).string(toString(sumBy(rs, 'mild')));
    ws.cell(row, 5).string(toString(sumBy(rs, 'asymptomatic')));
    ws.cell(row, 6).string(toString(sumBy(rs, 'ip_pui')));
    ws.cell(row, 7).string('');

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `report2` + moment().format('x');
    let filenamePath = path.join(process.env.TMP_PATH, filename + '.xlsx');
    wb.write(filenamePath, function (err, stats) {
      if (err) {
        console.error(err);
        fse.removeSync(filenamePath);
        res.send({ ok: false, error: err })
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + filename);
        res.sendfile(filenamePath, (v) => {
          fse.removeSync(filenamePath);
        })
      }
    });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report3/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  var wb = new excel4node.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  try {
    const rs: any = await model.report3(db, date);
    ws.cell(1, 1, 2, 1, true).string('โรงพยาบาล');
    ws.cell(1, 2, 1, 5, true).string('ผู้ป่วยยืนยัน (Confirm Case)');
    ws.cell(1, 6, 2, 6, true).string('ผู้ป่วยเข้าเกณฑ์สงสัย PUI');
    ws.cell(1, 7, 2, 7, true).string('หน่วยงาน');

    ws.cell(2, 2).string('อาการรุนแรง\n(Severe Case)');
    ws.cell(2, 3).string('อาการรุนแรงปานกลาง\n(Moderate Case)');
    ws.cell(2, 4).string('อาการไม่รุนแรง\n(Mild Case)');
    ws.cell(2, 5).string('ผู้ป่วยผลบวกไม่มีอาการ\n(Asymptomatic)');

    ws.cell(3, 1).string('รวม');
    ws.cell(3, 2).string(toString(sumBy(rs, 'severe')));
    ws.cell(3, 3).string(toString(sumBy(rs, 'moderate')));
    ws.cell(3, 4).string(toString(sumBy(rs, 'mild')));
    ws.cell(3, 5).string(toString(sumBy(rs, 'asymptomatic')));
    ws.cell(3, 6).string(toString(sumBy(rs, 'ip_pui')));
    ws.cell(3, 7).string('');
    let row = 4;
    for (const items of rs) {
      console.log(items);
      ws.cell(row, 1).string(toString(items['hospname']));
      ws.cell(row, 2).string(toString(items['severe']));
      ws.cell(row, 3).string(toString(items['moderate']));
      ws.cell(row, 4).string(toString(items['mild']));
      ws.cell(row, 5).string(toString(items['asymptomatic']));
      ws.cell(row, 6).string(toString(items['ip_pui']));
      ws.cell(row++, 7).string(toString(items['hosp_sub_min_name']));
    }
    ws.cell(row, 1).string('รวม');
    ws.cell(row, 2).string(toString(sumBy(rs, 'severe')));
    ws.cell(row, 3).string(toString(sumBy(rs, 'moderate')));
    ws.cell(row, 4).string(toString(sumBy(rs, 'mild')));
    ws.cell(row, 5).string(toString(sumBy(rs, 'asymptomatic')));
    ws.cell(row, 6).string(toString(sumBy(rs, 'ip_pui')));
    ws.cell(row, 7).string('');

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `report3` + moment().format('x');
    let filenamePath = path.join(process.env.TMP_PATH, filename + '.xlsx');
    wb.write(filenamePath, function (err, stats) {
      if (err) {
        console.error(err);
        fse.removeSync(filenamePath);
        res.send({ ok: false, error: err })
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + filename);
        res.sendfile(filenamePath, (v) => {
          fse.removeSync(filenamePath);
        })
      }
    });
  } catch (error) {
    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report4/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  var wb = new excel4node.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  try {
    const rs: any = await model.report4(db, date);
    ws.cell(1, 1, 2, 1, true).string('โรงพยาบาล');
    ws.cell(1, 2, 1, 5, true).string('Positive ยอดสะสม');
    ws.cell(1, 6, 1, 9, true).string('PUI ยอดสะสม');
    ws.cell(1, 10, 2, 10, true).string('หน่วยงาน');

    ws.cell(2, 2).string('Admit');
    ws.cell(2, 3).string('Discharge รวมสะสม');
    ws.cell(2, 4).string('Discharge\nส่ง Hospitel');
    ws.cell(2, 5).string('Discharge ตายสะสม');
    ws.cell(2, 6).string('Admit');
    ws.cell(2, 7).string('Discharge รวมสะสม');
    ws.cell(2, 8).string('Discharge\nส่ง Hospitel');
    ws.cell(2, 9).string('Discharge ตายสะสม');

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `report3` + moment().format('x');
    let filenamePath = path.join(process.env.TMP_PATH, filename + '.xlsx');
    wb.write(filenamePath, function (err, stats) {
      if (err) {
        console.error(err);
        fse.removeSync(filenamePath);
        res.send({ ok: false, error: err })
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + filename);
        res.sendfile(filenamePath, (v) => {
          fse.removeSync(filenamePath);
        })
      }
    });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report5/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  var wb = new excel4node.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  try {
    const rs: any = await model.report3(db, date);

    ws.cell(1, 1).string('Head');

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `report3` + moment().format('x');
    let filenamePath = path.join(process.env.TMP_PATH, filename + '.xlsx');
    wb.write(filenamePath, function (err, stats) {
      if (err) {
        console.error(err);
        fse.removeSync(filenamePath);
        res.send({ ok: false, error: err })
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + filename);
        res.sendfile(filenamePath, (v) => {
          fse.removeSync(filenamePath);
        })
      }
    });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report6/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  var wb = new excel4node.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  try {
    const rs: any = await model.report3(db, date);

    ws.cell(1, 1).string('Head');

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `report3` + moment().format('x');
    let filenamePath = path.join(process.env.TMP_PATH, filename + '.xlsx');
    wb.write(filenamePath, function (err, stats) {
      if (err) {
        console.error(err);
        fse.removeSync(filenamePath);
        res.send({ ok: false, error: err })
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + filename);
        res.sendfile(filenamePath, (v) => {
          fse.removeSync(filenamePath);
        })
      }
    });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report7/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  var wb = new excel4node.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  try {
    const rs: any = await model.report3(db, date);

    ws.cell(1, 1).string('Head');

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `report3` + moment().format('x');
    let filenamePath = path.join(process.env.TMP_PATH, filename + '.xlsx');
    wb.write(filenamePath, function (err, stats) {
      if (err) {
        console.error(err);
        fse.removeSync(filenamePath);
        res.send({ ok: false, error: err })
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + filename);
        res.sendfile(filenamePath, (v) => {
          fse.removeSync(filenamePath);
        })
      }
    });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report8/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  var wb = new excel4node.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  try {
    const rs: any = await model.report3(db, date);

    ws.cell(1, 1).string('Head');

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `report3` + moment().format('x');
    let filenamePath = path.join(process.env.TMP_PATH, filename + '.xlsx');
    wb.write(filenamePath, function (err, stats) {
      if (err) {
        console.error(err);
        fse.removeSync(filenamePath);
        res.send({ ok: false, error: err })
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + filename);
        res.sendfile(filenamePath, (v) => {
          fse.removeSync(filenamePath);
        })
      }
    });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report9/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  var wb = new excel4node.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  try {
    const rs: any = await model.report3(db, date);

    ws.cell(1, 1).string('Head');

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `report3` + moment().format('x');
    let filenamePath = path.join(process.env.TMP_PATH, filename + '.xlsx');
    wb.write(filenamePath, function (err, stats) {
      if (err) {
        console.error(err);
        fse.removeSync(filenamePath);
        res.send({ ok: false, error: err })
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + filename);
        res.sendfile(filenamePath, (v) => {
          fse.removeSync(filenamePath);
        })
      }
    });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report10/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  var wb = new excel4node.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  try {
    const rs: any = await model.report3(db, date);

    ws.cell(1, 1).string('Head');

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `report3` + moment().format('x');
    let filenamePath = path.join(process.env.TMP_PATH, filename + '.xlsx');
    wb.write(filenamePath, function (err, stats) {
      if (err) {
        console.error(err);
        fse.removeSync(filenamePath);
        res.send({ ok: false, error: err })
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + filename);
        res.sendfile(filenamePath, (v) => {
          fse.removeSync(filenamePath);
        })
      }
    });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

function toString(value) {
  if (value || value == 0) {
    return value.toString();
  } else {
    return '';
  }
}

export default router;