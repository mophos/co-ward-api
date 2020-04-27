// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';

import { Router, Request, Response } from 'express';
import { smhModel } from '../../models/smh';

const model = new smhModel();
const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
  const db = req.db;
  const cid = req.query.cid;
  try {
    const data: any = {};
    const rs: any = await model.apiLogin();
    const lab: any = await model.getLabCovid(cid, rs.token);
    if (lab.ok) {
      data.tname = lab.res[0].title_name;
      data.fname = lab.res[0].first_name;
      data.lname = lab.res[0].last_name;
    } else {
      const rs: any = await model.getPerson(db, cid);
      data.tname = rs[0].title_name;
      data.fname = rs[0].first_name;
      data.lname = rs[0].last_name;
    }

    res.send({ ok: true, rows: data, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});
export default router;