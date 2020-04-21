// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import * as moment from "moment"
import { Router, Request, Response } from 'express';

import { HospitalModel } from '../../models/hospital';

const hospitalModel = new HospitalModel();
const router: Router = Router();


router.get('/types', async (req: Request, res: Response) => {
  try {
    let rs: any = await hospitalModel.getHospTypes(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/', async (req: Request, res: Response) => {
  const hosptypeId = req.query.hosptype_id || undefined;
  const query = req.query.query || '';
  const limit = req.query.limit || 100;
  const offset = req.query.offset || 0;
  try {
    let rs: any = await hospitalModel.getHospByType(req.db, +offset, +limit, query, hosptypeId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/total', async (req: Request, res: Response) => {
  const hosptypeId = req.query.hosptype_id || undefined;
  const query = req.query.query || '';
  try {
    let rs: any = await hospitalModel.getHospByTypeTotal(req.db, query, hosptypeId);
    res.send({ ok: true, rows: rs[0].count, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const id: any = +req.params.id
  const data: any = req.body.data

  try {
    if (typeof id === 'number' && typeof data === 'object' && id && data) {

      const dupCode: any = await hospitalModel.checkHospCode(req.db, data.hospcode)
      if (dupCode.length == 0 && data.hospcode.length === 5) {
        let rs: any = await hospitalModel.updateHospital(req.db, id, data);
        res.send({ ok: true, rows: rs, code: HttpStatus.OK });
      } else {
        if (dupCode[0].id == id) {
          
          let rs: any = await hospitalModel.updateHospital(req.db, id, data);
          res.send({ ok: true, rows: rs, code: HttpStatus.OK });
        } else {
          res.send({ ok: false, error: 'รหัสสถานบริการไม่ถูกต้อง หรือ ซ้ำ', code: HttpStatus.OK });
        }
      }

    } else {
      res.send({ ok: false, error: 'ข้อมูลไม่ครบ', code: HttpStatus.OK });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const data: any = req.body.data || {}
  try {
    if (typeof data === 'object' && data) {
      const dupCode: any = await hospitalModel.checkHospCode(req.db, data.hospcode)
      if (dupCode.length == 0 && data.hospcode.length === 5) {
        let rs: any = await hospitalModel.insertHospital(req.db, data);
        res.send({ ok: true, rows: rs, code: HttpStatus.OK });
      } else {
        res.send({ ok: false, error: 'รหัสสถานบริการไม่ถูกต้อง หรือ ซ้ำ', code: HttpStatus.OK });
      }
    } else {
      res.send({ ok: false, error: 'ข้อมูลไม่ครบ', code: HttpStatus.OK });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = req.params.id
  try {
    let rs: any = await hospitalModel.deleteHospital(req.db, id);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;
