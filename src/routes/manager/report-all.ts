// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
import { Router, Request, Response } from 'express';
import { sumBy, filter } from 'lodash';
import { ReportAllModel } from '../../models/report-all';
const excel4node = require('excel4node');
const path = require('path')
const fse = require('fs-extra');
import moment = require('moment');

const model = new ReportAllModel();
const router: Router = Router();

router.get('/report1', async (req: Request, res: Response) => {
  const db = req.dbReport;
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

router.get('/list/province', async (req: Request, res: Response) => {
  const db = req.dbReport;

  try {
    const rs: any = await model.getProvince(db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error });
  }
});

router.get('/report2', async (req: Request, res: Response) => {
  const db = req.dbReport;
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
  const db = req.dbReport;
  const date = req.query.date;
  const sector = req.query.sector;
  try {
    const rs: any = await model.report3(db, date, sector);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error, code: HttpStatus.OK });
  }
});

router.get('/report4', async (req: Request, res: Response) => {
  const db = req.dbReport;
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
  const db = req.dbReport;
  const sector = req.query.sector;
  const date = req.query.date;
  try {
    const rs: any = await model.report5(db, date, sector);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error });
  }
});

router.get('/report6', async (req: Request, res: Response) => {
  const db = req.dbReport;
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

router.get('/report6-ministry', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const date = req.query.date;
  const sector = req.query.sector;
  try {
    const rs: any = await model.report6Ministry(db, date, sector);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, message: error, code: HttpStatus.OK });
  }
});

router.get('/report6-sector', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const date = req.query.date;
  const sector = req.query.sector;
  try {
    const rs: any = await model.report6Sector(db, date, sector);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, message: error, code: HttpStatus.OK });
  }
});

router.get('/report7', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const date = req.query.date;
  const sector = req.query.sector;
  try {
    const rs: any = await model.report7(db, date, sector);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error });
  }
});

router.get('/report7-ministry', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const date = req.query.date;
  const sector = req.query.sector;
  try {
    const rs: any = await model.report7Ministry(db, date, sector);
    res.send({ ok: true, rows: rs[0], code: HttpStatus.OK });
  } catch (error) {
    console.log(error)
    res.send({ ok: false, error: error });
  }
});

router.get('/report7-sector', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const date = req.query.date;
  const sector = req.query.sector;
  try {
    const rs: any = await model.report7Sector(db, date, sector);
    res.send({ ok: true, rows: rs[0], code: HttpStatus.OK });
  } catch (error) {
    console.log(error)
    res.send({ ok: false, error: error });
  }
});

router.get('/report8', async (req: Request, res: Response) => {
  const db = req.dbReport;
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
  const db = req.dbReport;
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
  const db = req.dbReport;
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
  const db = req.dbReport;
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
    ws.cell(2, 4, 3, 4, true).string('(1) AIIR');
    ws.cell(2, 5, 2, 6, true).string('Isolate Room').style(center);
    ws.cell(3, 5).string('(2) Modified AIIR');
    ws.cell(3, 6).string('(3) Single room');
    ws.cell(2, 7, 3, 7, true).string('(4) Cohort ward (bed)');
    ws.cell(2, 8, 3, 8, true).string('(5) Hospitel (room)');
    ws.cell(2, 9, 3, 9, true).string('(6) Cohort ICU (bed)');

    ws.cell(4, 1).string('รวม');
    ws.cell(4, 2).number(toNumber(sumBy(rs, 'hospital_qty'))).style(right);
    ws.cell(4, 3).number(toNumber(sumBy(rs, 'aiir_qty') + sumBy(rs, 'modified_aiir_qty') + sumBy(rs, 'isolate_qty') + sumBy(rs, 'cohort_qty') + sumBy(rs, 'hospitel_qty') + sumBy(rs, 'cohort_icu_qty'))).style(right);
    ws.cell(4, 4).number(toNumber(sumBy(rs, 'aiir_qty'))).style(right);
    ws.cell(4, 5).number(toNumber(sumBy(rs, 'modified_aiir_qty'))).style(right);
    ws.cell(4, 6).number(toNumber(sumBy(rs, 'isolate_qty'))).style(right);
    ws.cell(4, 7).number(toNumber(sumBy(rs, 'cohort_qty'))).style(right);
    ws.cell(4, 8).number(toNumber(sumBy(rs, 'hospitel_qty'))).style(right);
    ws.cell(4, 9).number(toNumber(sumBy(rs, 'cohort_icu_qty'))).style(right);

    let row = 5;
    for (const items of rs) {
      ws.cell(row, 1).string(toString(items['sub_ministry_name']));
      ws.cell(row, 2).number(toNumber(items['hospital_qty'])).style(right);
      ws.cell(row, 3).number(toNumber(items.aiir_qty + items.modified_aiir_qty + items.isolate_qty + items.cohort_qty + items.hospitel_qty + items.cohort_icu_qty)).style(right);
      ws.cell(row, 4).number(toNumber(items['aiir_qty'])).style(right);
      ws.cell(row, 5).number(toNumber(items['modified_aiir_qty'])).style(right);
      ws.cell(row, 6).number(toNumber(items['isolate_qty'])).style(right);
      ws.cell(row, 7).number(toNumber(items['cohort_qty'])).style(right);
      ws.cell(row, 8).number(toNumber(items['hospitel_qty'])).style(right);
      ws.cell(row, 8).number(toNumber(items['hospitel_qty'])).style(right);
      ws.cell(row, 9).number(toNumber(items['cohort_icu_qty'])).style(right);
      row += 1;
    }

    ws.cell(row, 1).string('รวม');
    ws.cell(row, 2).number(toNumber(sumBy(rs, 'hospital_qty'))).style(right);
    ws.cell(row, 3).number(toNumber(sumBy(rs, 'aiir_qty') + sumBy(rs, 'modified_aiir_qty') + sumBy(rs, 'isolate_qty') + sumBy(rs, 'cohort_qty') + sumBy(rs, 'hospitel_qty') + sumBy(rs, 'cohort_icu_qty'))).style(right);
    ws.cell(row, 4).number(toNumber(sumBy(rs, 'aiir_qty'))).style(right);
    ws.cell(row, 5).number(toNumber(sumBy(rs, 'modified_aiir_qty'))).style(right);
    ws.cell(row, 6).number(toNumber(sumBy(rs, 'isolate_qty'))).style(right);
    ws.cell(row, 7).number(toNumber(sumBy(rs, 'cohort_qty'))).style(right);
    ws.cell(row, 8).number(toNumber(sumBy(rs, 'hospitel_qty'))).style(right);
    ws.cell(row, 9).number(toNumber(sumBy(rs, 'cohort_icu_qty'))).style(right);

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
  const db = req.dbReport;
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
    ws.cell(1, 7, 2, 7, true).string('Hospitel Quarantine');
    ws.cell(1, 8, 2, 8, true).string('หน่วยงาน');
    ws.cell(1, 9, 2, 9, true).string('ข้อมูลล่าสุด');

    ws.cell(2, 2).string('อาการรุนแรง\n(Severe Case)');
    ws.cell(2, 3).string('อาการรุนแรงปานกลาง\n(Moderate Case)');
    ws.cell(2, 4).string('อาการไม่รุนแรง\n(Mild Case)');
    ws.cell(2, 5).string('ผู้ป่วยผลบวกไม่มีอาการ\n(Asymptomatic)');

    ws.cell(3, 1).string('รวม');
    ws.cell(3, 2).number(toNumber(sumBy(rs, 'severe'))).style(right);;
    ws.cell(3, 3).number(toNumber(sumBy(rs, 'moderate'))).style(right);;
    ws.cell(3, 4).number(toNumber(sumBy(rs, 'mild'))).style(right);;
    ws.cell(3, 5).number(toNumber(sumBy(rs, 'asymptomatic'))).style(right);;
    ws.cell(3, 6).number(toNumber(sumBy(rs, 'ip_pui'))).style(right);;
    ws.cell(3, 7).number(toNumber(sumBy(rs, 'observe'))).style(right);;
    ws.cell(3, 8).string('');
    ws.cell(3, 9).string('');
    let row = 4;
    for (const items of rs) {
      console.log(items);
      if (items.updated_entry) {
        items.updated_entry = moment(items.updated_entry).format('DD/MM/YYYY')
      } else {
        items.updated_entry = '-';
      }
      ws.cell(row, 1).string(toString(items['hospname']));
      ws.cell(row, 2).number(toNumber(items['severe'])).style(right);;
      ws.cell(row, 3).number(toNumber(items['moderate'])).style(right);;
      ws.cell(row, 4).number(toNumber(items['mild'])).style(right);;
      ws.cell(row, 5).number(toNumber(items['asymptomatic'])).style(right);;
      ws.cell(row, 6).number(toNumber(items['ip_pui'])).style(right);;
      ws.cell(row, 7).number(toNumber(items['observe'])).style(right);;
      ws.cell(row, 8).string(toString(items['sub_ministry_name']));
      ws.cell(row++, 9).string(toString(items['updated_entry']));
    }
    ws.cell(row, 1).string('รวม');
    ws.cell(row, 2).number(toNumber(sumBy(rs, 'severe'))).style(right);;
    ws.cell(row, 3).number(toNumber(sumBy(rs, 'moderate'))).style(right);;
    ws.cell(row, 4).number(toNumber(sumBy(rs, 'mild'))).style(right);;
    ws.cell(row, 5).number(toNumber(sumBy(rs, 'asymptomatic'))).style(right);;
    ws.cell(row, 6).number(toNumber(sumBy(rs, 'ip_pui'))).style(right);;
    ws.cell(row, 7).number(toNumber(sumBy(rs, 'observe'))).style(right);;
    ws.cell(row, 8).string('');
    ws.cell(row, 9).string('');

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
  const db = req.dbReport;
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
    ws.cell(3, 2).number(toNumber(sumBy(rs, 'severe'))).style(right);;
    ws.cell(3, 3).number(toNumber(sumBy(rs, 'moderate'))).style(right);;
    ws.cell(3, 4).number(toNumber(sumBy(rs, 'mild'))).style(right);;
    ws.cell(3, 5).number(toNumber(sumBy(rs, 'asymptomatic'))).style(right);;
    ws.cell(3, 6).number(toNumber(sumBy(rs, 'ip_pui'))).style(right);;
    ws.cell(3, 7).string('');
    let row = 4;
    for (const items of rs) {
      ws.cell(row, 1).string(toString(items['hospname']));
      ws.cell(row, 2).number(toNumber(items['severe'])).style(right);;
      ws.cell(row, 3).number(toNumber(items['moderate'])).style(right);;
      ws.cell(row, 4).number(toNumber(items['mild'])).style(right);;
      ws.cell(row, 5).number(toNumber(items['asymptomatic'])).style(right);;
      ws.cell(row, 6).number(toNumber(items['ip_pui'])).style(right);;
      ws.cell(row++, 7).string(toString(items['sub_ministry_name']));
    }
    ws.cell(row, 1).string('รวม');
    ws.cell(row, 2).number(toNumber(sumBy(rs, 'severe'))).style(right);;
    ws.cell(row, 3).number(toNumber(sumBy(rs, 'moderate'))).style(right);;
    ws.cell(row, 4).number(toNumber(sumBy(rs, 'mild'))).style(right);;
    ws.cell(row, 5).number(toNumber(sumBy(rs, 'asymptomatic'))).style(right);;
    ws.cell(row, 6).number(toNumber(sumBy(rs, 'ip_pui'))).style(right);;
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
  const db = req.dbReport;
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
    let rs: any = await model.report4(db, date, sector);
    ws.cell(1, 1, 2, 1, true).string('โรงพยาบาล');
    ws.cell(1, 2, 1, 5, true).string('Positive ยอดสะสม').style(center);
    ws.cell(1, 6, 1, 9, true).string('PUI ยอดสะสม').style(center);
    ws.cell(1, 10, 1, 10, true).string('PUI ยอดสะสม').style(center);
    ws.cell(1, 11, 2, 11, true).string('หน่วยงาน');

    ws.cell(2, 2).string('Admit');
    ws.cell(2, 3).string('Discharge รวมสะสม');
    ws.cell(2, 4).string('Discharge\nส่ง Hospitel');
    ws.cell(2, 5).string('Discharge ตายสะสม');
    ws.cell(2, 6).string('Admit');
    ws.cell(2, 7).string('Discharge รวมสะสม');
    ws.cell(2, 8).string('Discharge\nส่ง Hospitel');
    ws.cell(2, 9).string('Discharge ตายสะสม');

    ws.cell(3, 1).string('รวม');
    ws.cell(3, 2).number(toNumber(sumBy(rs, 'admit'))).style(right);
    ws.cell(3, 3).number(toNumber(sumBy(rs, 'discharge'))).style(right);
    ws.cell(3, 4).number(toNumber(sumBy(rs, 'discharge_hospitel'))).style(right);
    ws.cell(3, 5).number(toNumber(sumBy(rs, 'discharge_death'))).style(right);
    ws.cell(3, 6).number(toNumber(sumBy(rs, 'pui_admit'))).style(right);
    ws.cell(3, 7).number(toNumber(sumBy(rs, 'pui_discharge'))).style(right);
    ws.cell(3, 8).number(toNumber(sumBy(rs, 'pui_discharge_hospitel'))).style(right);
    ws.cell(3, 9).number(toNumber(sumBy(rs, 'pui_discharge_death'))).style(right);
    ws.cell(3, 10).number(toNumber(sumBy(rs, 'observe'))).style(right);
    ws.cell(3, 11).string('');

    let row = 4
    for (const items of rs) {
      ws.cell(row, 1).string(toString(items['hospname']));
      ws.cell(row, 2).number(toNumber(items['admit'])).style(right);
      ws.cell(row, 3).number(toNumber(items['discharge'])).style(right);
      ws.cell(row, 4).number(toNumber(items['discharge_hospitel'])).style(right);
      ws.cell(row, 5).number(toNumber(items['discharge_death'])).style(right);
      ws.cell(row, 6).number(toNumber(items['pui_admit'])).style(right);
      ws.cell(row, 7).number(toNumber(items['pui_discharge'])).style(right);
      ws.cell(row, 8).number(toNumber(items['pui_discharge_hospitel'])).style(right);
      ws.cell(row, 9).number(toNumber(items['pui_discharge_death'])).style(right);
      ws.cell(row, 10).number(toNumber(items['observe'])).style(right);
      ws.cell(row++, 11).string(toString(items['sub_ministry_name']));
    }

    ws.cell(row, 1).string('รวม');
    ws.cell(row, 2).number(toNumber(sumBy(rs, 'admit'))).style(right);
    ws.cell(row, 3).number(toNumber(sumBy(rs, 'discharge'))).style(right);
    ws.cell(row, 4).number(toNumber(sumBy(rs, 'discharge_hospitel'))).style(right);
    ws.cell(row, 5).number(toNumber(sumBy(rs, 'discharge_death'))).style(right);
    ws.cell(row, 6).number(toNumber(sumBy(rs, 'pui_admit'))).style(right);
    ws.cell(row, 7).number(toNumber(sumBy(rs, 'pui_discharge'))).style(right);
    ws.cell(row, 8).number(toNumber(sumBy(rs, 'pui_discharge_hospitel'))).style(right);
    ws.cell(row, 9).number(toNumber(sumBy(rs, 'pui_discharge_death'))).style(right);
    ws.cell(row, 10).number(toNumber(sumBy(rs, 'observe'))).style(right);
    ws.cell(row, 11).string('');

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
    console.log(error);
    res.send({ ok: false, error: error });
  }
});

router.get('/report5/excel', async (req: Request, res: Response) => {
  const db = req.dbReport;
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
    ws.cell(3, 2).number(toNumber(sumBy(rs, 'aiir_qty') || 0 + sumBy(rs, 'modified_aiir_qty') || 0 + sumBy(rs, 'isolate_qty') || 0 + sumBy(rs, 'cohort_qty') || 0)).style(right);
    ws.cell(3, 3).number(toNumber(sumBy(rs, 'aiir_usage_qty') || 0 + sumBy(rs, 'modified_aiir_usage_qty') || 0 + sumBy(rs, 'isolate_usage_qty') || 0 + sumBy(rs, 'cohort_usage_qty') || 0)).style(right);
    ws.cell(3, 4).number(toNumber(sumBy(rs, 'aiir_spare_qty') || 0 + sumBy(rs, 'modified_aiir_spare_qty') || 0 + sumBy(rs, 'isolate_spare_qty') || 0 + sumBy(rs, 'cohort_spare_qty') || 0)).style(right);
    ws.cell(3, 5).number(toNumber((sumBy(rs, 'aiir_qty') || 0 + sumBy(rs, 'modified_aiir_qty') || 0 + sumBy(rs, 'isolate_qty') || 0 + sumBy(rs, 'cohort_qty') || 0) - (sumBy(rs, 'aiir_usage_qty') || 0 + sumBy(rs, 'modified_aiir_usage_qty') || 0 + sumBy(rs, 'isolate_usage_qty') || 0 + sumBy(rs, 'cohort_usage_qty') || 0) - (sumBy(rs, 'aiir_spare_qty') || 0 + sumBy(rs, 'modified_aiir_spare_qty') || 0 + sumBy(rs, 'isolate_spare_qty') || 0 + sumBy(rs, 'cohort_spare_qty') || 0))).style(right);
    ws.cell(3, 6).string('');
    ws.cell(3, 7).string('');

    let row = 4;
    for (const items of rs) {
      if (items.updated_entry) {
        items.updated_entry = moment(items.updated_entry).format('DD/MM/YYYY')
      } else {
        items.updated_entry = '-'
      }
      ws.cell(row, 1).string(toString(items['hospname']));
      ws.cell(row, 2).number(toNumber(items.aiir_qty || 0 + items.modified_aiir_qty || 0 + items.isolate_qty || 0 + items.cohort_qty || 0)).style(right);
      ws.cell(row, 3).number(toNumber(items.aiir_usage_qty || 0 + items.modified_aiir_usage_qty || 0 + items.isolate_usage_qty || 0 + items.cohort_usage_qty || 0)).style(right);
      ws.cell(row, 4).number(toNumber(items.aiir_spare_qty || 0 + items.modified_aiir_spare_qty || 0 + items.isolate_spare_qty || 0 + items.cohort_spare_qty || 0)).style(right);
      ws.cell(row, 5).number(toNumber((items.aiir_qty || 0 + items.modified_aiir_qty || 0 + items.isolate_qty || 0 + items.cohort_qty || 0) - (items.aiir_usage_qty || 0 + items.modified_aiir_usage_qty || 0 + items.isolate_usage_qty || 0 + items.cohort_usage_qty || 0) - (items.aiir_spare_qty || 0 + items.modified_aiir_spare_qty || 0 + items.isolate_spare_qty || 0 + items.cohort_spare_qty) || 0)).style(right);
      ws.cell(row, 6).string(toString(items['sub_ministry_name']));
      ws.cell(row++, 7).string(toString(items['updated_entry']));
    }

    ws.cell(row, 1).string('รวม');
    ws.cell(row, 2).number(toNumber(sumBy(rs, 'aiir_qty') || 0 + sumBy(rs, 'modified_aiir_qty') || 0 + sumBy(rs, 'isolate_qty') || 0 + sumBy(rs, 'cohort_qty') || 0)).style(right);
    ws.cell(row, 3).number(toNumber(sumBy(rs, 'aiir_usage_qty') || 0 + sumBy(rs, 'modified_aiir_usage_qty') || 0 + sumBy(rs, 'isolate_usage_qty') || 0 + sumBy(rs, 'cohort_usage_qty') || 0)).style(right);
    ws.cell(row, 4).number(toNumber(sumBy(rs, 'aiir_spare_qty') || 0 + sumBy(rs, 'modified_aiir_spare_qty') || 0 + sumBy(rs, 'isolate_spare_qty') || 0 + sumBy(rs, 'cohort_spare_qty') || 0)).style(right);
    ws.cell(row, 5).number(toNumber(sumBy(rs, 'aiir_qty') || 0 + sumBy(rs, 'modified_aiir_qty') || 0 + sumBy(rs, 'isolate_qty') || 0 + sumBy(rs, 'cohort_qty') || 0 + sumBy(rs, 'aiir_usage_qty') || 0 + sumBy(rs, 'modified_aiir_usage_qty') || 0 + sumBy(rs, 'isolate_usage_qty') || 0 + sumBy(rs, 'cohort_usage_qty') || 0 + sumBy(rs, 'aiir_spare_qty') || 0 + sumBy(rs, 'modified_aiir_spare_qty') || 0 + sumBy(rs, 'isolate_spare_qty') || 0 + sumBy(rs, 'cohort_spare_qty') || 0)).style(right);
    ws.cell(row, 6).string('');
    ws.cell(row, 7).string('');

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `report5` + moment().format('x');
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
  const db = req.dbReport;
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

    ws.cell(1, 1, 2, 1, true).string('โรงพยาบาล');
    ws.cell(1, 2, 1, 4, true).string('AIIR').style(center);
    ws.cell(1, 5, 1, 7, true).string('Modified AIIR').style(center);
    ws.cell(1, 8, 1, 10, true).string('Isolate').style(center);
    ws.cell(1, 11, 1, 13, true).string('Cohort').style(center);
    ws.cell(1, 14, 1, 16, true).string('Hospitel').style(center);
    ws.cell(1, 17, 1, 19, true).string('Cohort ICU').style(center);
    ws.cell(1, 20, 2, 20, true).string('หน่วยงาน');
    ws.cell(1, 21, 2, 21, true).string('ระดับขีดความสามารถ');
    ws.cell(1, 22, 2, 22, true).string('Hospital Type');
    ws.cell(1, 23, 2, 23, true).string('ข้อมูลล่าสุด');

    ws.cell(2, 2).string('ทั้งหมด');
    ws.cell(2, 3).string('ใช้ไปแล้ว');
    ws.cell(2, 4).string('คงเหลือ');

    ws.cell(2, 5).string('ทั้งหมด');
    ws.cell(2, 6).string('ใช้ไปแล้ว');
    ws.cell(2, 7).string('คงเหลือ');

    ws.cell(2, 8).string('ทั้งหมด');
    ws.cell(2, 9).string('ใช้ไปแล้ว');
    ws.cell(2, 10).string('คงเหลือ');

    ws.cell(2, 11).string('ทั้งหมด');
    ws.cell(2, 12).string('ใช้ไปแล้ว');
    ws.cell(2, 13).string('คงเหลือ');

    ws.cell(2, 14).string('ทั้งหมด');
    ws.cell(2, 15).string('ใช้ไปแล้ว');
    ws.cell(2, 16).string('คงเหลือ');

    ws.cell(2, 17).string('ทั้งหมด');
    ws.cell(2, 18).string('ใช้ไปแล้ว');
    ws.cell(2, 19).string('คงเหลือ');

    ws.cell(3, 1).string('รวม');
    ws.cell(3, 2).number(toNumber(sumBy(rs, 'aiir_covid_qty'))).style(right);
    ws.cell(3, 3).number(toNumber(sumBy(rs, 'aiir_usage_qty'))).style(right);
    ws.cell(3, 4).number(toNumber((sumBy(rs, 'aiir_covid_qty') - sumBy(rs, 'aiir_usage_qty')) || 0)).style(right);
    ws.cell(3, 5).number(toNumber(sumBy(rs, 'modified_aiir_covid_qty'))).style(right);
    ws.cell(3, 6).number(toNumber(sumBy(rs, 'modified_aiir_usage_qty'))).style(right);
    ws.cell(3, 7).number(toNumber((sumBy(rs, 'modified_aiir_covid_qty') - sumBy(rs, 'modified_aiir_usage_qty')) || 0)).style(right);
    ws.cell(3, 8).number(toNumber(sumBy(rs, 'isolate_covid_qty'))).style(right);
    ws.cell(3, 9).number(toNumber(sumBy(rs, 'isolate_usage_qty'))).style(right);
    ws.cell(3, 10).number(toNumber((sumBy(rs, 'isolate_covid_qty') - sumBy(rs, 'isolate_usage_qty')) || 0)).style(right);
    ws.cell(3, 11).number(toNumber(sumBy(rs, 'cohort_covid_qty'))).style(right);
    ws.cell(3, 12).number(toNumber(sumBy(rs, 'cohort_usage_qty'))).style(right);
    ws.cell(3, 13).number(toNumber((sumBy(rs, 'cohort_covid_qty') - sumBy(rs, 'cohort_usage_qty')) || 0)).style(right);
    ws.cell(3, 14).number(toNumber(sumBy(rs, 'hospitel_covid_qty'))).style(right);
    ws.cell(3, 15).number(toNumber(sumBy(rs, 'hospitel_usage_qty'))).style(right);
    ws.cell(3, 16).number(toNumber((sumBy(rs, 'hospitel_covid_qty') - sumBy(rs, 'hospitel_usage_qty')) || 0)).style(right);
    ws.cell(3, 17).number(toNumber(sumBy(rs, 'cohort_icu_covid_qty'))).style(right);
    ws.cell(3, 18).number(toNumber(sumBy(rs, 'cohort_icu_usage_qty'))).style(right);
    ws.cell(3, 19).number(toNumber((sumBy(rs, 'cohort_icu_covid_qty') - sumBy(rs, 'cohort_icu_usage_qty')) || 0)).style(right);

    let row = 4;
    for (const items of rs) {
      if (items.entry_date) {
        items.entry_date = moment(items.entry_date).format('DD/MM/YYYY')
      } else {
        items.entry_date = '-'
      }
      ws.cell(row, 1).string(toString(items['hospname']));

      ws.cell(row, 2).number(toNumber(items['aiir_covid_qty'])).style(right);
      ws.cell(row, 3).number(toNumber((items['aiir_usage_qty']) || 0)).style(right);
      ws.cell(row, 4).number(toNumber((items.aiir_covid_qty - items.aiir_usage_qty) || 0)).style(right);

      ws.cell(row, 5).number(toNumber(items['modified_aiir_covid_qty'])).style(right);
      ws.cell(row, 6).number(toNumber((items['modified_aiir_usage_qty']) || 0)).style(right);
      ws.cell(row, 7).number(toNumber((items.modified_aiir_covid_qty - items.modified_aiir_usage_qty) || 0)).style(right);

      ws.cell(row, 8).number(toNumber(items['isolate_covid_qty'])).style(right);
      ws.cell(row, 9).number(toNumber((items['isolate_usage_qty']) || 0)).style(right);
      ws.cell(row, 10).number(toNumber((items.isolate_covid_qty - items.isolate_usage_qty) || 0)).style(right);

      ws.cell(row, 11).number(toNumber(items['cohort_covid_qty'])).style(right);
      ws.cell(row, 12).number(toNumber((items['cohort_usage_qty']) || 0)).style(right);
      ws.cell(row, 13).number(toNumber((items.cohort_covid_qty - items.cohort_usage_qty) || 0)).style(right);

      ws.cell(row, 14).number(toNumber(items['hospitel_covid_qty'])).style(right);
      ws.cell(row, 15).number(toNumber((items['hospitel_usage_qty']) || 0)).style(right);
      ws.cell(row, 16).number(toNumber((items.hospitel_covid_qty - items.hospitel_usage_qty) || 0)).style(right);

      ws.cell(row, 17).number(toNumber(items['cohort_icu_covid_qty'])).style(right);
      ws.cell(row, 18).number(toNumber((items['cohort_icu_usage_qty']) || 0)).style(right);
      ws.cell(row, 19).number(toNumber((items.cohort_icu_covid_qty - items.cohort_icu_usage_qty) || 0)).style(right);

      ws.cell(row, 20).string(toString(items['sub_ministry_name'])).style(right);
      ws.cell(row, 21).string(toString(items['level'])).style(right);
      ws.cell(row, 22).string(toString(items['hospital_type'])).style(right);
      ws.cell(row++, 23).string(toString(items['entry_date'])).style(right);
    }

    ws.cell(row, 1).string('รวม');
    ws.cell(row, 2).number(toNumber(sumBy(rs, 'aiir_covid_qty'))).style(right);
    ws.cell(row, 3).number(toNumber(sumBy(rs, 'aiir_usage_qty'))).style(right);
    ws.cell(row, 4).number(toNumber((sumBy(rs, 'aiir_covid_qty') - sumBy(rs, 'aiir_usage_qty')) || 0)).style(right);
    ws.cell(row, 5).number(toNumber(sumBy(rs, 'modified_aiir_covid_qty'))).style(right);
    ws.cell(row, 6).number(toNumber(sumBy(rs, 'modified_aiir_usage_qty'))).style(right);
    ws.cell(row, 7).number(toNumber((sumBy(rs, 'modified_aiir_covid_qty') - sumBy(rs, 'modified_aiir_usage_qty')) || 0)).style(right);
    ws.cell(row, 8).number(toNumber(sumBy(rs, 'isolate_covid_qty'))).style(right);
    ws.cell(row, 9).number(toNumber(sumBy(rs, 'isolate_usage_qty'))).style(right);
    ws.cell(row, 10).number(toNumber((sumBy(rs, 'isolate_covid_qty') - sumBy(rs, 'isolate_usage_qty')) || 0)).style(right);
    ws.cell(row, 11).number(toNumber(sumBy(rs, 'cohort_covid_qty'))).style(right);
    ws.cell(row, 12).number(toNumber(sumBy(rs, 'cohort_usage_qty'))).style(right);
    ws.cell(row, 13).number(toNumber((sumBy(rs, 'cohort_covid_qty') - sumBy(rs, 'cohort_usage_qty')) || 0)).style(right);
    ws.cell(row, 14).number(toNumber(sumBy(rs, 'hospitel_covid_qty'))).style(right);
    ws.cell(row, 15).number(toNumber(sumBy(rs, 'hospitel_usage_qty'))).style(right);
    ws.cell(row, 16).number(toNumber((sumBy(rs, 'hospitel_covid_qty') - sumBy(rs, 'hospitel_usage_qty')) || 0)).style(right);
    ws.cell(row, 17).number(toNumber(sumBy(rs, 'cohort_icu_covid_qty'))).style(right);
    ws.cell(row, 18).number(toNumber(sumBy(rs, 'cohort_icu_usage_qty'))).style(right);
    ws.cell(row, 19).number(toNumber((sumBy(rs, 'cohort_icu_covid_qty') - sumBy(rs, 'cohort_icu_usage_qty')) || 0)).style(right);

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `report6` + moment().format('x');
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

router.get('/report6-ministry/excel', async (req: Request, res: Response) => {
  const db = req.dbReport;
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
    let rs: any = await model.report6Ministry(db, date, sector);

    ws.cell(1, 1, 2, 1, true).string('สังกัด');
    ws.cell(1, 2, 1, 4, true).string('AIIR').style(center);
    ws.cell(1, 5, 1, 7, true).string('Modified AIIR').style(center);
    ws.cell(1, 8, 1, 10, true).string('Isolate').style(center);
    ws.cell(1, 11, 1, 13, true).string('Cohort').style(center);
    ws.cell(1, 14, 1, 16, true).string('Hospitel').style(center);
    ws.cell(1, 17, 1, 19, true).string('Cohort ICU').style(center);
    ws.cell(1, 20, 2, 20, true).string('ข้อมูลล่าสุด');

    ws.cell(2, 2).string('ทั้งหมด');
    ws.cell(2, 3).string('ใช้ไปแล้ว');
    ws.cell(2, 4).string('คงเหลือ');

    ws.cell(2, 5).string('ทั้งหมด');
    ws.cell(2, 6).string('ใช้ไปแล้ว');
    ws.cell(2, 7).string('คงเหลือ');

    ws.cell(2, 8).string('ทั้งหมด');
    ws.cell(2, 9).string('ใช้ไปแล้ว');
    ws.cell(2, 10).string('คงเหลือ');

    ws.cell(2, 11).string('ทั้งหมด');
    ws.cell(2, 12).string('ใช้ไปแล้ว');
    ws.cell(2, 13).string('คงเหลือ');

    ws.cell(2, 14).string('ทั้งหมด');
    ws.cell(2, 15).string('ใช้ไปแล้ว');
    ws.cell(2, 16).string('คงเหลือ');

    ws.cell(2, 17).string('ทั้งหมด');
    ws.cell(2, 18).string('ใช้ไปแล้ว');
    ws.cell(2, 19).string('คงเหลือ');

    ws.cell(3, 1).string('รวม');
    ws.cell(3, 2).number(toNumber(sumBy(rs, 'aiir_covid_qty'))).style(right);
    ws.cell(3, 3).number(toNumber(sumBy(rs, 'aiir_usage_qty'))).style(right);
    ws.cell(3, 4).number(toNumber((sumBy(rs, 'aiir_covid_qty') - sumBy(rs, 'aiir_usage_qty')) || 0)).style(right);
    ws.cell(3, 5).number(toNumber(sumBy(rs, 'modified_aiir_covid_qty'))).style(right);
    ws.cell(3, 6).number(toNumber(sumBy(rs, 'modified_aiir_usage_qty'))).style(right);
    ws.cell(3, 7).number(toNumber((sumBy(rs, 'modified_aiir_covid_qty') - sumBy(rs, 'modified_aiir_usage_qty')) || 0)).style(right);
    ws.cell(3, 8).number(toNumber(sumBy(rs, 'isolate_covid_qty'))).style(right);
    ws.cell(3, 9).number(toNumber(sumBy(rs, 'isolate_usage_qty'))).style(right);
    ws.cell(3, 10).number(toNumber((sumBy(rs, 'isolate_covid_qty') - sumBy(rs, 'isolate_usage_qty')) || 0)).style(right);
    ws.cell(3, 11).number(toNumber(sumBy(rs, 'cohort_covid_qty'))).style(right);
    ws.cell(3, 12).number(toNumber(sumBy(rs, 'cohort_usage_qty'))).style(right);
    ws.cell(3, 13).number(toNumber((sumBy(rs, 'cohort_covid_qty') - sumBy(rs, 'cohort_usage_qty')) || 0)).style(right);
    ws.cell(3, 14).number(toNumber(sumBy(rs, 'hospitel_covid_qty'))).style(right);
    ws.cell(3, 15).number(toNumber(sumBy(rs, 'hospitel_usage_qty'))).style(right);
    ws.cell(3, 16).number(toNumber((sumBy(rs, 'hospitel_covid_qty') - sumBy(rs, 'hospitel_usage_qty')) || 0)).style(right);
    ws.cell(3, 17).number(toNumber(sumBy(rs, 'cohort_icu_covid_qty'))).style(right);
    ws.cell(3, 18).number(toNumber(sumBy(rs, 'cohort_icu_usage_qty'))).style(right);
    ws.cell(3, 19).number(toNumber((sumBy(rs, 'cohort_icu_covid_qty') - sumBy(rs, 'cohort_icu_usage_qty')) || 0)).style(right);

    let row = 4;
    for (const items of rs) {
      if (items.entry_date) {
        items.entry_date = moment(items.entry_date).format('DD/MM/YYYY')
      } else {
        items.entry_date = '-'
      }
      ws.cell(row, 1).string(toString(items['sub_ministry_name']));

      ws.cell(row, 2).number(toNumber(items['aiir_covid_qty'])).style(right);
      ws.cell(row, 3).number(toNumber((items['aiir_usage_qty']) || 0)).style(right);
      ws.cell(row, 4).number(toNumber((items.aiir_covid_qty - items.aiir_usage_qty) || 0)).style(right);

      ws.cell(row, 5).number(toNumber(items['modified_aiir_covid_qty'])).style(right);
      ws.cell(row, 6).number(toNumber((items['modified_aiir_usage_qty']) || 0)).style(right);
      ws.cell(row, 7).number(toNumber((items.modified_aiir_covid_qty - items.modified_aiir_usage_qty) || 0)).style(right);

      ws.cell(row, 8).number(toNumber(items['isolate_covid_qty'])).style(right);
      ws.cell(row, 9).number(toNumber((items['isolate_usage_qty']) || 0)).style(right);
      ws.cell(row, 10).number(toNumber((items.isolate_covid_qty - items.isolate_usage_qty) || 0)).style(right);

      ws.cell(row, 11).number(toNumber(items['cohort_covid_qty'])).style(right);
      ws.cell(row, 12).number(toNumber((items['cohort_usage_qty']) || 0)).style(right);
      ws.cell(row, 13).number(toNumber((items.cohort_covid_qty - items.cohort_usage_qty) || 0)).style(right);

      ws.cell(row, 14).number(toNumber(items['hospitel_covid_qty'])).style(right);
      ws.cell(row, 15).number(toNumber((items['hospitel_usage_qty']) || 0)).style(right);
      ws.cell(row, 16).number(toNumber((items.hospitel_covid_qty - items.hospitel_usage_qty) || 0)).style(right);

      ws.cell(row, 17).number(toNumber(items['cohort_icu_covid_qty'])).style(right);
      ws.cell(row, 18).number(toNumber((items['cohort_icu_usage_qty']) || 0)).style(right);
      ws.cell(row, 19).number(toNumber((items.cohort_icu_covid_qty - items.cohort_icu_usage_qty) || 0)).style(right);

      ws.cell(row++, 20).string(toString(items['entry_date'])).style(right);
    }

    ws.cell(row, 1).string('รวม');
    ws.cell(row, 2).number(toNumber(sumBy(rs, 'aiir_covid_qty'))).style(right);
    ws.cell(row, 3).number(toNumber(sumBy(rs, 'aiir_usage_qty'))).style(right);
    ws.cell(row, 4).number(toNumber((sumBy(rs, 'aiir_covid_qty') - sumBy(rs, 'aiir_usage_qty')) || 0)).style(right);
    ws.cell(row, 5).number(toNumber(sumBy(rs, 'modified_aiir_covid_qty'))).style(right);
    ws.cell(row, 6).number(toNumber(sumBy(rs, 'modified_aiir_usage_qty'))).style(right);
    ws.cell(row, 7).number(toNumber((sumBy(rs, 'modified_aiir_covid_qty') - sumBy(rs, 'modified_aiir_usage_qty')) || 0)).style(right);
    ws.cell(row, 8).number(toNumber(sumBy(rs, 'isolate_covid_qty'))).style(right);
    ws.cell(row, 9).number(toNumber(sumBy(rs, 'isolate_usage_qty'))).style(right);
    ws.cell(row, 10).number(toNumber((sumBy(rs, 'isolate_covid_qty') - sumBy(rs, 'isolate_usage_qty')) || 0)).style(right);
    ws.cell(row, 11).number(toNumber(sumBy(rs, 'cohort_covid_qty'))).style(right);
    ws.cell(row, 12).number(toNumber(sumBy(rs, 'cohort_usage_qty'))).style(right);
    ws.cell(row, 13).number(toNumber((sumBy(rs, 'cohort_covid_qty') - sumBy(rs, 'cohort_usage_qty')) || 0)).style(right);
    ws.cell(row, 14).number(toNumber(sumBy(rs, 'hospitel_covid_qty'))).style(right);
    ws.cell(row, 15).number(toNumber(sumBy(rs, 'hospitel_usage_qty'))).style(right);
    ws.cell(row, 16).number(toNumber((sumBy(rs, 'hospitel_covid_qty') - sumBy(rs, 'hospitel_usage_qty')) || 0)).style(right);
    ws.cell(row, 17).number(toNumber(sumBy(rs, 'cohort_icu_covid_qty'))).style(right);
    ws.cell(row, 18).number(toNumber(sumBy(rs, 'cohort_icu_usage_qty'))).style(right);
    ws.cell(row, 19).number(toNumber((sumBy(rs, 'cohort_icu_covid_qty') - sumBy(rs, 'cohort_icu_usage_qty')) || 0)).style(right);

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `report6` + moment().format('x');
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

router.get('/report6-sector/excel', async (req: Request, res: Response) => {
  const db = req.dbReport;
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
    let rs: any = await model.report6Sector(db, date, sector);

    ws.cell(1, 1, 2, 1, true).string('เขต');
    ws.cell(1, 2, 1, 4, true).string('AIIR').style(center);
    ws.cell(1, 5, 1, 7, true).string('Modified AIIR').style(center);
    ws.cell(1, 8, 1, 10, true).string('Isolate').style(center);
    ws.cell(1, 11, 1, 13, true).string('Cohort').style(center);
    ws.cell(1, 14, 1, 16, true).string('Hospitel').style(center);
    ws.cell(1, 17, 1, 19, true).string('Cohort ICU').style(center);
    ws.cell(1, 20, 2, 20, true).string('ข้อมูลล่าสุด');

    ws.cell(2, 2).string('ทั้งหมด');
    ws.cell(2, 3).string('ใช้ไปแล้ว');
    ws.cell(2, 4).string('คงเหลือ');

    ws.cell(2, 5).string('ทั้งหมด');
    ws.cell(2, 6).string('ใช้ไปแล้ว');
    ws.cell(2, 7).string('คงเหลือ');

    ws.cell(2, 8).string('ทั้งหมด');
    ws.cell(2, 9).string('ใช้ไปแล้ว');
    ws.cell(2, 10).string('คงเหลือ');

    ws.cell(2, 11).string('ทั้งหมด');
    ws.cell(2, 12).string('ใช้ไปแล้ว');
    ws.cell(2, 13).string('คงเหลือ');

    ws.cell(2, 14).string('ทั้งหมด');
    ws.cell(2, 15).string('ใช้ไปแล้ว');
    ws.cell(2, 16).string('คงเหลือ');

    ws.cell(2, 17).string('ทั้งหมด');
    ws.cell(2, 18).string('ใช้ไปแล้ว');
    ws.cell(2, 19).string('คงเหลือ');

    ws.cell(3, 1).string('รวม');
    ws.cell(3, 2).number(toNumber(sumBy(rs, 'aiir_covid_qty'))).style(right);
    ws.cell(3, 3).number(toNumber(sumBy(rs, 'aiir_usage_qty'))).style(right);
    ws.cell(3, 4).number(toNumber((sumBy(rs, 'aiir_covid_qty') - sumBy(rs, 'aiir_usage_qty')) || 0)).style(right);
    ws.cell(3, 5).number(toNumber(sumBy(rs, 'modified_aiir_covid_qty'))).style(right);
    ws.cell(3, 6).number(toNumber(sumBy(rs, 'modified_aiir_usage_qty'))).style(right);
    ws.cell(3, 7).number(toNumber((sumBy(rs, 'modified_aiir_covid_qty') - sumBy(rs, 'modified_aiir_usage_qty')) || 0)).style(right);
    ws.cell(3, 8).number(toNumber(sumBy(rs, 'isolate_covid_qty'))).style(right);
    ws.cell(3, 9).number(toNumber(sumBy(rs, 'isolate_usage_qty'))).style(right);
    ws.cell(3, 10).number(toNumber((sumBy(rs, 'isolate_covid_qty') - sumBy(rs, 'isolate_usage_qty')) || 0)).style(right);
    ws.cell(3, 11).number(toNumber(sumBy(rs, 'cohort_covid_qty'))).style(right);
    ws.cell(3, 12).number(toNumber(sumBy(rs, 'cohort_usage_qty'))).style(right);
    ws.cell(3, 13).number(toNumber((sumBy(rs, 'cohort_covid_qty') - sumBy(rs, 'cohort_usage_qty')) || 0)).style(right);
    ws.cell(3, 14).number(toNumber(sumBy(rs, 'hospitel_covid_qty'))).style(right);
    ws.cell(3, 15).number(toNumber(sumBy(rs, 'hospitel_usage_qty'))).style(right);
    ws.cell(3, 16).number(toNumber((sumBy(rs, 'hospitel_covid_qty') - sumBy(rs, 'hospitel_usage_qty')) || 0)).style(right);
    ws.cell(3, 17).number(toNumber(sumBy(rs, 'cohort_icu_covid_qty'))).style(right);
    ws.cell(3, 18).number(toNumber(sumBy(rs, 'cohort_icu_usage_qty'))).style(right);
    ws.cell(3, 19).number(toNumber((sumBy(rs, 'cohort_icu_covid_qty') - sumBy(rs, 'cohort_icu_usage_qty')) || 0)).style(right);

    let row = 4;
    for (const items of rs) {
      if (items.entry_date) {
        items.entry_date = moment(items.entry_date).format('DD/MM/YYYY')
      } else {
        items.entry_date = '-'
      }
      ws.cell(row, 1).string(toString(items['zone_code']));

      ws.cell(row, 2).number(toNumber(items['aiir_covid_qty'])).style(right);
      ws.cell(row, 3).number(toNumber((items['aiir_usage_qty']) || 0)).style(right);
      ws.cell(row, 4).number(toNumber((items.aiir_covid_qty - items.aiir_usage_qty) || 0)).style(right);

      ws.cell(row, 5).number(toNumber(items['modified_aiir_covid_qty'])).style(right);
      ws.cell(row, 6).number(toNumber((items['modified_aiir_usage_qty']) || 0)).style(right);
      ws.cell(row, 7).number(toNumber((items.modified_aiir_covid_qty - items.modified_aiir_usage_qty) || 0)).style(right);

      ws.cell(row, 8).number(toNumber(items['isolate_covid_qty'])).style(right);
      ws.cell(row, 9).number(toNumber((items['isolate_usage_qty']) || 0)).style(right);
      ws.cell(row, 10).number(toNumber((items.isolate_covid_qty - items.isolate_usage_qty) || 0)).style(right);

      ws.cell(row, 11).number(toNumber(items['cohort_covid_qty'])).style(right);
      ws.cell(row, 12).number(toNumber((items['cohort_usage_qty']) || 0)).style(right);
      ws.cell(row, 13).number(toNumber((items.cohort_covid_qty - items.cohort_usage_qty) || 0)).style(right);

      ws.cell(row, 14).number(toNumber(items['hospitel_covid_qty'])).style(right);
      ws.cell(row, 15).number(toNumber((items['hospitel_usage_qty']) || 0)).style(right);
      ws.cell(row, 16).number(toNumber((items.hospitel_covid_qty - items.hospitel_usage_qty) || 0)).style(right);

      ws.cell(row, 17).number(toNumber(items['cohort_icu_covid_qty'])).style(right);
      ws.cell(row, 18).number(toNumber((items['cohort_icu_usage_qty']) || 0)).style(right);
      ws.cell(row, 19).number(toNumber((items.cohort_icu_covid_qty - items.cohort_icu_usage_qty) || 0)).style(right);

      ws.cell(row++, 20).string(toString(items['entry_date'])).style(right);
    }

    ws.cell(row, 1).string('รวม');
    ws.cell(row, 2).number(toNumber(sumBy(rs, 'aiir_covid_qty'))).style(right);
    ws.cell(row, 3).number(toNumber(sumBy(rs, 'aiir_usage_qty'))).style(right);
    ws.cell(row, 4).number(toNumber((sumBy(rs, 'aiir_covid_qty') - sumBy(rs, 'aiir_usage_qty')) || 0)).style(right);
    ws.cell(row, 5).number(toNumber(sumBy(rs, 'modified_aiir_covid_qty'))).style(right);
    ws.cell(row, 6).number(toNumber(sumBy(rs, 'modified_aiir_usage_qty'))).style(right);
    ws.cell(row, 7).number(toNumber((sumBy(rs, 'modified_aiir_covid_qty') - sumBy(rs, 'modified_aiir_usage_qty')) || 0)).style(right);
    ws.cell(row, 8).number(toNumber(sumBy(rs, 'isolate_covid_qty'))).style(right);
    ws.cell(row, 9).number(toNumber(sumBy(rs, 'isolate_usage_qty'))).style(right);
    ws.cell(row, 10).number(toNumber((sumBy(rs, 'isolate_covid_qty') - sumBy(rs, 'isolate_usage_qty')) || 0)).style(right);
    ws.cell(row, 11).number(toNumber(sumBy(rs, 'cohort_covid_qty'))).style(right);
    ws.cell(row, 12).number(toNumber(sumBy(rs, 'cohort_usage_qty'))).style(right);
    ws.cell(row, 13).number(toNumber((sumBy(rs, 'cohort_covid_qty') - sumBy(rs, 'cohort_usage_qty')) || 0)).style(right);
    ws.cell(row, 14).number(toNumber(sumBy(rs, 'hospitel_covid_qty'))).style(right);
    ws.cell(row, 15).number(toNumber(sumBy(rs, 'hospitel_usage_qty'))).style(right);
    ws.cell(row, 16).number(toNumber((sumBy(rs, 'hospitel_covid_qty') - sumBy(rs, 'hospitel_usage_qty')) || 0)).style(right);
    ws.cell(row, 17).number(toNumber(sumBy(rs, 'cohort_icu_covid_qty'))).style(right);
    ws.cell(row, 18).number(toNumber(sumBy(rs, 'cohort_icu_usage_qty'))).style(right);
    ws.cell(row, 19).number(toNumber((sumBy(rs, 'cohort_icu_covid_qty') - sumBy(rs, 'cohort_icu_usage_qty')) || 0)).style(right);

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `report6` + moment().format('x');
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
  const db = req.dbReport;
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
    const rs: any = await model.report7(db, date, sector);
    ws.cell(1, 1, 2, 1, true).string('โรงพยาบาล');
    ws.cell(1, 2, 1, 3, true).string('Non-invasive ventilator (NIV)').style(center);
    ws.cell(1, 4, 1, 5, true).string('Invasive ventilator').style(center);
    ws.cell(1, 6, 1, 7, true).string('High Flow').style(center);
    ws.cell(1, 8, 1, 9, true).string('PAPR').style(center);
    ws.cell(1, 10, 2, 10, true).string('หน่วยงาน');
    ws.cell(1, 11, 2, 11, true).string('ข้อมูลล่าสุด');

    ws.cell(2, 2).string('ใช้กับผู้ป่วย Covid');
    ws.cell(2, 3).string('ทั้งหมด');

    ws.cell(2, 4).string('ใช้กับผู้ป่วย Covid');
    ws.cell(2, 5).string('ทั้งหมด');

    ws.cell(2, 6).string('ใช้กับผู้ป่วย Covid');
    ws.cell(2, 7).string('ทั้งหมด');

    ws.cell(2, 8).string('ใช้กับผู้ป่วย Covid');
    ws.cell(2, 9).string('ทั้งหมด');

    ws.cell(3, 1).string('รวม');
    ws.cell(3, 2).number(toNumber(sumBy(rs, 'non_invasive_ventilator'))).style(right);
    ws.cell(3, 3).number(toNumber(sumBy(rs, 'non_invasive_qty'))).style(right);
    ws.cell(3, 4).number(toNumber(sumBy(rs, 'invasive_ventilator'))).style(right);
    ws.cell(3, 5).number(toNumber(sumBy(rs, 'invasive_qty'))).style(right);
    ws.cell(3, 6).number(toNumber(sumBy(rs, 'high_flow'))).style(right);
    ws.cell(3, 7).number(toNumber(sumBy(rs, 'high_flow_qty'))).style(right);
    ws.cell(3, 8).number(toNumber(sumBy(rs, 'papr'))).style(right);
    ws.cell(3, 9).number(toNumber(sumBy(rs, 'papr_qty'))).style(right);

    let row = 4;
    for (const items of rs) {
      if (items.updated_entry) {
        items.updated_entry = moment(items.updated_entry).format('DD/MM/YYYY')
      } else {
        items.updated_entry = '-'
      }
      ws.cell(row, 1).string(toString(items['hospname']));
      ws.cell(row, 2).number(toNumber(items['non_invasive_ventilator']));
      ws.cell(row, 3).number(toNumber(items['non_invasive_qty']));
      ws.cell(row, 4).number(toNumber(items['invasive_ventilator']));
      ws.cell(row, 5).number(toNumber(items['invasive_qty']));
      ws.cell(row, 6).number(toNumber(items['high_flow']));
      ws.cell(row, 7).number(toNumber(items['high_flow_qty']));
      ws.cell(row, 8).number(toNumber(items['papr']));
      ws.cell(row, 9).number(toNumber(items['papr_qty']));
      ws.cell(row, 10).string(toString(items['sub_ministry_name'])).style(right);
      ws.cell(row++, 11).string(toString(items['updated_entry'])).style(right);
    }

    ws.cell(row, 1).string('รวม');
    ws.cell(row, 2).number(toNumber(sumBy(rs, 'non_invasive_ventilator'))).style(right);
    ws.cell(row, 3).number(toNumber(sumBy(rs, 'non_invasive_qty'))).style(right);
    ws.cell(row, 4).number(toNumber(sumBy(rs, 'invasive_ventilator'))).style(right);
    ws.cell(row, 5).number(toNumber(sumBy(rs, 'invasive_qty'))).style(right);
    ws.cell(row, 6).number(toNumber(sumBy(rs, 'high_flow'))).style(right);
    ws.cell(row, 7).number(toNumber(sumBy(rs, 'high_flow_qty'))).style(right);
    ws.cell(row, 8).number(toNumber(sumBy(rs, 'papr'))).style(right);
    ws.cell(row, 9).number(toNumber(sumBy(rs, 'papr_qty'))).style(right);

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `report7` + moment().format('x');
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

router.get('/report7-ministry/excel', async (req: Request, res: Response) => {
  const db = req.dbReport;
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
    let rs: any = await model.report7Ministry(db, date, sector);
    rs = rs[0];

    ws.cell(1, 1, 2, 1, true).string('สังกัด');
    ws.cell(1, 2, 1, 3, true).string('Non-invasive ventilator (NIV)').style(center);
    ws.cell(1, 4, 1, 5, true).string('Invasive ventilator').style(center);
    ws.cell(1, 6, 1, 7, true).string('High Flow').style(center);
    ws.cell(1, 6, 1, 7, true).string('PAPR').style(center);
    ws.cell(1, 8, 2, 8, true).string('ข้อมูลล่าสุด');

    ws.cell(2, 2).string('ใช้กับผู้ป่วย Covid');
    ws.cell(2, 3).string('ทั้งหมด');

    ws.cell(2, 4).string('ใช้กับผู้ป่วย Covid');
    ws.cell(2, 5).string('ทั้งหมด');

    ws.cell(2, 6).string('ใช้กับผู้ป่วย Covid');
    ws.cell(2, 7).string('ทั้งหมด');

    ws.cell(2, 8).string('ใช้กับผู้ป่วย Covid');
    ws.cell(2, 9).string('ทั้งหมด');

    ws.cell(3, 1).string('รวม');
    ws.cell(3, 2).number(toNumber(sumBy(rs, 'non_invasive_ventilator'))).style(right);
    ws.cell(3, 3).number(toNumber(sumBy(rs, 'non_invasive_qty'))).style(right);
    ws.cell(3, 4).number(toNumber(sumBy(rs, 'invasive_ventilator'))).style(right);
    ws.cell(3, 5).number(toNumber(sumBy(rs, 'invasive_qty'))).style(right);
    ws.cell(3, 6).number(toNumber(sumBy(rs, 'high_flow'))).style(right);
    ws.cell(3, 7).number(toNumber(sumBy(rs, 'high_flow_qty'))).style(right);
    ws.cell(3, 8).number(toNumber(sumBy(rs, 'papr'))).style(right);
    ws.cell(3, 9).number(toNumber(sumBy(rs, 'papr_qty'))).style(right);

    let row = 4;
    for (const items of rs) {
      if (items.updated_entry) {
        items.updated_entry = moment(items.updated_entry).format('DD/MM/YYYY')
      } else {
        items.updated_entry = '-'
      }
      ws.cell(row, 1).string(toString(items['sub_ministry_name']));
      ws.cell(row, 2).number(toNumber(items['non_invasive_ventilator']));
      ws.cell(row, 3).number(toNumber(items['non_invasive_qty']));
      ws.cell(row, 4).number(toNumber(items['invasive_ventilator']));
      ws.cell(row, 5).number(toNumber(items['invasive_qty']));
      ws.cell(row, 6).number(toNumber(items['high_flow']));
      ws.cell(row, 7).number(toNumber(items['high_flow_qty']));
      ws.cell(row, 8).number(toNumber(items['papr']));
      ws.cell(row, 9).number(toNumber(items['papr_qty']));
      ws.cell(row++, 10).string(toString(items['updated_entry'])).style(right);
    }

    ws.cell(row, 1).string('รวม');
    ws.cell(row, 2).number(toNumber(sumBy(rs, 'non_invasive_ventilator'))).style(right);
    ws.cell(row, 3).number(toNumber(sumBy(rs, 'non_invasive_qty'))).style(right);
    ws.cell(row, 4).number(toNumber(sumBy(rs, 'invasive_ventilator'))).style(right);
    ws.cell(row, 5).number(toNumber(sumBy(rs, 'invasive_qty'))).style(right);
    ws.cell(row, 6).number(toNumber(sumBy(rs, 'high_flow'))).style(right);
    ws.cell(row, 7).number(toNumber(sumBy(rs, 'high_flow_qty'))).style(right);
    ws.cell(row, 8).number(toNumber(sumBy(rs, 'papr'))).style(right);
    ws.cell(row, 9).number(toNumber(sumBy(rs, 'papr_qty'))).style(right);

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `report7` + moment().format('x');
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

router.get('/report7-sector/excel', async (req: Request, res: Response) => {
  const db = req.dbReport;
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
    let rs: any = await model.report7Sector(db, date, sector);
    rs = rs[0];

    ws.cell(1, 1, 2, 1, true).string('เขต');
    ws.cell(1, 2, 1, 3, true).string('Non-invasive ventilator (NIV)').style(center);
    ws.cell(1, 4, 1, 5, true).string('Invasive ventilator').style(center);
    ws.cell(1, 6, 1, 7, true).string('High Flow').style(center);
    ws.cell(1, 8, 1, 9, true).string('PAPR').style(center);
    ws.cell(1, 10, 2, 10, true).string('ข้อมูลล่าสุด');

    ws.cell(2, 2).string('ใช้กับผู้ป่วย Covid');
    ws.cell(2, 3).string('ทั้งหมด');

    ws.cell(2, 4).string('ใช้กับผู้ป่วย Covid');
    ws.cell(2, 5).string('ทั้งหมด');

    ws.cell(2, 6).string('ใช้กับผู้ป่วย Covid');
    ws.cell(2, 7).string('ทั้งหมด');

    ws.cell(2, 8).string('ใช้กับผู้ป่วย Covid');
    ws.cell(2, 9).string('ทั้งหมด');

    ws.cell(3, 1).string('รวม');
    ws.cell(3, 2).number(toNumber(sumBy(rs, 'non_invasive_ventilator'))).style(right);
    ws.cell(3, 3).number(toNumber(sumBy(rs, 'non_invasive_qty'))).style(right);
    ws.cell(3, 4).number(toNumber(sumBy(rs, 'invasive_ventilator'))).style(right);
    ws.cell(3, 5).number(toNumber(sumBy(rs, 'invasive_qty'))).style(right);
    ws.cell(3, 6).number(toNumber(sumBy(rs, 'high_flow'))).style(right);
    ws.cell(3, 7).number(toNumber(sumBy(rs, 'high_flow_qty'))).style(right);
    ws.cell(3, 8).number(toNumber(sumBy(rs, 'papr'))).style(right);
    ws.cell(3, 9).number(toNumber(sumBy(rs, 'papr_qty'))).style(right);

    let row = 4;
    for (const items of rs) {
      if (items.updated_entry) {
        items.updated_entry = moment(items.updated_entry).format('DD/MM/YYYY')
      } else {
        items.updated_entry = '-'
      }
      ws.cell(row, 1).string(toString(items['zone_code']));
      ws.cell(row, 2).number(toNumber(items['non_invasive_ventilator']));
      ws.cell(row, 3).number(toNumber(items['non_invasive_qty']));
      ws.cell(row, 4).number(toNumber(items['invasive_ventilator']));
      ws.cell(row, 5).number(toNumber(items['invasive_qty']));
      ws.cell(row, 6).number(toNumber(items['high_flow']));
      ws.cell(row, 7).number(toNumber(items['high_flow_qty']));
      ws.cell(row, 8).number(toNumber(items['papr']));
      ws.cell(row, 9).number(toNumber(items['papr_qty']));
      ws.cell(row++, 10).string(toString(items['updated_entry'])).style(right);
    }

    ws.cell(row, 1).string('รวม');
    ws.cell(row, 2).number(toNumber(sumBy(rs, 'non_invasive_ventilator'))).style(right);
    ws.cell(row, 3).number(toNumber(sumBy(rs, 'non_invasive_qty'))).style(right);
    ws.cell(row, 4).number(toNumber(sumBy(rs, 'invasive_ventilator'))).style(right);
    ws.cell(row, 5).number(toNumber(sumBy(rs, 'invasive_qty'))).style(right);
    ws.cell(row, 6).number(toNumber(sumBy(rs, 'high_flow'))).style(right);
    ws.cell(row, 7).number(toNumber(sumBy(rs, 'high_flow_qty'))).style(right);
    ws.cell(row, 8).number(toNumber(sumBy(rs, 'papr'))).style(right);
    ws.cell(row, 9).number(toNumber(sumBy(rs, 'papr_qty'))).style(right);

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `report7` + moment().format('x');
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
  const db = req.dbReport;
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
    const rs: any = await model.report8(db, date, sector);
    ws.cell(1, 1, 2, 1, true).string('โรงพยาบาล');
    ws.cell(1, 6, 2, 6, true).string('หน่วยงาน');
    ws.cell(1, 7, 2, 7, true).string('ข้อมูลล่าสุด');

    ws.cell(1, 2).string('Mask N95');
    ws.cell(1, 3).string('Surgical mask');
    ws.cell(1, 4).string('Cover All');
    ws.cell(1, 5).string('Surgical gown (ชุด)');

    ws.cell(2, 2).string('ปริมาณคงคลัง(ชิ้น)');
    ws.cell(2, 3).string('ปริมาณคงคลัง(ชิ้น)');
    ws.cell(2, 4).string('ปริมาณคงคลัง(ชิ้น)');
    ws.cell(2, 5).string('ปริมาณคงคลัง(ชิ้น)');

    ws.cell(3, 1).string('รวม');
    ws.cell(3, 2).number(toNumber(sumBy(rs, 'n95_qty'))).style(right);
    ws.cell(3, 3).number(toNumber(sumBy(rs, 'surgical_mask_qty'))).style(right);
    ws.cell(3, 4).number(toNumber(sumBy(rs, 'cover_all2_qty'))).style(right);
    ws.cell(3, 5).number(toNumber(sumBy(rs, 'surgical_gown_qty'))).style(right);

    let row = 4;
    for (const items of rs) {
      if (items.update_date) {
        items.update_date = moment(items.update_date).format('DD/MM/YYYY')
      } else {
        items.update_date = '-'
      }
      ws.cell(row, 1).string(toString(items['hospname']));
      ws.cell(row, 2).number(toNumber(items['n95_qty'])).style(right);
      ws.cell(row, 3).number(toNumber(items['surgical_mask_qty'])).style(right);
      ws.cell(row, 4).number(toNumber(items['cover_all2_qty'])).style(right);
      ws.cell(row, 5).number(toNumber(items['surgical_gown_qty'])).style(right);
      ws.cell(row, 6).string(toString(items['sub_ministry_name'])).style(right);
      ws.cell(row++, 7).string(toString(items['update_date'])).style(right);
    }

    ws.cell(row, 1).string('รวม');
    ws.cell(row, 2).number(toNumber(sumBy(rs, 'n95_qty'))).style(right);
    ws.cell(row, 3).number(toNumber(sumBy(rs, 'surgical_mask_qty'))).style(right);
    ws.cell(row, 4).number(toNumber(sumBy(rs, 'cover_all2_qty'))).style(right);
    ws.cell(row, 5).number(toNumber(sumBy(rs, 'surgical_gown_qty'))).style(right);

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `report8` + moment().format('x');
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
  const db = req.dbReport;
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
    const rs: any = await model.report9(db, date, sector);
    ws.cell(1, 1, 2, 1, true).string('โรงพยาบาล');
    ws.cell(1, 2, 1, 4, true).string('อายุรแพทย์โรคติดเชื้อ').style(center);
    ws.cell(1, 5, 1, 7, true).string('อายุรแพทย์ระบบทางเดินหายใจ').style(center);
    ws.cell(1, 8, 1, 10, true).string('แพทย์ Critical care').style(center);
    ws.cell(1, 11, 1, 13, true).string('อายุรแพทย์ทั้งหมด').style(center);
    ws.cell(1, 14, 1, 16, true).string('วิสัญญีแพทย์').style(center);
    ws.cell(1, 17, 2, 17, true).string('หน่วยงาน');
    ws.cell(1, 18, 2, 18, true).string('ข้อมูลล่าสุด');

    ws.cell(2, 2).string('รวม');
    ws.cell(2, 3).string('ปฎิบัติจริง');
    ws.cell(2, 4).string('รับการสนับสนุน');

    ws.cell(2, 5).string('รวม');
    ws.cell(2, 6).string('ปฎิบัติจริง');
    ws.cell(2, 7).string('รับการสนับสนุน');

    ws.cell(2, 8).string('รวม');
    ws.cell(2, 9).string('ปฎิบัติจริง');
    ws.cell(2, 10).string('รับการสนับสนุน');

    ws.cell(2, 11).string('รวม');
    ws.cell(2, 12).string('ปฎิบัติจริง');
    ws.cell(2, 13).string('รับการสนับสนุน');

    ws.cell(2, 14).string('รวม');
    ws.cell(2, 15).string('ปฎิบัติจริง');
    ws.cell(2, 16).string('รับการสนับสนุน');

    ws.cell(3, 1).string('รวม');
    ws.cell(3, 2).number(toNumber((sumBy(rs, 'infectious_disease_qty') || 0) + (sumBy(rs, 'infectious_disease_support_qty')) || 0)).style(right);
    ws.cell(3, 3).number(toNumber(sumBy(rs, 'infectious_disease_qty') || 0)).style(right);
    ws.cell(3, 4).number(toNumber(sumBy(rs, 'infectious_disease_support_qty') || 0)).style(right);

    ws.cell(3, 5).number(toNumber((sumBy(rs, 'pulmonary_medicine_qty') || 0) + (sumBy(rs, 'pulmonary_medicine_support_qty')) || 0)).style(right);
    ws.cell(3, 6).number(toNumber(sumBy(rs, 'pulmonary_medicine_qty') || 0)).style(right);
    ws.cell(3, 7).number(toNumber(sumBy(rs, 'pulmonary_medicine_support_qty') || 0)).style(right);

    ws.cell(3, 8).number(toNumber((sumBy(rs, 'division_of_critical_care_qty') || 0) + (sumBy(rs, 'division_of_critical_care_support_qty')) || 0)).style(right);
    ws.cell(3, 9).number(toNumber(sumBy(rs, 'division_of_critical_care_qty') || 0)).style(right);
    ws.cell(3, 10).number(toNumber(sumBy(rs, 'division_of_critical_care_support_qty') || 0)).style(right);

    ws.cell(3, 11).number(toNumber((sumBy(rs, 'internal_medicine_total_qty') || 0) + (sumBy(rs, 'internal_medicine_support_total_qty')) || 0)).style(right);
    ws.cell(3, 12).number(toNumber(sumBy(rs, 'internal_medicine_total_qty') || 0)).style(right);
    ws.cell(3, 13).number(toNumber(sumBy(rs, 'internal_medicine_support_total_qty') || 0)).style(right);

    ws.cell(3, 14).number(toNumber((sumBy(rs, 'anesthesiologist_qty') || 0) + (sumBy(rs, 'anesthesiologist_support_qty')) || 0)).style(right);
    ws.cell(3, 15).number(toNumber(sumBy(rs, 'anesthesiologist_qty') || 0)).style(right);
    ws.cell(3, 16).number(toNumber(sumBy(rs, 'anesthesiologist_support_qty') || 0)).style(right);

    let row = 4;
    for (const items of rs) {
      if (items.update_date) {
        items.update_date = moment(items.update_date).format('DD/MM/YYYY')
      } else {
        items.update_date = '-'
      }
      ws.cell(row, 1).string(toString(items['hospname']));

      ws.cell(row, 2).number(toNumber((items.infectious_disease_qty || 0) + (items.infectious_disease_support_qty) || 0)).style(right);
      ws.cell(row, 3).number(toNumber(items.infectious_disease_qty || 0)).style(right);
      ws.cell(row, 4).number(toNumber(items.infectious_disease_support_qty || 0)).style(right);

      ws.cell(row, 5).number(toNumber((items.pulmonary_medicine_qty || 0) + (items.pulmonary_medicine_support_qty) || 0)).style(right);
      ws.cell(row, 6).number(toNumber(items.pulmonary_medicine_qty || 0)).style(right);
      ws.cell(row, 7).number(toNumber(items.pulmonary_medicine_support_qty || 0)).style(right);

      ws.cell(row, 8).number(toNumber((items.division_of_critical_care_qty || 0) + (items.division_of_critical_care_support_qty) || 0)).style(right);
      ws.cell(row, 9).number(toNumber(items.division_of_critical_care_qty || 0)).style(right);
      ws.cell(row, 10).number(toNumber(items.division_of_critical_care_support_qty || 0)).style(right);

      ws.cell(row, 11).number(toNumber((items.internal_medicine_total_qty || 0) + (items.internal_medicine_support_total_qty) || 0)).style(right);
      ws.cell(row, 12).number(toNumber(items.internal_medicine_total_qty || 0)).style(right);
      ws.cell(row, 13).number(toNumber(items.internal_medicine_support_total_qty || 0)).style(right);

      ws.cell(row, 14).number(toNumber((items.anesthesiologist_qty || 0) + (items.anesthesiologist_support_qty) || 0)).style(right);
      ws.cell(row, 15).number(toNumber(items.anesthesiologist_qty || 0)).style(right);
      ws.cell(row, 16).number(toNumber(items.anesthesiologist_support_qty || 0)).style(right);

      ws.cell(row, 17).string(toString(items['sub_ministry_name']));
      ws.cell(row++, 18).string(toString(items['update_date']));
    }

    ws.cell(row, 1).string('รวม');
    ws.cell(row, 2).number(toNumber((sumBy(rs, 'infectious_disease_qty') || 0) + (sumBy(rs, 'infectious_disease_support_qty')) || 0)).style(right);
    ws.cell(row, 3).number(toNumber(sumBy(rs, 'infectious_disease_qty') || 0)).style(right);
    ws.cell(row, 4).number(toNumber(sumBy(rs, 'infectious_disease_support_qty') || 0)).style(right);

    ws.cell(row, 5).number(toNumber((sumBy(rs, 'pulmonary_medicine_qty') || 0) + (sumBy(rs, 'pulmonary_medicine_support_qty')) || 0)).style(right);
    ws.cell(row, 6).number(toNumber(sumBy(rs, 'pulmonary_medicine_qty') || 0)).style(right);
    ws.cell(row, 7).number(toNumber(sumBy(rs, 'pulmonary_medicine_support_qty') || 0)).style(right);

    ws.cell(row, 8).number(toNumber((sumBy(rs, 'division_of_critical_care_qty') || 0) + (sumBy(rs, 'division_of_critical_care_support_qty')) || 0)).style(right);
    ws.cell(row, 9).number(toNumber(sumBy(rs, 'division_of_critical_care_qty') || 0)).style(right);
    ws.cell(row, 10).number(toNumber(sumBy(rs, 'division_of_critical_care_support_qty') || 0)).style(right);

    ws.cell(row, 11).number(toNumber((sumBy(rs, 'internal_medicine_total_qty') || 0) + (sumBy(rs, 'internal_medicine_support_total_qty')) || 0)).style(right);
    ws.cell(row, 12).number(toNumber(sumBy(rs, 'internal_medicine_total_qty') || 0)).style(right);
    ws.cell(row, 13).number(toNumber(sumBy(rs, 'internal_medicine_support_total_qty') || 0)).style(right);

    ws.cell(row, 14).number(toNumber((sumBy(rs, 'anesthesiologist_qty') || 0) + (sumBy(rs, 'anesthesiologist_support_qty')) || 0)).style(right);
    ws.cell(row, 15).number(toNumber(sumBy(rs, 'anesthesiologist_qty') || 0)).style(right);
    ws.cell(row, 16).number(toNumber(sumBy(rs, 'anesthesiologist_support_qty') || 0)).style(right);

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `report9` + moment().format('x');
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
  const db = req.dbReport;
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
    const rs: any = await model.report10(db, date, sector);

    ws.cell(1, 1, 2, 1, true).string('โรงพยาบาล');
    ws.cell(1, 2, 1, 4, true).string('พยาบาลวิสัญญี').style(center);
    ws.cell(1, 5, 1, 7, true).string('พยาบาล IC').style(center);
    ws.cell(1, 8, 1, 10, true).string('พยาบาล ICU').style(center);
    ws.cell(1, 11, 1, 13, true).string('พยาบาล Critical Care').style(center);
    ws.cell(1, 14, 1, 16, true).string('พยาบาลทั่วไป').style(center);
    ws.cell(1, 17, 2, 17, true).string('หน่วยงาน');
    ws.cell(1, 18, 2, 18, true).string('ข้อมูลล่าสุด');

    ws.cell(2, 2).string('รวม');
    ws.cell(2, 3).string('ปฎิบัติจริง');
    ws.cell(2, 4).string('รับการสนับสนุน');

    ws.cell(2, 5).string('รวม');
    ws.cell(2, 6).string('ปฎิบัติจริง');
    ws.cell(2, 7).string('รับการสนับสนุน');

    ws.cell(2, 8).string('รวม');
    ws.cell(2, 9).string('ปฎิบัติจริง');
    ws.cell(2, 10).string('รับการสนับสนุน');

    ws.cell(2, 11).string('รวม');
    ws.cell(2, 12).string('ปฎิบัติจริง');
    ws.cell(2, 13).string('รับการสนับสนุน');

    ws.cell(2, 14).string('รวม');
    ws.cell(2, 15).string('ปฎิบัติจริง');
    ws.cell(2, 16).string('รับการสนับสนุน');

    ws.cell(3, 1).string('รวม');
    ws.cell(3, 2).number(toNumber((sumBy(rs, 'anesthetist_nurse_qty') || 0) + (sumBy(rs, 'anesthetist_nurse_support_qty')) || 0)).style(right);
    ws.cell(3, 3).number(toNumber(sumBy(rs, 'anesthetist_nurse_qty') || 0)).style(right);
    ws.cell(3, 4).number(toNumber(sumBy(rs, 'anesthetist_nurse_support_qty') || 0)).style(right);

    ws.cell(3, 5).number(toNumber((sumBy(rs, 'infectious_disease_nurse_qty') || 0) + (sumBy(rs, 'infectious_disease_nurse_support_qty')) || 0)).style(right);
    ws.cell(3, 6).number(toNumber(sumBy(rs, 'infectious_disease_nurse_qty') || 0)).style(right);
    ws.cell(3, 7).number(toNumber(sumBy(rs, 'infectious_disease_nurse_support_qty') || 0)).style(right);

    ws.cell(3, 8).number(toNumber((sumBy(rs, 'intensive_care_unit_qty') || 0) + (sumBy(rs, 'intensive_care_unit_support_qty')) || 0)).style(right);
    ws.cell(3, 9).number(toNumber(sumBy(rs, 'intensive_care_unit_qty') || 0)).style(right);
    ws.cell(3, 10).number(toNumber(sumBy(rs, 'intensive_care_unit_support_qty') || 0)).style(right);

    ws.cell(3, 11).number(toNumber((sumBy(rs, 'critical_care_medicine_qty') || 0) + (sumBy(rs, 'critical_care_medicine_support_qty')) || 0)).style(right);
    ws.cell(3, 12).number(toNumber(sumBy(rs, 'critical_care_medicine_qty') || 0)).style(right);
    ws.cell(3, 13).number(toNumber(sumBy(rs, 'critical_care_medicine_support_qty') || 0)).style(right);

    ws.cell(3, 14).number(toNumber((sumBy(rs, 'nurse_qty') || 0) + (sumBy(rs, 'nurse_support_qty')) || 0)).style(right);
    ws.cell(3, 15).number(toNumber(sumBy(rs, 'nurse_qty') || 0)).style(right);
    ws.cell(3, 16).number(toNumber(sumBy(rs, 'nurse_support_qty') || 0)).style(right);

    let row = 4;
    for (const items of rs) {
      if (items.update_date) {
        items.update_date = moment(items.update_date).format('DD/MM/YYYY')
      } else {
        items.update_date = '-'
      }
      ws.cell(row, 1).string(toString(items['hospname']));

      ws.cell(row, 2).number(toNumber((items.anesthetist_nurse_qty || 0) + (items.anesthetist_nurse_support_qty) || 0)).style(right);
      ws.cell(row, 3).number(toNumber(items.anesthetist_nurse_qty || 0)).style(right);
      ws.cell(row, 4).number(toNumber(items.anesthetist_nurse_support_qty || 0)).style(right);

      ws.cell(row, 5).number(toNumber((items.infectious_disease_nurse_qty || 0) + (items.infectious_disease_nurse_support_qty) || 0)).style(right);
      ws.cell(row, 6).number(toNumber(items.infectious_disease_nurse_qty || 0)).style(right);
      ws.cell(row, 7).number(toNumber(items.infectious_disease_nurse_support_qty || 0)).style(right);

      ws.cell(row, 8).number(toNumber((items.intensive_care_unit_qty || 0) + (items.intensive_care_unit_support_qty) || 0)).style(right);
      ws.cell(row, 9).number(toNumber(items.intensive_care_unit_qty || 0)).style(right);
      ws.cell(row, 10).number(toNumber(items.intensive_care_unit_support_qty || 0)).style(right);

      ws.cell(row, 11).number(toNumber((items.critical_care_medicine_qty || 0) + (items.critical_care_medicine_support_qty) || 0)).style(right);
      ws.cell(row, 12).number(toNumber(items.critical_care_medicine_qty || 0)).style(right);
      ws.cell(row, 13).number(toNumber(items.critical_care_medicine_support_qty || 0)).style(right);

      ws.cell(row, 14).number(toNumber((items.nurse_qty || 0) + (items.nurse_support_qty) || 0)).style(right);
      ws.cell(row, 15).number(toNumber(items.nurse_qty || 0)).style(right);
      ws.cell(row, 16).number(toNumber(items.nurse_support_qty || 0)).style(right);

      ws.cell(row, 17).string(toString(items['sub_ministry_name']));
      ws.cell(row++, 18).string(toString(items['update_date']));
    }

    ws.cell(row, 1).string('รวม');
    ws.cell(row, 2).number(toNumber((sumBy(rs, 'anesthetist_nurse_qty') || 0) + (sumBy(rs, 'anesthetist_nurse_support_qty')) || 0)).style(right);
    ws.cell(row, 3).number(toNumber(sumBy(rs, 'anesthetist_nurse_qty') || 0)).style(right);
    ws.cell(row, 4).number(toNumber(sumBy(rs, 'anesthetist_nurse_support_qty') || 0)).style(right);

    ws.cell(row, 5).number(toNumber((sumBy(rs, 'infectious_disease_nurse_qty') || 0) + (sumBy(rs, 'infectious_disease_nurse_support_qty')) || 0)).style(right);
    ws.cell(row, 6).number(toNumber(sumBy(rs, 'infectious_disease_nurse_qty') || 0)).style(right);
    ws.cell(row, 7).number(toNumber(sumBy(rs, 'infectious_disease_nurse_support_qty') || 0)).style(right);

    ws.cell(row, 8).number(toNumber((sumBy(rs, 'intensive_care_unit_qty') || 0) + (sumBy(rs, 'intensive_care_unit_support_qty')) || 0)).style(right);
    ws.cell(row, 9).number(toNumber(sumBy(rs, 'intensive_care_unit_qty') || 0)).style(right);
    ws.cell(row, 10).number(toNumber(sumBy(rs, 'intensive_care_unit_support_qty') || 0)).style(right);

    ws.cell(row, 11).number(toNumber((sumBy(rs, 'critical_care_medicine_qty') || 0) + (sumBy(rs, 'critical_care_medicine_support_qty')) || 0)).style(right);
    ws.cell(row, 12).number(toNumber(sumBy(rs, 'critical_care_medicine_qty') || 0)).style(right);
    ws.cell(row, 13).number(toNumber(sumBy(rs, 'critical_care_medicine_support_qty') || 0)).style(right);

    ws.cell(row, 14).number(toNumber((sumBy(rs, 'nurse_qty') || 0) + (sumBy(rs, 'nurse_support_qty')) || 0)).style(right);
    ws.cell(row, 15).number(toNumber(sumBy(rs, 'nurse_qty') || 0)).style(right);
    ws.cell(row, 16).number(toNumber(sumBy(rs, 'nurse_support_qty') || 0)).style(right);

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `report10` + moment().format('x');
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
  const db = req.dbReport;
  const sector = req.query.sector;
  try {
    const rs: any = await model.homework(db, sector);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {

    res.send({ ok: false, error: error });
  }
});

router.get('/report-homework/excel', async (req: Request, res: Response) => {
  const db = req.dbReport;
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

function toNumber(value) {
  if (value || value == 0) {
    return +value;
  } else {
    return 0;
  }
}

export default router;