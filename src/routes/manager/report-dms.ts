// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
import { Router, Request, Response } from 'express';
import { ReportDmsModel } from '../../models/report-dms';
const excel4node = require('excel4node');
const path = require('path')
const fse = require('fs-extra');
import moment = require('moment');

const model = new ReportDmsModel();
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
    res.send({ ok: false, code: HttpStatus.OK });
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