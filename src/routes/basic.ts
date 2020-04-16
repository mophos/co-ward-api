import { BasicModel } from '../models/basic';
/// <reference path="../../typings.d.ts" />
import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import { SerialModel } from '../models/serial';

const model = new BasicModel();


const router: Router = Router();

router.get('/title', async (req: Request, res: Response) => {
  try {
    let rs: any = await model.getTitles(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/hospital', async (req: Request, res: Response) => {
  try {
    let rs: any = await model.getHospitalReq(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/position', async (req: Request, res: Response) => {
  try {
    let rs: any = await model.getPositions(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/generics', async (req: Request, res: Response) => {
  try {
    let rs: any = await model.getGenerics(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/autocomplete/tambon', async (req: Request, res: Response) => {
  const db = req.db;
  const query = req.query.q;
  const length = req.query.length || 2;
  try {
    if (query.length >= length) {
      const rs = await model.autocompleteTambon(db, query);
      if (rs[0].length) {
        res.send(rs[0]);
      } else {
        res.send([]);
      }
    }
  } catch (error) {
    res.send([]);
  }

});

router.get('/autocomplete/ampur', async (req: Request, res: Response) => {
  const db = req.db;
  const query = req.query.q;
  const length = req.query.length || 2;
  try {
    if (query.length >= length) {
      const rs = await model.autocompleteAmpur(db, query);
      if (rs[0].length) {
        res.send(rs[0]);
      } else {
        res.send([]);
      }
    }
  } catch (error) {
    res.send([]);
  }

});

router.get('/autocomplete/province', async (req: Request, res: Response) => {
  const db = req.db;
  const query = req.query.q;
  const length = req.query.length || 2;
  try {
    if (query.length >= length) {
      const rs = await model.autocompleteProvince(db, query);
      if (rs.length) {
        res.send(rs);
      } else {
        res.send([]);
      }
    }
  } catch (error) {
    res.send([]);
  }

});

router.get('/autocomplete/zipcode', async (req: Request, res: Response) => {
  const db = req.db;
  const query = req.query.q;
  const length = req.query.length || 3;
  try {
    if (query.length >= length) {
      const rs = await model.autocompleteZipcode(db, query);
      if (rs.length) {
        res.send(rs);
      } else {
        res.send([]);
      }
    }
  } catch (error) {
    res.send([]);
  }

});

router.get('/hospcode/autocomplete/search', async (req: Request, res: Response) => {
  const db = req.db;
  const query = req.query.q;
  const length = req.query.length || 2;
  try {
    if (query.length >= length) {
      const rs = await model.autocompleteHospital(db, query);
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

router.get('/countries/autocomplete/search', async (req: Request, res: Response) => {
  const db = req.db;
  const query = req.query.q;
  const length = req.query.length || 2;
  try {
    if (query.length >= length) {
      const rs = await model.autocompleteCountry(db, query);
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

export default router;