// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
import { Router, Request, Response } from 'express';
import { ManagerReportModel } from '../../models/manager-report';

const model = new ManagerReportModel();
const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
  res.send({ ok: true, code: HttpStatus.OK });
});

export default router;