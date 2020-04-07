import * as express from 'express';
import { Router, Request, Response } from 'express';
import { Jwt } from '../models/jwt';

import * as HttpStatus from 'http-status-codes';
import { Login } from '../models/login'
import { ThpdModel } from '../models/thpd';
const jwt = new Jwt();

const model = new Login();
const router: Router = Router();
const thpdModel = new ThpdModel();
router.get('/', (req: Request, res: Response) => {
  res.send({ ok: true, message: 'Welcome to RESTful api server!', code: HttpStatus.OK });
});

router.get('/version', (req: Request, res: Response) => {
  res.send({ ok: true, message: '1.0.0', code: HttpStatus.OK });
});

router.post('/order_sync', async (req: Request, res: Response) => {
  try {
    const db = req.db
    const obj: any = {};
    obj.text = JSON.stringify(req.body);
    obj.con_no = req.body.con_no || null;
    obj.status = req.body.status || null;
    obj.status_name = req.body.status_name || null;
    obj.status_name_th = req.body.status_name_th || null;
    obj.tracking = req.body.tracking || null;
    obj.updated = req.body.updated || null;
    obj.detail = req.body.detail || null;
    await thpdModel.logThpd(db, obj);
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error });
  }
});


// router.get('/gen-token', async (req: Request, res: Response) => {

//   try {
//     let payload = {
//       fullname: 'admin',
//       username: 'admin',
//       user_id: 1,
//       type: 'admin'
//     }

//     let token = jwt.signApiKey(payload);
//     res.send({ ok: true, token: token, code: HttpStatus.OK });
//   } catch (error) {
//     res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
//   }

// });

export default router;