// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
import { Router, Request, Response } from 'express';
import { ManagerReportModel } from '../../models/manager-report';
import { sumBy } from 'lodash';
const excel4node = require('excel4node');
const path = require('path')
const fse = require('fs-extra');
import moment = require('moment');
const model = new ManagerReportModel();
const router: Router = Router();

router.get('/report1', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;

  try {
    const rs: any = await model.report2(db, date);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {

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
    const rs: any = await model.report2(db, date);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
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

router.get('/report2/excel', async (req: Request, res: Response) => {
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

router.get('/report3/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  var wb = new excel4node.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  try {
    const rs: any = await model.report3(db, date);
    ws.cell(1, 2, 1, 1).string('โรงพยาบาล');
    ws.cell(1, 1, 2, 5).string('อาการรุนแรง\n(Severe Case)');
    ws.cell(2, 2).string('อาการรุนแรง\n(Severe Case)');
    ws.cell(2, 3).string('อาการรุนแรงปานกลาง\n(Moderate Case)');
    ws.cell(2, 4).string('อาการไม่รุนแรง\n(Mild Case)');
    ws.cell(2, 5).string('ผู้ป่วยผลบวกไม่มีอาการ\n(Asymptomatic)');
    ws.cell(1, 2, 6, 6).string('ผู้ป่วยเข้าเกณฑ์สงสัย PUI');
    ws.cell(1, 2, 7, 7).string('หน่วยงาน');

    ws.cell(3, 1).string('รวม');
    ws.cell(3, 2).string(sumBy('severe'));
    ws.cell(3, 3).string(sumBy('moderate'));
    ws.cell(3, 4).string(sumBy('mild'));
    ws.cell(3, 5).string(sumBy('asymptomatic'));
    ws.cell(3, 6).string(sumBy('ip_pui'));
    ws.cell(3, 7).string(sumBy(''));
    let row = 3;
    // let col = 1;
    for (const items of rs) {
      ws.cell(row, 1).string(items['hospname']);
      ws.cell(row, 2).string(items['severe']);
      ws.cell(row, 3).string(items['moderate']);
      ws.cell(row, 4).string(items['mild']);
      ws.cell(row, 5).string(items['asymptomatic']);
      ws.cell(row, 6).string(items['ip_pui']);
      ws.cell(row++, 7).string(items['hosp_sub_min_name']);
    }
    ws.cell(row, 1).string('รวม');
    ws.cell(row, 2).string(sumBy('severe'));
    ws.cell(row, 3).string(sumBy('moderate'));
    ws.cell(row, 4).string(sumBy('mild'));
    ws.cell(row, 5).string(sumBy('asymptomatic'));
    ws.cell(row, 6).string(sumBy('ip_pui'));
    ws.cell(row, 7).string(sumBy(''));

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

export default router;