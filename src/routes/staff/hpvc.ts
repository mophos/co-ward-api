// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
import * as moment from "moment"
import { Router, Request, Response } from 'express';

import { HpvcModel } from '../../models/hpvc';

import { map } from 'lodash';
const model = new HpvcModel();
const router: Router = Router();
const request = require("request");

router.get('/', async (req: Request, res: Response) => {
  try {
    const personId = req.query.personId;
    let rs: any = await model.getList(req.db, personId);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/products', async (req: Request, res: Response) => {
  try {
    let rs: any = await model.getProduct(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.decoded.id;
    const personId = req.body.personId;
    const hpvcId = req.body.hpvcId;
    const drugId = req.body.drugId;
    console.log(userId,personId,hpvcId,drugId);
    
    const rs: any = await model.saveHpvc(req.db, { created_by: userId, person_id: personId });
    const hpvc = map(hpvcId, (v: any)=> {
      return {
        p_hpvc_id: rs[0],
        hpvc_id: v
      }
    })
    const drug = map(drugId, (v: any)=> {
      return {
        p_hpvc_id: rs[0],
        drug_id: v
      }
    })
    console.log(drug);
    
    await model.saveHpvcDetail(req.db, hpvc);
    await model.saveHpvcDrugDetail(req.db, drug);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }

  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      let id = req.params.id
      await model.deleteHpvcDrugDetail(req.db, id);
      await model.deleteHpvcDetail(req.db, id);
      await model.deleteHpvc(req.db, id);
      res.send({ ok: true, code: HttpStatus.OK });
    } catch (error) {
      res.send({ ok: false, error: error.message, code: HttpStatus.OK });
    }
  });
});



export default router;