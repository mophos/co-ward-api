// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import * as moment from "moment"
import { Router, Request, Response } from 'express';

import { HospitalModel } from '../../models/hospital';
import Knex = require('knex');

const hospitalModel = new HospitalModel();
const router: Router = Router();


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

router.get('/:hospcode/hospcode', async (req: Request, res: Response) => {
  const hospcode = req.params.hospcode

  try {
    let rs: any = await hospitalModel.getHospitalByHospCode(req.db, hospcode);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
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
  const userId = req.decoded.id || 0;

  try {
    const zone: any = await hospitalModel.getZone(req.db, data.province_code);
    data.zone_code = zone[0].zone_code;
    if (typeof id === 'number' && typeof data === 'object' && id && data) {
      const dupCode: any = await hospitalModel.checkHospCode(req.db, data.hospcode)
      if (dupCode.length == 0 && data.hospcode.length === 5) {
        let rs: any = await hospitalModel.updateHospital(req.db, id, data, userId);
        res.send({ ok: true, rows: rs, code: HttpStatus.OK });
      } else {
        if (dupCode[0].id == id) {
          let rs: any = await hospitalModel.updateHospital(req.db, id, data, userId);
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

const generateHospCode = async (db: Knex, hospType: string, zoneCode: any) => {
  // const allHospitals = await hospitalModel.getNextInsertId(db)
  // const currentId = allHospitals[0]?.id || 0
  const count = await hospitalModel.getHospitalCounter(db, hospType.toLowerCase()) || 0
  const currentId = (count + 1).toString().padStart(5, '0')

  const typeCodes = {
    'FIELD': 'F',
    'HOSPITEL': 'H',
    'CI': 'C'
  }

  const typeCode = typeCodes[hospType] || ''

  return `${typeCode}${zoneCode}${currentId}`
}

router.post('/', async (req: Request, res: Response) => {
  const data: any = req.body.data || {}
  const decoded = req.decoded;
  try {
    if (typeof data === 'object' && data) {
      const zone = await hospitalModel.getZone(req.db, data.province_code);
      data.zone_code = zone[0].zone_code;
      data.hospcode = data.hospital_type !== 'HOSPITAL'
      ? await generateHospCode(req.db, data.hospital_type, data.zone_code)
      : data.hospcode

      const dupCode: any = await hospitalModel.checkHospCode(req.db, data.hospcode)
      data.created_by = decoded.id || 0;
      data.update_date = moment().format('YYYY-MM-DD HH:mm:ss')

      if (dupCode.length == 0) {
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
    const userId = req.decoded.id || 0;

    let rs: any = await hospitalModel.deleteHospital(req.db, id, userId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


router.get('/type', async (req: Request, res: Response) => {
  try {
    let rs: any = await hospitalModel.getHospitalType(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/ministry-type', async (req: Request, res: Response) => {
  try {
    let rs: any = await hospitalModel.getMinistryType(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/ministry', async (req: Request, res: Response) => {
  try {
    let rs: any = await hospitalModel.getMinistry(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


router.get('/sub-ministry', async (req: Request, res: Response) => {
  try {
    let rs: any = await hospitalModel.getSubMinistry(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});



export default router;
