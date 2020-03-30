/// <reference path="../../typings.d.ts" />

import * as express from 'express';
import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import * as crypto from 'crypto';

import { Register } from '../models/register';

import { Jwt } from '../models/jwt';

const registerModel = new Register();
const jwt = new Jwt();

const router: Router = Router();

router.get('/hopscode', async (req: Request, res: Response) => {

  let hopsCode = req.query.hopsCode

  try {
    let rs: any = await registerModel.getHopsCode(req.db, hopsCode);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;