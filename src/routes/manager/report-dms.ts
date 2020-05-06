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
  const sector = req.query.sector;
  const date = req.query.date;
  try {
    const rs: any = await model.report1(db, date, sector);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error });
  }
});

router.get('/report2', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  const sector = req.query.sector;
  try {
    const rs: any = await model.report2(db, date, sector);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {

    res.send({ ok: false, error: error });
  }
});

router.get('/report3', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  const sector = req.query.sector;
  try {
    const rs: any = await model.report3(db, date, sector);
    console.log(rs);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error, code: HttpStatus.OK });
  }
});

router.get('/report4', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  const sector = req.query.sector;

  try {
    const rs: any = await model.report4(db, date, sector);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error });
  }
});

router.get('/report5', async (req: Request, res: Response) => {
  const db = req.db;
  const sector = req.query.sector;
  const date = req.query.date;
  try {
    const rs: any = await model.report5(db, date, sector);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {

    res.send({ ok: false, error: error });
  }
});

router.get('/report6', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  const sector = req.query.sector;
  try {
    const rs: any = await model.report6(db, date, sector);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, message: error, code: HttpStatus.OK });
  }
});

router.get('/report7', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  const sector = req.query.sector;
  try {
    const rs: any = await model.report7(db, date, sector);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {

    res.send({ ok: false, error: error });
  }
});

router.get('/report8', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  const sector = req.query.sector;
  try {
    const rs: any = await model.report8(db, date, sector);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {

    res.send({ ok: false, error: error });
  }
});

router.get('/report9', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  const sector = req.query.sector;
  try {
    const rs: any = await model.report9(db, date, sector);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error });
  }
});

router.get('/report10', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  const sector = req.query.sector;
  try {
    const rs: any = await model.report10(db, date, sector);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error });
  }
});

router.get('/report1/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  const sector = req.query.sector;
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
    const rs: any = await model.report1(db, date, sector);
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
    ws.cell(4, 3).string(toString(sumBy(rs, 'aiir_qty') + sumBy(rs, 'modified_aiir_qty') + sumBy(rs, 'isolate_qty') + sumBy(rs, 'cohort_qty') + sumBy(rs, 'hospitel_qty'))).style(right);
    ws.cell(4, 4).string(toString(sumBy(rs, 'aiir_qty'))).style(right);
    ws.cell(4, 5).string(toString(sumBy(rs, 'modified_aiir_qty'))).style(right);
    ws.cell(4, 6).string(toString(sumBy(rs, 'isolate_qty'))).style(right);
    ws.cell(4, 7).string(toString(sumBy(rs, 'cohort_qty'))).style(right);
    ws.cell(4, 8).string(toString(sumBy(rs, 'hospitel_qty'))).style(right);

    let row = 5;
    for (const items of rs) {
      console.log(items.hospital_qty);
      ws.cell(row, 1).string(toString(items['name']));
      ws.cell(row, 2).string(toString(items['hospital_qty'])).style(right);
      ws.cell(row, 3).string(toString(items.aiir_qty + items.modified_aiir_qty + items.isolate_qty + items.cohort_qty + items.hospitel_qty)).style(right);
      ws.cell(row, 4).string(toString(items['aiir_qty'])).style(right);
      ws.cell(row, 5).string(toString(items['modified_aiir_qty'])).style(right);
      ws.cell(row, 6).string(toString(items['isolate_qty'])).style(right);
      ws.cell(row, 7).string(toString(items['cohort_qty'])).style(right);
      ws.cell(row, 8).string(toString(items['hospitel_qty'])).style(right);
      row += 1;
    }

    ws.cell(row, 1).string('รวม');
    ws.cell(row, 2).string(toString(sumBy(rs, 'hospital_qty'))).style(right);
    ws.cell(row, 3).string(toString(sumBy(rs, 'aiir_qty') + sumBy(rs, 'modified_aiir_qty') + sumBy(rs, 'isolate_qty') + sumBy(rs, 'cohort_qty') + sumBy(rs, 'hospitel_qty'))).style(right);
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

    res.send({ ok: false, error: error });
  }
});

router.get('/report2/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  const sector = req.query.sector;
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
    const rs: any = await model.report2(db, date, sector);
    ws.cell(1, 1, 2, 1, true).string('โรงพยาบาล');
    ws.cell(1, 2, 1, 5, true).string('ผู้ป่วยยืนยัน (Confirm Case)').style(center);
    ws.cell(1, 6, 2, 6, true).string('ผู้ป่วยเข้าเกณฑ์สงสัย PUI');
    ws.cell(1, 7, 2, 7, true).string('หน่วยงาน');
    ws.cell(1, 8, 2, 8, true).string('ข้อมูลล่าสุด');

    ws.cell(2, 2).string('อาการรุนแรง\n(Severe Case)');
    ws.cell(2, 3).string('อาการรุนแรงปานกลาง\n(Moderate Case)');
    ws.cell(2, 4).string('อาการไม่รุนแรง\n(Mild Case)');
    ws.cell(2, 5).string('ผู้ป่วยผลบวกไม่มีอาการ\n(Asymptomatic)');

    ws.cell(3, 1).string('รวม');
    ws.cell(3, 2).string(toString(sumBy(rs, 'severe'))).style(right);;
    ws.cell(3, 3).string(toString(sumBy(rs, 'moderate'))).style(right);;
    ws.cell(3, 4).string(toString(sumBy(rs, 'mild'))).style(right);;
    ws.cell(3, 5).string(toString(sumBy(rs, 'asymptomatic'))).style(right);;
    ws.cell(3, 6).string(toString(sumBy(rs, 'ip_pui'))).style(right);;
    ws.cell(3, 7).string('');
    ws.cell(3, 8).string('');
    let row = 4;
    for (const items of rs) {
      console.log(items);
      if (items.updated_entry) {
        items.updated_entry = moment(items.updated_entry).format('DD/MM/YYYY')
      } else {
        items.updated_entry = '-';
      }
      ws.cell(row, 1).string(toString(items['hospname']));
      ws.cell(row, 2).string(toString(items['severe'])).style(right);;
      ws.cell(row, 3).string(toString(items['moderate'])).style(right);;
      ws.cell(row, 4).string(toString(items['mild'])).style(right);;
      ws.cell(row, 5).string(toString(items['asymptomatic'])).style(right);;
      ws.cell(row, 6).string(toString(items['ip_pui'])).style(right);;
      ws.cell(row, 7).string(toString(items['sub_ministry_name']));
      ws.cell(row++, 8).string(toString(items['updated_entry']));
    }
    ws.cell(row, 1).string('รวม');
    ws.cell(row, 2).string(toString(sumBy(rs, 'severe'))).style(right);;
    ws.cell(row, 3).string(toString(sumBy(rs, 'moderate'))).style(right);;
    ws.cell(row, 4).string(toString(sumBy(rs, 'mild'))).style(right);;
    ws.cell(row, 5).string(toString(sumBy(rs, 'asymptomatic'))).style(right);;
    ws.cell(row, 6).string(toString(sumBy(rs, 'ip_pui'))).style(right);;
    ws.cell(row, 7).string('');
    ws.cell(row, 8).string('');

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

    res.send({ ok: false, error: error });
  }
});

router.get('/report3/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  const sector = req.query.sector;
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
    const rs: any = await model.report3(db, date, sector);

    ws.cell(1, 1, 2, 1, true).string('โรงพยาบาล');
    ws.cell(1, 2, 1, 5, true).string('ผู้ป่วยยืนยัน (Confirm Case)').style(center);
    ws.cell(1, 6, 2, 6, true).string('ผู้ป่วยเข้าเกณฑ์สงสัย PUI');
    ws.cell(1, 7, 2, 7, true).string('หน่วยงาน');

    ws.cell(2, 2).string('อาการรุนแรง\n(Severe Case)');
    ws.cell(2, 3).string('อาการรุนแรงปานกลาง\n(Moderate Case)');
    ws.cell(2, 4).string('อาการไม่รุนแรง\n(Mild Case)');
    ws.cell(2, 5).string('ผู้ป่วยผลบวกไม่มีอาการ\n(Asymptomatic)');

    ws.cell(3, 1).string('รวม');
    ws.cell(3, 2).string(toString(sumBy(rs, 'severe'))).style(right);;
    ws.cell(3, 3).string(toString(sumBy(rs, 'moderate'))).style(right);;
    ws.cell(3, 4).string(toString(sumBy(rs, 'mild'))).style(right);;
    ws.cell(3, 5).string(toString(sumBy(rs, 'asymptomatic'))).style(right);;
    ws.cell(3, 6).string(toString(sumBy(rs, 'ip_pui'))).style(right);;
    ws.cell(3, 7).string('');
    let row = 4;
    for (const items of rs) {
      ws.cell(row, 1).string(toString(items['hospname']));
      ws.cell(row, 2).string(toString(items['severe'])).style(right);;
      ws.cell(row, 3).string(toString(items['moderate'])).style(right);;
      ws.cell(row, 4).string(toString(items['mild'])).style(right);;
      ws.cell(row, 5).string(toString(items['asymptomatic'])).style(right);;
      ws.cell(row, 6).string(toString(items['ip_pui'])).style(right);;
      ws.cell(row++, 7).string(toString(items['sub_ministry_name']));
    }
    ws.cell(row, 1).string('รวม');
    ws.cell(row, 2).string(toString(sumBy(rs, 'severe'))).style(right);;
    ws.cell(row, 3).string(toString(sumBy(rs, 'moderate'))).style(right);;
    ws.cell(row, 4).string(toString(sumBy(rs, 'mild'))).style(right);;
    ws.cell(row, 5).string(toString(sumBy(rs, 'asymptomatic'))).style(right);;
    ws.cell(row, 6).string(toString(sumBy(rs, 'ip_pui'))).style(right);;
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
    res.send({ ok: false, error: error });
  }
});

router.get('/report4/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  const sector = req.query.sector;
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
    const rs: any = await model.report4(db, date, sector);
    ws.cell(1, 1, 2, 1, true).string('โรงพยาบาล');
    ws.cell(1, 2, 1, 5, true).string('Positive ยอดสะสม').style(center);
    ws.cell(1, 6, 1, 9, true).string('PUI ยอดสะสม').style(center);
    ws.cell(1, 10, 2, 10, true).string('หน่วยงาน');

    ws.cell(2, 2).string('Admit');
    ws.cell(2, 3).string('Discharge รวมสะสม');
    ws.cell(2, 4).string('Discharge\nส่ง Hospitel');
    ws.cell(2, 5).string('Discharge ตายสะสม');
    ws.cell(2, 6).string('Admit');
    ws.cell(2, 7).string('Discharge รวมสะสม');
    ws.cell(2, 8).string('Discharge\nส่ง Hospitel');
    ws.cell(2, 9).string('Discharge ตายสะสม');

    ws.cell(3, 1).string('รวม');
    ws.cell(3, 2).string(toString(sumBy(rs, 'admit'))).style(right);
    ws.cell(3, 3).string(toString(sumBy(rs, 'discharge'))).style(right);
    ws.cell(3, 4).string(toString(sumBy(rs, 'discharge_hospitel'))).style(right);
    ws.cell(3, 5).string(toString(sumBy(rs, 'discharge_death'))).style(right);
    ws.cell(3, 6).string(toString(sumBy(rs, 'pui_admit'))).style(right);
    ws.cell(3, 7).string(toString(sumBy(rs, 'pui_discharge'))).style(right);
    ws.cell(3, 8).string(toString(sumBy(rs, 'pui_discharge_hospitel'))).style(right);
    ws.cell(3, 9).string(toString(sumBy(rs, 'pui_discharge_death'))).style(right);
    ws.cell(3, 10).string('');

    let row = 4
    for (const items of rs) {
      ws.cell(row, 1).string(toString(items['hospname']));
      ws.cell(row, 2).string(toString(items['admit'])).style(right);
      ws.cell(row, 3).string(toString(items['discharge'])).style(right);
      ws.cell(row, 4).string(toString(items['discharge_hospitel'])).style(right);
      ws.cell(row, 5).string(toString(items['discharge_death'])).style(right);
      ws.cell(row, 6).string(toString(items['pui_admit'])).style(right);
      ws.cell(row, 7).string(toString(items['pui_discharge'])).style(right);
      ws.cell(row, 8).string(toString(items['pui_discharge_hospitel'])).style(right);
      ws.cell(row, 9).string(toString(items['pui_discharge_death'])).style(right);
      ws.cell(row++, 10).string(toString(items['sub_ministry_name']));
    }

    ws.cell(row, 1).string('รวม');
    ws.cell(row, 2).string(toString(sumBy(rs, 'admit'))).style(right);
    ws.cell(row, 3).string(toString(sumBy(rs, 'discharge'))).style(right);
    ws.cell(row, 4).string(toString(sumBy(rs, 'discharge_hospitel'))).style(right);
    ws.cell(row, 5).string(toString(sumBy(rs, 'discharge_death'))).style(right);
    ws.cell(row, 6).string(toString(sumBy(rs, 'pui_admit'))).style(right);
    ws.cell(row, 7).string(toString(sumBy(rs, 'pui_discharge'))).style(right);
    ws.cell(row, 8).string(toString(sumBy(rs, 'pui_discharge_hospitel'))).style(right);
    ws.cell(row, 9).string(toString(sumBy(rs, 'pui_discharge_death'))).style(right);
    ws.cell(row, 10).string('');

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

    res.send({ ok: false, error: error });
  }
});

router.get('/report5/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  const sector = req.query.sector;
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
    const rs: any = await model.report5(db, date, sector);

    ws.cell(1, 1, 2, 1, true).string('โรงพยาบาล');
    ws.cell(1, 2, 1, 5, true).string('จำนวนเตียง (ไม่รวม Hospitel)').style(center);
    ws.cell(1, 6, 2, 6, true).string('หน่วยงาน');
    ws.cell(1, 7, 2, 7, true).string('ข้อมูลล่าสุด');

    ws.cell(2, 2).string('จำนวนเตียงทั้งหมด');
    ws.cell(2, 3).string('Admit รวม');
    ws.cell(2, 4).string('สำรองเตียงรอรับย้าย');
    ws.cell(2, 5).string('ว่าง');

    ws.cell(3, 1).string('รวม');
    ws.cell(3, 2).string(toString(sumBy(rs, 'aiir_qty' || 0) + sumBy(rs, 'modified_aiir_qty' || 0) + sumBy(rs, 'isolate_qty' || 0) + sumBy(rs, 'cohort_qty' || 0))).style(right);
    ws.cell(3, 3).string(toString(sumBy(rs, 'aiir_usage_qty' || 0) + sumBy(rs, 'modified_aiir_usage_qty' || 0) + sumBy(rs, 'isolate_usage_qty' || 0) + sumBy(rs, 'cohort_usage_qty' || 0))).style(right);
    ws.cell(3, 4).string(toString(sumBy(rs, 'aiir_spare_qty' || 0) + sumBy(rs, 'modified_aiir_spare_qty' || 0) + sumBy(rs, 'isolate_spare_qty' || 0) + sumBy(rs, 'cohort_spare_qty' || 0))).style(right);
    ws.cell(3, 5).string(toString((sumBy(rs, 'aiir_qty' || 0) + sumBy(rs, 'modified_aiir_qty' || 0) + sumBy(rs, 'isolate_qty' || 0) + sumBy(rs, 'cohort_qty' || 0)) - (sumBy(rs, 'aiir_usage_qty' || 0) + sumBy(rs, 'modified_aiir_usage_qty' || 0) + sumBy(rs, 'isolate_usage_qty' || 0) + sumBy(rs, 'cohort_usage_qty' || 0)) - (sumBy(rs, 'aiir_spare_qty' || 0) + sumBy(rs, 'modified_aiir_spare_qty' || 0) + sumBy(rs, 'isolate_spare_qty' || 0) + sumBy(rs, 'cohort_spare_qty' || 0)))).style(right);
    ws.cell(3, 6).string('');
    ws.cell(3, 7).string('');

    let row = 4;
    for (const items of rs) {
      if(items.updated_entry){
        items.updated_entry = moment(items.updated_entry).format('DD/MM/YYYY')
      }else{
        items.updated_entry = '-'
      }
      ws.cell(row, 1).string(toString(items['hospname'])).style(right);
      ws.cell(row, 2).string(toString(items.aiir_qty || 0 + items.modified_aiir_qty || 0 + items.isolate_qty || 0 + items.cohort_qty || 0)).style(right);
      ws.cell(row, 3).string(toString(items.aiir_usage_qty || 0 + items.modified_aiir_usage_qty || 0 + items.isolate_usage_qty || 0 + items.cohort_usage_qty || 0)).style(right);
      ws.cell(row, 4).string(toString(items.aiir_spare_qty || 0 + items.modified_aiir_spare_qty || 0 + items.isolate_spare_qty || 0 + items.cohort_spare_qty || 0)).style(right);
      ws.cell(row, 5).string(toString((items.aiir_qty || 0 + items.modified_aiir_qty || 0 + items.isolate_qty || 0 + items.cohort_qty || 0) - (items.aiir_usage_qty || 0 + items.modified_aiir_usage_qty || 0 + items.isolate_usage_qty || 0 + items.cohort_usage_qty || 0) - (items.aiir_spare_qty || 0 + items.modified_aiir_spare_qty || 0 + items.isolate_spare_qty || 0 + items.cohort_spare_qty || 0))).style(right);
      ws.cell(row, 6).string(toString(items['sub_ministry_name']));
      ws.cell(row++, 7).string(toString(items['updated_entry']));
    }

    ws.cell(row, 1).string('รวม');
    ws.cell(row, 2).string(toString(sumBy(rs, 'aiir_qty' || 0) + sumBy(rs, 'modified_aiir_qty' || 0) + sumBy(rs, 'isolate_qty' || 0) + sumBy(rs, 'cohort_qty' || 0))).style(right);
    ws.cell(row, 3).string(toString(sumBy(rs, 'aiir_usage_qty' || 0) + sumBy(rs, 'modified_aiir_usage_qty' || 0) + sumBy(rs, 'isolate_usage_qty' || 0) + sumBy(rs, 'cohort_usage_qty' || 0))).style(right);
    ws.cell(row, 4).string(toString(sumBy(rs, 'aiir_spare_qty' || 0) + sumBy(rs, 'modified_aiir_spare_qty' || 0) + sumBy(rs, 'isolate_spare_qty' || 0) + sumBy(rs, 'cohort_spare_qty' || 0))).style(right);
    ws.cell(row, 5).string(toString(sumBy(rs, 'aiir_qty' || 0) + sumBy(rs, 'modified_aiir_qty' || 0) + sumBy(rs, 'isolate_qty' || 0) + sumBy(rs, 'cohort_qty' || 0) + sumBy(rs, 'aiir_usage_qty' || 0) + sumBy(rs, 'modified_aiir_usage_qty' || 0) + sumBy(rs, 'isolate_usage_qty' || 0) + sumBy(rs, 'cohort_usage_qty' || 0) + sumBy(rs, 'aiir_spare_qty' || 0) + sumBy(rs, 'modified_aiir_spare_qty' || 0) + sumBy(rs, 'isolate_spare_qty' || 0) + sumBy(rs, 'cohort_spare_qty' || 0))).style(right);
    ws.cell(row, 6).string('');
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

    res.send({ ok: false, error: error });
  }
});

router.get('/report6/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  const sector = req.query.sector;
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
    const rs: any = await model.report6(db, date, sector);

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

    res.send({ ok: false, error: error });
  }
});

router.get('/report7/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  const sector = req.query.sector;
  var wb = new excel4node.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  try {
    const rs: any = await model.report3(db, date, sector);

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

    res.send({ ok: false, error: error });
  }
});

router.get('/report8/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  const sector = req.query.sector;
  var wb = new excel4node.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  try {
    const rs: any = await model.report3(db, date, sector);

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

    res.send({ ok: false, error: error });
  }
});

router.get('/report9/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  const sector = req.query.sector;
  var wb = new excel4node.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  try {
    const rs: any = await model.report3(db, date, sector);

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

    res.send({ ok: false, error: error });
  }
});

router.get('/report10/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  const sector = req.query.sector;
  var wb = new excel4node.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  try {
    const rs: any = await model.report3(db, date, sector);

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

    res.send({ ok: false, error: error });
  }
});


router.get('/report-homework', async (req: Request, res: Response) => {
  const db = req.db;
  const sector = req.query.sector;
  try {
    const rs: any = await model.homework(db, sector);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {

    res.send({ ok: false, error: error });
  }
});

router.get('/report-homework/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const sector = req.query.sector;
  var wb = new excel4node.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  try {
    const rs: any = await model.homework(db, sector);

    ws.cell(1, 1).string('โรงพยาบาล');
    ws.cell(1, 2).string('วันที่ลงทะเบียนล่าสุด');
    ws.cell(1, 3).string('สังกัด');
    ws.cell(1, 4).string('จังหวัด');

    let row = 2;
    for (const items of rs) {
      if (items.register_last_date) {
        items.register_last_date = moment(items.register_last_date).format('DD-MM-YYYY');
      } else {
        items.register_last_date = '-'
      }
      ws.cell(row, 1).string(toString(items['hospname']));
      ws.cell(row, 2).string(toString(items['register_last_date']));
      ws.cell(row, 3).string(toString(items['sub_ministry_name']));
      ws.cell(row, 4).string(toString(items['province_name']));
      row += 1;
    }
    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `report-homework` + moment().format('x');
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

    res.send({ ok: false, error: error });
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