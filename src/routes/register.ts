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

const uploadDir = process.env.UPLOAD_DIR + '/register' || './uploads/register';

fse.ensureDirSync(uploadDir);

var storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, uploadDir)
  },
  filename: function (req , file, cb) {
    console.log(file.originalname);
    cb(null,file.originalname)
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
    console.log(data.toString());
    
    if (('username' in data) && ('password' in data) && ('hospcode' in data) && ('titleId' in data)
      && ('fname' in data) && ('cid' in data) && ('lname' in data) && ('positionId' in data) && ('email' in data) && ('type' in data)
      && ('isProvince' in data) && ('telephone' in data) && picture.length) {
      let _data = {
        username: data.username,
        password: crypto.createHash('md5').update(data.password).digest('hex'),
        hospcode: data.hospCode,
        title_id: data.titleId,
        cid: data.cid,
        fname: data.firstName,
        lname: data.lastName,
        position_id: data.positionId,
        email: data.email,
        type: data.type,
        telephone: data.phoneNumber,
        is_province: data.isProvince
      }
      await registerModel.insertUser(req.db, _data);
      res.send({ ok: true, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: 'ข้อมูลไม่ครบ', code: HttpStatus.OK });
    }
  } catch (error) {
    console.log(error.errno);
    if (error.errno === 1062) {
      res.send({ ok: false, error: 'username นี้ถูกใช้งานแล้ว', code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: error.message, code: HttpStatus.OK });
    }
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