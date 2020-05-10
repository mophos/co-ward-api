// / <reference path="../../typings.d.ts" />
import { map } from 'lodash';
import * as HttpStatus from 'http-status-codes';
import { Router, Request, Response } from 'express';

import { NodeSurgicalModel } from '../../models/node-surgical';

const model = new NodeSurgicalModel();
const router: Router = Router();


router.get('/get-hopsnode-surgical', async (req: Request, res: Response) => {
  let query = req.query.query;

  try {
    let rs: any = await model.getListNode(req.db, query);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/get-hopsnode-surgical-detail', async (req: Request, res: Response) => {
  let id = req.query.id;

  try {
    let rs: any = await model.getListNodeDetails(req.db, id);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/save-detail', async (req: Request, res: Response) => {
  const db = req.db;
  const addHops = req.query.addHops;
  const nodeId = req.query.nodeId;

  try {
    let rs: any = await model.getHospId(db, addHops)
    if (rs.length) {
      const hospId = rs[0].id
      let _rs: any = await model.getOldNode(db, hospId)
      if (_rs.length) {
        const oldNodeId = _rs[0].node_id
        const id = _rs[0].id
        const dataLog = {
          hospital_id: hospId,
          node_id_new: nodeId,
          node_id_old: oldNodeId
        }
        const data = {
          node_id: nodeId,
          hospital_id: hospId
        }
        await model.removeDetails(db, id)
        await model.insertDetailsLog(db, dataLog)
        await model.insertDetails(db, data)
      } else {
        const data = {
          node_id: nodeId,
          hospital_id: hospId
        }
        await model.insertDetails(db, data)
      }
      res.send({ ok: true, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, message: 'ไม่พบ รหัสรพ.', code: HttpStatus.OK });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});


export default router;