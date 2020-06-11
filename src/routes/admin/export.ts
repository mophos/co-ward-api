// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
import { Router, Request, Response } from 'express';
import { ExportModel } from '../../models/export';
import { filter } from 'lodash';

import * as moment from "moment"
import * as path from 'path';

const fse = require('fs-extra');
const xl = require('excel4node');
const model = new ExportModel();
const router: Router = Router();

router.get('/requisition', async (req: Request, res: Response) => {
  const db = req.db;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  var wb = new xl.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  try {
    const rs: any = await model.exportAll(db, startDate, endDate);
    // const rsReq: any = await model.getRequisitionQty(db, startDate, endDate);
    // const rsPuiDay: any = await model.getPUIday(db, startDate, endDate);
    // const rsPuiPerson: any = await model.getPUIperson(db, startDate, endDate);
    // const rsConfirm: any = await model.getConfirmPerson(db, startDate, endDate);

    const center = wb.createStyle({
      alignment: {
        wrapText: true,
        horizontal: 'center',
      },
    });

    ws.cell(1, 1).string('รหัสโรงพยาบาล').style(center);
    ws.cell(1, 2).string('ชื่อโรงพยาบาล').style(center);
    ws.cell(1, 3).string('จังหวัด').style(center);
    ws.cell(1, 4).string('เขต').style(center);

    ws.cell(1, 5).string('PUI(ราย)').style(center);
    ws.cell(1, 6).string('PUI(วัน)').style(center);
    ws.cell(1, 7).string('Confirm(ราย)').style(center);
    ws.cell(1, 8).string('Severe(วัน)').style(center);
    ws.cell(1, 9).string('Mod(วัน)').style(center);
    ws.cell(1, 10).string('Mild(วัน)').style(center);
    ws.cell(1, 11).string('Asym(วัน)').style(center);

    ws.cell(1, 12).string('Surgical Gown').style(center);
    ws.cell(1, 13).string('CoverAll1').style(center);
    ws.cell(1, 14).string('CoverAll2').style(center);
    ws.cell(1, 15).string('n95').style(center);
    ws.cell(1, 16).string('Shoe Cover').style(center);
    ws.cell(1, 17).string('Surgical Hood').style(center);

    let row = 2;
    for (const v of rs[0]) {
      // const puiDay = filter(rsPuiDay[0], { 'hospital_id_node': v.hospital_id_node });
      // const puiPerson = filter(rsPuiPerson[0], { 'hospital_id_node': v.hospital_id_node });
      // const cPerson = filter(rsConfirm[0], { 'hospital_id_node': v.hospital_id_node });

      ws.cell(row, 1).string(v.hospcode);
      ws.cell(row, 2).string(v.hospname);
      ws.cell(row, 3).string(v.province_name);
      ws.cell(row, 4).number(toNumber(+v.zone_code));

      ws.cell(row, 5).number(toNumber(+v.pui_person));
      ws.cell(row, 6).number(toNumber(+v.pui_day));
      ws.cell(row, 7).number(toNumber(+v.confirm_qty));
      ws.cell(row, 8).number(toNumber(+v.severe_day));
      ws.cell(row, 9).number(toNumber(+v.mod_day));
      ws.cell(row, 10).number(toNumber(+v.mild_day));
      ws.cell(row, 11).number(toNumber(+v.asym_day));

      ws.cell(row, 12).number(toNumber(v.surgical_gown));
      ws.cell(row, 13).number(toNumber(v.cover_all1));
      ws.cell(row, 14).number(toNumber(v.cover_all2));
      ws.cell(row, 15).number(toNumber(v.n95));
      ws.cell(row, 16).number(toNumber(v.shoe_cover));
      ws.cell(row++, 17).number(toNumber(v.surgical_hood));
    }

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = `requisition` + moment().format('x');
    let filenamePath = path.join(process.env.TMP_PATH, filename + '.xlsx');

    wb.write(filenamePath, function (err, stats) {
      if (err) {
        console.error(err);
        fse.removeSync(filenamePath);
        res.send({ ok: false, error: err })
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + filename);
        res.sendfile(filenamePath, (v) => {
          fse.removeSync(filenamePath);
        })
      }
    });
    // res.send({ ok: true, rows: [], code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

function toString(value) {
  if (value || value == 0) {
    return value.toString();
  } else {
    return '';
  }
}

function toNumber(value) {
  if (value || value == 0) {
    return +value;
  } else {
    return 0;
  }
}

export default router;