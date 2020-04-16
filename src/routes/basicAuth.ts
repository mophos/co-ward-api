import { BasicModel } from '../models/basic';
/// <reference path="../../typings.d.ts" />
import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import { SerialModel } from '../models/serial';

const model = new BasicModel();


const router: Router = Router();

router.get('/hospcode-requisition/autocomplete/search', async (req: Request, res: Response) => {
  const db = req.db;
  const query = req.query.q;
  const length = req.query.length || 1;
  const hospcode = req.decoded.hospcode

  try {
    if (query.length >= length) {
      const rs = await model.autocompleteHospitalRequisition(db, query, hospcode);
      if (rs.length) {
        res.send(rs);
      } else {
        res.send([]);
      }
    } else {
      res.send([]);
    }
  } catch (error) {
    res.send([]);
  }
});

router.get('/gcs', async (req: Request, res: Response) => {
  const db = req.db;
  try {
    const rs = await model.getGCS(db);
    res.send({ ok: true, rows: rs })
  } catch (error) {
    res.send({ ok: false, error: error });
  }
});

router.get('/beds', async (req: Request, res: Response) => {
  const db = req.db;
  const hospitalId = req.decoded.hospitalId;
  try {
    const rs = await model.getBeds(db, hospitalId);
    res.send({ ok: true, rows: rs })
  } catch (error) {
    res.send({ ok: false, error: error });
  }
});

router.get('/medical-supplies', async (req: Request, res: Response) => {
  const db = req.db;
  try {
    const rs = await model.getMedicalSupplies(db);
    res.send({ ok: true, rows: rs })
  } catch (error) {
    res.send({ ok: false, error: error });
  }
});

router.get('/generic-set', async (req: Request, res: Response) => {
  const db = req.db;
  const type = req.query.type;
  try {
    const head = await model.getGenericSet(db, type);

    for (const h of head) {
      const detail = await model.getGenericSetDetails(db, h.id);
      for (const d of detail) {
        const items = await model.getGenericSetDetailItems(db, d.id);
        d.items = items;
      }
      h.detail = detail;
    }
    res.send({ ok: true, rows: head })
  } catch (error) {
    res.send({ ok: false, error: error });
  }
});


export default router;