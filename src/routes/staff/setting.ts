// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import { Router, Request, Response } from 'express';

import { BedModel } from '../../models/setting';

const model = new BedModel();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  const db = req.db;
  const hospcode = req.decoded.hospcode;
  try {
    const rs = await model.info(db, hospcode);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const db = req.db;
  const data = req.body.data;
  const hospcode = req.decoded.hospcode;
  try {
    const rs = await model.update(db, data[0], hospcode);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);

    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/autocomplete/tambon', async (req: Request, res: Response) => {
  const db = req.db;
  const query = req.query.q;
  try {
    const rs = await model.autocompleteTambon(db, query);
    if (rs[0].length) {
      res.send(rs[0]);
    } else {
      res.send([]);
    }
  } catch (error) {
    res.send([]);
  }
});

router.get('/autocomplete/ampur', async (req: Request, res: Response) => {
  const db = req.db;
  const query = req.query.q;
  try {
    const rs = await model.autocompleteAmpur(db, query);
    if (rs[0].length) {
      res.send(rs[0]);
    } else {
      res.send([]);
    }
  } catch (error) {
    res.send([]);
  }
});

router.get('/autocomplete/province', async (req: Request, res: Response) => {
  const db = req.db;
  const query = req.query.q;
  try {
    const rs = await model.autocompleteProvince(db, query);
    if (rs.length) {
      res.send(rs);
    } else {
      res.send([]);
    }
  } catch (error) {
    res.send([]);
  }
});

router.get('/autocomplete/zipcode', async (req: Request, res: Response) => {
  const db = req.db;
  const query = req.query.q;
  try {
    const rs = await model.autocompleteZipcode(db, query);
    if (rs.length) {
      res.send(rs);
    } else {
      res.send([]);
    }
  } catch (error) {
    res.send([]);
  }
});

// router.get('/autocomplete/zipcode', async (req: Request, res: Response) => {
//   const db = req.db;
//   const query = req.query.q;
//   const length = req.query.length || 1;
//   try {
//     if (query.length >= length) {
//       const rs = await model.autocompleteZipcode(db, query);
//       if (rs.length) {
//         res.send(rs);
//       } else {
//         res.send([]);
//       }
//     } else {
//       res.send([]);
//     }
//   } catch (error) {
//     res.send([]);
//   }
// });

export default router;