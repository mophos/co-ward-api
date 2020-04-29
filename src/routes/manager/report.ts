// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
import { Router, Request, Response } from 'express';
import { ManagerReportModel } from '../../models/manager-report';

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

  try {
    const rs: any = await model.report2(db, date);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report2/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;

  try {
    const rs: any = await model.report2(db, date);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report3/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;
  try {
    const rs: any = await model.report3(db, date);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report4/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;

  try {
    const rs: any = await model.report2(db, date);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report5/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;

  try {
    const rs: any = await model.report2(db, date);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report6/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;

  try {
    const rs: any = await model.report2(db, date);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report7/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;

  try {
    const rs: any = await model.report2(db, date);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report8/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;

  try {
    const rs: any = await model.report2(db, date);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report9/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;

  try {
    const rs: any = await model.report2(db, date);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

router.get('/report10/excel', async (req: Request, res: Response) => {
  const db = req.db;
  const date = req.query.date;

  try {
    const rs: any = await model.report2(db, date);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {

    res.send({ ok: false, code: HttpStatus.OK });
  }
});

export default router;