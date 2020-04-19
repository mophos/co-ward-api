import * as express from 'express';
import { Router, Request, Response } from 'express';
import { Jwt } from '../models/jwt';

import * as HttpStatus from 'http-status-codes';
import { Login } from '../models/login'
import { ThpdModel } from '../models/thpd';
import { BasicModel } from '../models/basic';
const jwt = new Jwt();
const basicModel = new BasicModel();
import * as moment from 'moment';
const model = new Login();
const router: Router = Router();
const thpdModel = new ThpdModel();
router.get('/', (req: Request, res: Response) => {
  res.send({ ok: true, message: 'Welcome to RESTful api server!', code: HttpStatus.OK });
});

router.get('/version', (req: Request, res: Response) => {
  res.send({ ok: true, message: '1.1.0', code: HttpStatus.OK });
});

router.get('/demo', (req: Request, res: Response) => {
  if (process.env.DEMO == 'Y') {
    res.send({ ok: true });
  } else {
    res.send({ ok: false });
  }
});


router.get('/date', (req: Request, res: Response) => {
  res.send({ ok: true, rows: moment().format('YYYY-MM-DD HH:mm:ss'), code: HttpStatus.OK });
});

router.get('/date-time-cut', async (req: Request, res: Response) => {
  const timeCut: any = await basicModel.timeCut();
  if (timeCut.ok) {
    res.send({ ok: true, rows: moment().format('YYYY-MM-DD HH:mm:ss'), code: HttpStatus.OK });
  } else {
    res.send({ ok: true, rows: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss'), code: HttpStatus.OK });
  }
});

router.get('/time-cut', async (req: Request, res: Response) => {
  try {
    const timeCut = await basicModel.timeCut();
    res.send(timeCut);
  } catch (error) {
    res.send({ ok: false, error: error });
  }
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

router.get('/status', async (req: Request, res: Response) => {
  try {
    const db = req.db
    const rs: any = await thpdModel.getPay(db);
    for (const i of rs) {
      const obj = {
        con_no: i.co_no
      }
      const result: any = await thpdModel.getOrder(obj);
      const _result = result.body
      if (_result.success) {
        const data = {
          status_code: _result.data.status,
          status_name: _result.data.status_name,
          status_name_th: _result.data.status_name_th,
          status_update: moment(_result.data.update, 'X').format('YYYY-MM-DD HH:mm:ss'),
          tracking: _result.data.tracking
        }
        await thpdModel.updatePay(db, i.id, data);
        console.log(data);
      }

    }
    // console.log(rs);

    // await thpdModel.logThpd(db, obj);
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error });
  }
});




export default router;