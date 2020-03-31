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

// upload files
import * as path from 'path';
import * as fse from 'fs-extra';
import * as multer from 'multer';
const uuidv4 = require('uuid/v4');

const uploadDir = process.env.UPLOAD_DIR || './upload/register';

fse.ensureDirSync(uploadDir);

var storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    let _ext = path.extname(req.data.cid);
    cb(null, _ext)
  }
});

let upload = multer({ storage: storage });


router.get('/hopscode', async (req: Request, res: Response) => {

  let hopsCode = req.query.hopsCode

  try {
    let rs: any = await registerModel.getHospCode(req.db, hopsCode);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/hospcode/autocomplete/search', async (req: Request, res: Response) => {
  const db = req.db;
  const query = req.query.q;
  const length = req.query.length || 1;
  try {
    if (query.length >= length) {
      const rs = await registerModel.autocompleteHospital(db, query);
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

router.post('/register', upload.any(), async (req: Request, res: Response) => {

  let data = req.body.data;
  let picture = req.files
  try {

    if (('username' in data) && ('password' in data) && ('hospcode' in data) && ('prename' in data)
      && ('fname' in data) && ('lname' in data) && ('position' in data) && ('email' in data) && ('type' in data)
      && ('isProvince' in data) && ('telephone' in data) && picture.length) {
      let _data = {
        username: data.username,
        password: data.password,
        hospcode: data.hospcode,
        prename: data.prename,
        fname: data.fname,
        lname: data.lname,
        position: data.position,
        email: data.email,
        type: data.type,
        is_province: data.isProvince,
        telephone: data.telephone,
      }
      let rs: any = await registerModel.insertUser(req.db, _data);
      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: 'ข้อมูลไม่ครบ', code: HttpStatus.OK });

    }
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/title', async (req: Request, res: Response) => {

  try {
    let rs: any = await registerModel.getTitles(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/position', async (req: Request, res: Response) => {

  try {
    let rs: any = await registerModel.getPositions(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


export default router;