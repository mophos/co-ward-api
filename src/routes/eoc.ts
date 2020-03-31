/// <reference path="../../typings.d.ts" />
import * as _ from 'lodash';
import * as express from 'express';
import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';

import { EocModel } from '../models/eoc';

const router: Router = Router();
const eocModel = new EocModel();
router.get('/beds', async (req: Request, res: Response) => {
    const date = req.query.date;
    let db = req.dbEOC;
    try {
        // eoc.agency_code', 'eoc.hospname', 'eoc.AIIRUsed', 'eoc.AIIRUsed', 'eoc.ModifiedAIIR', 'eoc.ModifiedAIIRUsed', 'eoc.IsolationRoom', 'eoc.IsolationRoomUsed', 'eoc.cohortWard', 'eoc.cohortWardUsed',
        // 'ch.zone_code',
        // 'ch.province_code',
        // 'ch.province_name',
        // 'eoc.resource_entrydate
        const rs: any = await eocModel.beds(db, date);
        const data = [];
        const zoneCode = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];
        for (let i = 0; i < 13; i++) {
          const detail = _.filter(rs, { zone_code: zoneCode[i] });
          const provinces = _.map(detail, 'province_code');
          const province = _.uniqBy(provinces);
          const province_ = [];
          for (const p of province) {
            const _detail = _.filter(detail, { province_code: p });
            province_.push({
              province_code: _detail[0].province_code,
              province_name: _detail[0].province_name,
              hospitals: _detail
            })
            // const obj
          }
          data.push({
            zone_code: i + 1,
            provinces: province_
          });
        }
        res.send({ ok: true, rows: data });
    } catch (error) {
        res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
    }

});

export default router;