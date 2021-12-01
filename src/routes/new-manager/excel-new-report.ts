import * as HttpStatus from 'http-status-codes';
import { Router, Request, Response } from 'express';
import { sumBy, filter } from 'lodash';
import { ReportAllModel } from '../../models/new-report-all';
const excel4node = require('excel4node');
const path = require('path')
const fse = require('fs-extra');
import moment = require('moment');

const model = new ReportAllModel();
const router: Router = Router();

router.get('/patient-report-by-zone', async (req: Request, res: Response) => {
  const db = req.dbReport
  const date = req.query.date
  const sector = req.query.sector

  var wb = new excel4node.Workbook()
  var ws = wb.addWorksheet('Sheet 1')

  var center = wb.createStyle({
    alignment: {
      wrapText: true,
      horizontal: 'center',
    },
  })
  var right = wb.createStyle({
    alignment: {
      wrapText: true,
      horizontal: 'right',
    },
  })

  try {
    const rs: any = await model.patientReportByZone(db, date, sector);

    ws.cell(1,1).string('เขตสุขภาพ').style(center)
    ws.cell(1,2).string('ผู้ป่วยทั้งหมด').style(center)
    ws.cell(1,3).string('Severe').style(center)
    ws.cell(1,4).string('Invasive Ventilator').style(center)
    ws.cell(1,5).string('Non-Invasive Ventilator').style(center)
    ws.cell(1,6).string('High flow').style(center)
    ws.cell(1,7).string('Moderate').style(center)
    ws.cell(1,8).string('Mild').style(center)
    ws.cell(1,9).string('Asymptomatic').style(center)
    ws.cell(1,10).string('Dead').style(center)
    ws.cell(1,11).string('PUI').style(center)

    for (let i = 0; i < rs.length; i++) {
      ws.cell(2 + i, 1).string('รวมเขต ' + rs[i].zone_code)
      ws.cell(2 + i, 2).number(0)
      ws.cell(2 + i, 3).number(0)
      ws.cell(2 + i, 4).number(0)
      ws.cell(2 + i, 5).number(0)
      ws.cell(2 + i, 6).number(0)
      ws.cell(2 + i, 7).number(0)
      ws.cell(2 + i, 8).number(0)
      ws.cell(2 + i, 9).number(0)
      ws.cell(2 + i, 10).number(0)
      ws.cell(2 + i, 11).number(0)
    }

    ws.cell(15, 1).string('รวม 12 เขต')
    ws.cell(15, 2).number(0)
    ws.cell(15, 3).number(0)
    ws.cell(15, 4).number(0)
    ws.cell(15, 5).number(0)
    ws.cell(15, 6).number(0)
    ws.cell(15, 7).number(0)
    ws.cell(15, 8).number(0)
    ws.cell(15, 9).number(0)
    ws.cell(15, 10).number(0)
    ws.cell(15, 11).number(0)

    ws.cell(16, 1).string('ทั่วประเทศ')
    ws.cell(16, 2).number(0)
    ws.cell(16, 3).number(0)
    ws.cell(16, 4).number(0)
    ws.cell(16, 5).number(0)
    ws.cell(16, 6).number(0)
    ws.cell(16, 7).number(0)
    ws.cell(16, 8).number(0)
    ws.cell(16, 9).number(0)
    ws.cell(16, 10).number(0)
    ws.cell(16, 11).number(0)


    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = 'report-patient-by-zone' + moment().format('x');
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
    })
  } catch (error) {
    res.send({ ok: false, error: error });
  }
})

router.get('/patient-report-by-province', async (req: Request, res: Response) => {
  const db = req.dbReport
  const date = req.query.date
  const sector = req.query.sector

  var wb = new excel4node.Workbook()
  var ws = wb.addWorksheet('Sheet 1')

  var center = wb.createStyle({
    alignment: {
      wrapText: true,
      horizontal: 'center',
    },
  })
  var right = wb.createStyle({
    alignment: {
      wrapText: true,
      horizontal: 'right',
    },
  })

  try {
    const rs: any = await model.patientReportByProvince(db, date, sector);
    let row1 = 0
    let rowEnd1 = 0
    let row2 = 0
    let rowEnd2 = 0
    let row3 = 0
    let rowEnd3 = 0
    let row4 = 0
    let rowEnd4 = 0
    let row5 = 0
    let rowEnd5 = 0
    let row6 = 0
    let rowEnd6 = 0
    let row7 = 0
    let rowEnd7 = 0
    let row8 = 0
    let rowEnd8 = 0
    let row9 = 0
    let rowEnd9 = 0
    let row10 = 0
    let rowEnd10 = 0
    let row11 = 0
    let rowEnd11 = 0
    let row12 = 0
    let rowEnd12 = 0

    ws.cell(1,1).string('เขตสุขภาพ').style(center)
    ws.cell(1,2).string('จังหวัด').style(center)
    ws.cell(1,3).string('ผู้ป่วยทั้งหมด').style(center)
    ws.cell(1,4).string('Severe').style(center)
    ws.cell(1,5).string('Invasive Ventilator').style(center)
    ws.cell(1,6).string('Non-Invasive Ventilator').style(center)
    ws.cell(1,7).string('High flow').style(center)
    ws.cell(1,8).string('Moderate').style(center)
    ws.cell(1,9).string('Mild').style(center)
    ws.cell(1,10).string('Asymptomatic').style(center)
    ws.cell(1,11).string('Dead').style(center)
    ws.cell(1,12).string('PUI').style(center)


    const rsZone1 = rs.filter(item => item.zone_code === '01')
    for (let i = 0; i < rsZone1.length; i++) {
      ws.cell(2 + i, 1).string(rsZone1[i].zone_code).style(center)
      ws.cell(2 + i, 2).string(rsZone1[i].province_name)
      ws.cell(2 + i, 3).number(0)
      ws.cell(2 + i, 4).number(0)
      ws.cell(2 + i, 5).number(0)
      ws.cell(2 + i, 6).number(0)
      ws.cell(2 + i, 7).number(0)
      ws.cell(2 + i, 8).number(0)
      ws.cell(2 + i, 9).number(0)
      ws.cell(2 + i, 10).number(0)
      ws.cell(2 + i, 11).number(0)
      ws.cell(2 + i, 12).number(0)
    }
    rowEnd1 = 2 + rsZone1.length
    ws.cell(rowEnd1, 1, rowEnd1, 2, true).string('รวมเขต 1')
    ws.cell(rowEnd1, 3).number(0)
    ws.cell(rowEnd1, 4).number(0)
    ws.cell(rowEnd1, 5).number(0)
    ws.cell(rowEnd1, 6).number(0)
    ws.cell(rowEnd1, 7).number(0)
    ws.cell(rowEnd1, 8).number(0)
    ws.cell(rowEnd1, 9).number(0)
    ws.cell(rowEnd1, 10).number(0)
    ws.cell(rowEnd1, 11).number(0)
    ws.cell(rowEnd1, 12).number(0)

    const rsZone2 = rs.filter(item => item.zone_code === '02')
    row2 = rowEnd1 + 1
    for (let i = 0; i < rsZone2.length; i++) {
      ws.cell(row2 + i, 1).string(rsZone2[i].zone_code).style(center)
      ws.cell(row2 + i, 2).string(rsZone2[i].province_name)
      ws.cell(row2 + i, 3).number(0)
      ws.cell(row2 + i, 4).number(0)
      ws.cell(row2 + i, 5).number(0)
      ws.cell(row2 + i, 6).number(0)
      ws.cell(row2 + i, 7).number(0)
      ws.cell(row2 + i, 8).number(0)
      ws.cell(row2 + i, 9).number(0)
      ws.cell(row2 + i, 10).number(0)
      ws.cell(row2 + i, 11).number(0)
      ws.cell(row2 + i, 12).number(0)
    }
    rowEnd2 = row2 + rsZone2.length
    ws.cell(rowEnd2, 1, rowEnd2, 2, true).string('รวมเขต 2')
    ws.cell(rowEnd2, 3).number(0)
    ws.cell(rowEnd2, 4).number(0)
    ws.cell(rowEnd2, 5).number(0)
    ws.cell(rowEnd2, 6).number(0)
    ws.cell(rowEnd2, 7).number(0)
    ws.cell(rowEnd2, 8).number(0)
    ws.cell(rowEnd2, 9).number(0)
    ws.cell(rowEnd2, 10).number(0)
    ws.cell(rowEnd2, 11).number(0)
    ws.cell(rowEnd2, 12).number(0)

    const rsZone3 = rs.filter(item => item.zone_code === '03')
    row3 = rowEnd2 + 1
    for (let i = 0; i < rsZone3.length; i++) {
      ws.cell(row3 + i, 1).string(rsZone3[i].zone_code).style(center)
      ws.cell(row3 + i, 2).string(rsZone3[i].province_name)
      ws.cell(row3 + i, 3).number(0)
      ws.cell(row3 + i, 4).number(0)
      ws.cell(row3 + i, 5).number(0)
      ws.cell(row3 + i, 6).number(0)
      ws.cell(row3 + i, 7).number(0)
      ws.cell(row3 + i, 8).number(0)
      ws.cell(row3 + i, 9).number(0)
      ws.cell(row3 + i, 10).number(0)
      ws.cell(row3 + i, 11).number(0)
      ws.cell(row3 + i, 12).number(0)
    }
    rowEnd3 = row3 + rsZone3.length
    ws.cell(rowEnd3, 1, rowEnd3, 2, true).string('รวมเขต 3')
    ws.cell(rowEnd3, 3).number(0)
    ws.cell(rowEnd3, 4).number(0)
    ws.cell(rowEnd3, 5).number(0)
    ws.cell(rowEnd3, 6).number(0)
    ws.cell(rowEnd3, 7).number(0)
    ws.cell(rowEnd3, 8).number(0)
    ws.cell(rowEnd3, 9).number(0)
    ws.cell(rowEnd3, 10).number(0)
    ws.cell(rowEnd3, 11).number(0)
    ws.cell(rowEnd3, 12).number(0)

    const rsZone4 = rs.filter(item => item.zone_code === '04')
    row4 = rowEnd3 + 1
    for (let i = 0; i < rsZone4.length; i++) {
      ws.cell(row4 + i, 1).string(rsZone4[i].zone_code).style(center)
      ws.cell(row4 + i, 2).string(rsZone4[i].province_name)
      ws.cell(row4 + i, 3).number(0)
      ws.cell(row4 + i, 4).number(0)
      ws.cell(row4 + i, 5).number(0)
      ws.cell(row4 + i, 6).number(0)
      ws.cell(row4 + i, 7).number(0)
      ws.cell(row4 + i, 8).number(0)
      ws.cell(row4 + i, 9).number(0)
      ws.cell(row4 + i, 10).number(0)
      ws.cell(row4 + i, 11).number(0)
      ws.cell(row4 + i, 12).number(0)
    }
    rowEnd4 = row4 + rsZone4.length
    ws.cell(rowEnd4, 1, rowEnd4, 2, true).string('รวมเขต 4')
    ws.cell(rowEnd4, 3).number(0)
    ws.cell(rowEnd4, 4).number(0)
    ws.cell(rowEnd4, 5).number(0)
    ws.cell(rowEnd4, 6).number(0)
    ws.cell(rowEnd4, 7).number(0)
    ws.cell(rowEnd4, 8).number(0)
    ws.cell(rowEnd4, 9).number(0)
    ws.cell(rowEnd4, 10).number(0)
    ws.cell(rowEnd4, 11).number(0)
    ws.cell(rowEnd4, 12).number(0)

    const rsZone5 = rs.filter(item => item.zone_code === '05')
    row5 = rowEnd4 + 1
    for (let i = 0; i < rsZone5.length; i++) {
      ws.cell(row5 + i, 1).string(rsZone5[i].zone_code).style(center)
      ws.cell(row5 + i, 2).string(rsZone5[i].province_name)
      ws.cell(row5 + i, 3).number(0)
      ws.cell(row5 + i, 4).number(0)
      ws.cell(row5 + i, 5).number(0)
      ws.cell(row5 + i, 6).number(0)
      ws.cell(row5 + i, 7).number(0)
      ws.cell(row5 + i, 8).number(0)
      ws.cell(row5 + i, 9).number(0)
      ws.cell(row5 + i, 10).number(0)
      ws.cell(row5 + i, 11).number(0)
      ws.cell(row5 + i, 12).number(0)
    }
    rowEnd5 = row5 + rsZone5.length
    ws.cell(rowEnd5, 1, rowEnd5, 2, true).string('รวมเขต 5')
    ws.cell(rowEnd5, 3).number(0)
    ws.cell(rowEnd5, 4).number(0)
    ws.cell(rowEnd5, 5).number(0)
    ws.cell(rowEnd5, 6).number(0)
    ws.cell(rowEnd5, 7).number(0)
    ws.cell(rowEnd5, 8).number(0)
    ws.cell(rowEnd5, 9).number(0)
    ws.cell(rowEnd5, 10).number(0)
    ws.cell(rowEnd5, 11).number(0)
    ws.cell(rowEnd5, 12).number(0)

    const rsZone6 = rs.filter(item => item.zone_code === '06')
    row6 = rowEnd5 + 1
    for (let i = 0; i < rsZone6.length; i++) {
      ws.cell(row6 + i, 1).string(rsZone6[i].zone_code).style(center)
      ws.cell(row6 + i, 2).string(rsZone6[i].province_name)
      ws.cell(row6 + i, 3).number(0)
      ws.cell(row6 + i, 4).number(0)
      ws.cell(row6 + i, 5).number(0)
      ws.cell(row6 + i, 6).number(0)
      ws.cell(row6 + i, 7).number(0)
      ws.cell(row6 + i, 8).number(0)
      ws.cell(row6 + i, 9).number(0)
      ws.cell(row6 + i, 10).number(0)
      ws.cell(row6 + i, 11).number(0)
      ws.cell(row6 + i, 12).number(0)
    }
    rowEnd6 = row6 + rsZone6.length
    ws.cell(rowEnd6, 1, rowEnd6, 2, true).string('รวมเขต 6')
    ws.cell(rowEnd6, 3).number(0)
    ws.cell(rowEnd6, 4).number(0)
    ws.cell(rowEnd6, 5).number(0)
    ws.cell(rowEnd6, 6).number(0)
    ws.cell(rowEnd6, 7).number(0)
    ws.cell(rowEnd6, 8).number(0)
    ws.cell(rowEnd6, 9).number(0)
    ws.cell(rowEnd6, 10).number(0)
    ws.cell(rowEnd6, 11).number(0)
    ws.cell(rowEnd6, 12).number(0)

    const rsZone7 = rs.filter(item => item.zone_code === '07')
    row7 = rowEnd6 + 1
    for (let i = 0; i < rsZone7.length; i++) {
      ws.cell(row7 + i, 1).string(rsZone7[i].zone_code).style(center)
      ws.cell(row7 + i, 2).string(rsZone7[i].province_name)
      ws.cell(row7 + i, 3).number(0)
      ws.cell(row7 + i, 4).number(0)
      ws.cell(row7 + i, 5).number(0)
      ws.cell(row7 + i, 6).number(0)
      ws.cell(row7 + i, 7).number(0)
      ws.cell(row7 + i, 8).number(0)
      ws.cell(row7 + i, 9).number(0)
      ws.cell(row7 + i, 10).number(0)
      ws.cell(row7 + i, 11).number(0)
      ws.cell(row7 + i, 12).number(0)
    }
    rowEnd7 = row7 + rsZone7.length
    ws.cell(rowEnd7, 1, rowEnd7, 2, true).string('รวมเขต 7')
    ws.cell(rowEnd7, 3).number(0)
    ws.cell(rowEnd7, 4).number(0)
    ws.cell(rowEnd7, 5).number(0)
    ws.cell(rowEnd7, 6).number(0)
    ws.cell(rowEnd7, 7).number(0)
    ws.cell(rowEnd7, 8).number(0)
    ws.cell(rowEnd7, 9).number(0)
    ws.cell(rowEnd7, 10).number(0)
    ws.cell(rowEnd7, 11).number(0)
    ws.cell(rowEnd7, 12).number(0)

    const rsZone8 = rs.filter(item => item.zone_code === '08')
    row8 = rowEnd7 + 1
    for (let i = 0; i < rsZone8.length; i++) {
      ws.cell(row8 + i, 1).string(rsZone8[i].zone_code).style(center)
      ws.cell(row8 + i, 2).string(rsZone8[i].province_name)
      ws.cell(row8 + i, 3).number(0)
      ws.cell(row8 + i, 4).number(0)
      ws.cell(row8 + i, 5).number(0)
      ws.cell(row8 + i, 6).number(0)
      ws.cell(row8 + i, 7).number(0)
      ws.cell(row8 + i, 8).number(0)
      ws.cell(row8 + i, 9).number(0)
      ws.cell(row8 + i, 10).number(0)
      ws.cell(row8 + i, 11).number(0)
      ws.cell(row8 + i, 12).number(0)
    }
    rowEnd8 = row8 + rsZone8.length
    ws.cell(rowEnd8, 1, rowEnd8, 2, true).string('รวมเขต 8')
    ws.cell(rowEnd8, 3).number(0)
    ws.cell(rowEnd8, 4).number(0)
    ws.cell(rowEnd8, 5).number(0)
    ws.cell(rowEnd8, 6).number(0)
    ws.cell(rowEnd8, 7).number(0)
    ws.cell(rowEnd8, 8).number(0)
    ws.cell(rowEnd8, 9).number(0)
    ws.cell(rowEnd8, 10).number(0)
    ws.cell(rowEnd8, 11).number(0)
    ws.cell(rowEnd8, 12).number(0)

    const rsZone9 = rs.filter(item => item.zone_code === '09')
    row9 = rowEnd8 + 1
    for (let i = 0; i < rsZone9.length; i++) {
      ws.cell(row9 + i, 1).string(rsZone9[i].zone_code).style(center)
      ws.cell(row9 + i, 2).string(rsZone9[i].province_name)
      ws.cell(row9 + i, 3).number(0)
      ws.cell(row9 + i, 4).number(0)
      ws.cell(row9 + i, 5).number(0)
      ws.cell(row9 + i, 6).number(0)
      ws.cell(row9 + i, 7).number(0)
      ws.cell(row9 + i, 8).number(0)
      ws.cell(row9 + i, 9).number(0)
      ws.cell(row9 + i, 10).number(0)
      ws.cell(row9 + i, 11).number(0)
      ws.cell(row9 + i, 12).number(0)
    }
    rowEnd9 = row9 + rsZone9.length
    ws.cell(rowEnd9, 1, rowEnd9, 2, true).string('รวมเขต 9')
    ws.cell(rowEnd9, 3).number(0)
    ws.cell(rowEnd9, 4).number(0)
    ws.cell(rowEnd9, 5).number(0)
    ws.cell(rowEnd9, 6).number(0)
    ws.cell(rowEnd9, 7).number(0)
    ws.cell(rowEnd9, 8).number(0)
    ws.cell(rowEnd9, 9).number(0)
    ws.cell(rowEnd9, 10).number(0)
    ws.cell(rowEnd9, 11).number(0)
    ws.cell(rowEnd9, 12).number(0)

    const rsZone10 = rs.filter(item => item.zone_code === '10')
    row10 = rowEnd9 + 1
    for (let i = 0; i < rsZone10.length; i++) {
      ws.cell(row10 + i, 1).string(rsZone10[i].zone_code).style(center)
      ws.cell(row10 + i, 2).string(rsZone10[i].province_name)
      ws.cell(row10 + i, 3).number(0)
      ws.cell(row10 + i, 4).number(0)
      ws.cell(row10 + i, 5).number(0)
      ws.cell(row10 + i, 6).number(0)
      ws.cell(row10 + i, 7).number(0)
      ws.cell(row10 + i, 8).number(0)
      ws.cell(row10 + i, 9).number(0)
      ws.cell(row10 + i, 10).number(0)
      ws.cell(row10 + i, 11).number(0)
      ws.cell(row10 + i, 12).number(0)
    }
    rowEnd10 = row10 + rsZone10.length
    ws.cell(rowEnd10, 1, rowEnd10, 2, true).string('รวมเขต 10')
    ws.cell(rowEnd10, 3).number(0)
    ws.cell(rowEnd10, 4).number(0)
    ws.cell(rowEnd10, 5).number(0)
    ws.cell(rowEnd10, 6).number(0)
    ws.cell(rowEnd10, 7).number(0)
    ws.cell(rowEnd10, 8).number(0)
    ws.cell(rowEnd10, 9).number(0)
    ws.cell(rowEnd10, 10).number(0)
    ws.cell(rowEnd10, 11).number(0)
    ws.cell(rowEnd10, 12).number(0)

    const rsZone11 = rs.filter(item => item.zone_code === '11')
    row11 = rowEnd10 + 1
    for (let i = 0; i < rsZone11.length; i++) {
      ws.cell(row11 + i, 1).string(rsZone11[i].zone_code).style(center)
      ws.cell(row11 + i, 2).string(rsZone11[i].province_name)
      ws.cell(row11 + i, 3).number(0)
      ws.cell(row11 + i, 4).number(0)
      ws.cell(row11 + i, 5).number(0)
      ws.cell(row11 + i, 6).number(0)
      ws.cell(row11 + i, 7).number(0)
      ws.cell(row11 + i, 8).number(0)
      ws.cell(row11 + i, 9).number(0)
      ws.cell(row11 + i, 10).number(0)
      ws.cell(row11 + i, 11).number(0)
      ws.cell(row11 + i, 12).number(0)
    }
    rowEnd11 = row11 + rsZone11.length
    ws.cell(rowEnd11, 1, rowEnd11, 2, true).string('รวมเขต 11')
    ws.cell(rowEnd11, 3).number(0)
    ws.cell(rowEnd11, 4).number(0)
    ws.cell(rowEnd11, 5).number(0)
    ws.cell(rowEnd11, 6).number(0)
    ws.cell(rowEnd11, 7).number(0)
    ws.cell(rowEnd11, 8).number(0)
    ws.cell(rowEnd11, 9).number(0)
    ws.cell(rowEnd11, 10).number(0)
    ws.cell(rowEnd11, 11).number(0)
    ws.cell(rowEnd11, 12).number(0)

    const rsZone12 = rs.filter(item => item.zone_code === '12')
    row12 = rowEnd11 + 1
    for (let i = 0; i < rsZone12.length; i++) {
      ws.cell(row12 + i, 1).string(rsZone12[i].zone_code).style(center)
      ws.cell(row12 + i, 2).string(rsZone12[i].province_name)
      ws.cell(row12 + i, 3).number(0)
      ws.cell(row12 + i, 4).number(0)
      ws.cell(row12 + i, 5).number(0)
      ws.cell(row12 + i, 6).number(0)
      ws.cell(row12 + i, 7).number(0)
      ws.cell(row12 + i, 8).number(0)
      ws.cell(row12 + i, 9).number(0)
      ws.cell(row12 + i, 10).number(0)
      ws.cell(row12 + i, 11).number(0)
      ws.cell(row12 + i, 12).number(0)
    }
    rowEnd12 = row12 + rsZone12.length
    ws.cell(rowEnd12, 1, rowEnd12, 2, true).string('รวมเขต 12')
    ws.cell(rowEnd12, 3).number(0)
    ws.cell(rowEnd12, 4).number(0)
    ws.cell(rowEnd12, 5).number(0)
    ws.cell(rowEnd12, 6).number(0)
    ws.cell(rowEnd12, 7).number(0)
    ws.cell(rowEnd12, 8).number(0)
    ws.cell(rowEnd12, 9).number(0)
    ws.cell(rowEnd12, 10).number(0)
    ws.cell(rowEnd12, 11).number(0)
    ws.cell(rowEnd12, 12).number(0)

    const rsZone13 = rs.filter(item => item.zone_code === '13')
    const row13 = rowEnd12 + rsZone13.length
    ws.cell(row13, 1, row13, 2, true).string('กรุงเทพมหานคร')
    ws.cell(row13, 3).number(0)
    ws.cell(row13, 4).number(0)
    ws.cell(row13, 5).number(0)
    ws.cell(row13, 6).number(0)
    ws.cell(row13, 7).number(0)
    ws.cell(row13, 8).number(0)
    ws.cell(row13, 9).number(0)
    ws.cell(row13, 10).number(0)
    ws.cell(row13, 11).number(0)
    ws.cell(row13, 12).number(0)

    const row14 = row13 + 1
    ws.cell(row14, 1, row14, 2, true).string('รวม 12 เขต')
    ws.cell(row14, 3).number(0)
    ws.cell(row14, 4).number(0)
    ws.cell(row14, 5).number(0)
    ws.cell(row14, 6).number(0)
    ws.cell(row14, 7).number(0)
    ws.cell(row14, 8).number(0)
    ws.cell(row14, 9).number(0)
    ws.cell(row14, 10).number(0)
    ws.cell(row14, 11).number(0)
    ws.cell(row14, 12).number(0)

    const row15 = row14 + 1
    ws.cell(row15, 1, row15, 2, true).string('ทั่วประเทศ')
    ws.cell(row15, 3).number(0)
    ws.cell(row15, 4).number(0)
    ws.cell(row15, 5).number(0)
    ws.cell(row15, 6).number(0)
    ws.cell(row15, 7).number(0)
    ws.cell(row15, 8).number(0)
    ws.cell(row15, 9).number(0)
    ws.cell(row15, 10).number(0)
    ws.cell(row15, 11).number(0)
    ws.cell(row15, 12).number(0)


    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = 'report-patient-by-province' + moment().format('x');
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
    })
  } catch (error) {
    res.send({ ok: false, error: error });
  }
})

router.get('/bed-report-by-zone', async (req: Request, res: Response) => {
  const db = req.dbReport
  const date = req.query.date
  const sector = req.query.sector

  var wb = new excel4node.Workbook()
  var ws = wb.addWorksheet('Sheet 1')

  var center = wb.createStyle({
    alignment: {
      wrapText: true,
      horizontal: 'center',
    },
  })
  var right = wb.createStyle({
    alignment: {
      wrapText: true,
      horizontal: 'right',
    },
  })

  try {
    const rs: any = await model.bedReportByZone(db, date, sector);

    ws.cell(1, 1, 2, 1, true).string('เขตสุขภาพ').style(center)
    ws.cell(1, 2, 1, 4, true).string('ระดับ 3 ใส่ท่อและเครื่องช่วยหายใจได้').style(center)
    ws.cell(1, 5, 1, 7, true).string('ระดับ 2.2 Oxygen high flow').style(center)
    ws.cell(1, 8, 1, 10, true).string('ระดับ 2.1 Oxygen low flow').style(center)
    ws.cell(1, 11, 1, 13, true).string('ระดับ 1 ไม่ใช้ Oxygen').style(center)
    ws.cell(1, 14, 1, 16, true).string('ระดับ 0 Home Isolation (stepdown)').style(center)
    ws.cell(1, 17, 1, 19, true).string('Home Isolation (New case)').style(center)
    ws.cell(1, 20, 1, 22, true).string('Community Isolation (New case)').style(center)

    let all = 2
    let use = 3
    let left = 4

    for (let i = 0; i < 7; i++) {
      ws.cell(2, all).string('ทั้งหมด').style(center)
      ws.cell(2, use).string('ใช้ไป').style(center)
      ws.cell(2, left).string('คงเหลือ').style(center)

      all += 3
      use += 3
      left += 3
    }

    for (let i = 0; i < rs.length - 1; i++) {
      ws.cell(3 + i, 1).string('รวมเขต ' + rs[i].zone_code)
      ws.cell(3 + i, 2).number(0)
      ws.cell(3 + i, 3).number(0)
      ws.cell(3 + i, 4).number(0)
      ws.cell(3 + i, 5).number(0)
      ws.cell(3 + i, 6).number(0)
      ws.cell(3 + i, 7).number(0)
      ws.cell(3 + i, 8).number(0)
      ws.cell(3 + i, 9).number(0)
      ws.cell(3 + i, 10).number(0)
      ws.cell(3 + i, 11).number(0)
      ws.cell(3 + i, 12).number(0)
      ws.cell(3 + i, 13).number(0)
      ws.cell(3 + i, 14).number(0)
      ws.cell(3 + i, 15).number(0)
      ws.cell(3 + i, 16).number(0)
      ws.cell(3 + i, 17).number(0)
      ws.cell(3 + i, 18).number(0)
      ws.cell(3 + i, 19).number(0)
      ws.cell(3 + i, 20).number(0)
      ws.cell(3 + i, 21).number(0)
      ws.cell(3 + i, 22).number(0)
    }

    ws.cell(15, 1).string('กรุงเทพมหานคร')
    ws.cell(15, 2).number(0)
    ws.cell(15, 3).number(0)
    ws.cell(15, 4).number(0)
    ws.cell(15, 5).number(0)
    ws.cell(15, 6).number(0)
    ws.cell(15, 7).number(0)
    ws.cell(15, 8).number(0)
    ws.cell(15, 9).number(0)
    ws.cell(15, 10).number(0)
    ws.cell(15, 11).number(0)
    ws.cell(15, 12).number(0)
    ws.cell(15, 13).number(0)
    ws.cell(15, 14).number(0)
    ws.cell(15, 15).number(0)
    ws.cell(15, 16).number(0)
    ws.cell(15, 17).number(0)
    ws.cell(15, 18).number(0)
    ws.cell(15, 19).number(0)
    ws.cell(15, 20).number(0)
    ws.cell(15, 21).number(0)
    ws.cell(15, 22).number(0)

    ws.cell(16, 1).string('รวม 12 เขต')
    ws.cell(16, 2).number(0)
    ws.cell(16, 3).number(0)
    ws.cell(16, 4).number(0)
    ws.cell(16, 5).number(0)
    ws.cell(16, 6).number(0)
    ws.cell(16, 7).number(0)
    ws.cell(16, 8).number(0)
    ws.cell(16, 9).number(0)
    ws.cell(16, 10).number(0)
    ws.cell(16, 11).number(0)
    ws.cell(16, 12).number(0)
    ws.cell(16, 13).number(0)
    ws.cell(16, 14).number(0)
    ws.cell(16, 15).number(0)
    ws.cell(16, 16).number(0)
    ws.cell(16, 17).number(0)
    ws.cell(16, 18).number(0)
    ws.cell(16, 19).number(0)
    ws.cell(16, 20).number(0)
    ws.cell(16, 21).number(0)
    ws.cell(16, 22).number(0)

    ws.cell(17, 1).string('ทั่วประเทศ')
    ws.cell(17, 2).number(0)
    ws.cell(17, 3).number(0)
    ws.cell(17, 4).number(0)
    ws.cell(17, 5).number(0)
    ws.cell(17, 6).number(0)
    ws.cell(17, 7).number(0)
    ws.cell(17, 8).number(0)
    ws.cell(17, 9).number(0)
    ws.cell(17, 10).number(0)
    ws.cell(17, 11).number(0)
    ws.cell(17, 12).number(0)
    ws.cell(17, 13).number(0)
    ws.cell(17, 14).number(0)
    ws.cell(17, 15).number(0)
    ws.cell(17, 16).number(0)
    ws.cell(17, 17).number(0)
    ws.cell(17, 18).number(0)
    ws.cell(17, 19).number(0)
    ws.cell(17, 20).number(0)
    ws.cell(17, 21).number(0)
    ws.cell(17, 22).number(0)


    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = 'report-bed-by-zone' + moment().format('x');
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
    })
  } catch (error) {
    res.send({ ok: false, error: error });
  }
})

router.get('/bed-report-by-province', async (req: Request, res: Response) => {
  const db = req.dbReport
  const date = req.query.date
  const sector = req.query.sector

  var wb = new excel4node.Workbook()
  var ws = wb.addWorksheet('Sheet 1')

  var center = wb.createStyle({
    alignment: {
      wrapText: true,
      horizontal: 'center',
    },
  })
  var right = wb.createStyle({
    alignment: {
      wrapText: true,
      horizontal: 'right',
    },
  })

  try {
    const rs: any = await model.bedReportByProvince(db, date, sector);
    let row1 = 0
    let rowEnd1 = 0
    let row2 = 0
    let rowEnd2 = 0
    let row3 = 0
    let rowEnd3 = 0
    let row4 = 0
    let rowEnd4 = 0
    let row5 = 0
    let rowEnd5 = 0
    let row6 = 0
    let rowEnd6 = 0
    let row7 = 0
    let rowEnd7 = 0
    let row8 = 0
    let rowEnd8 = 0
    let row9 = 0
    let rowEnd9 = 0
    let row10 = 0
    let rowEnd10 = 0
    let row11 = 0
    let rowEnd11 = 0
    let row12 = 0
    let rowEnd12 = 0

    ws.cell(1, 1, 2, 1, true).string('เขตสุขภาพ').style(center)
    ws.cell(1, 2, 2, 2, true).string('จังหวัด').style(center)

    ws.cell(1, 3, 1, 5, true).string('ระดับ 3 ใส่ท่อและเครื่องช่วยหายใจได้').style(center)
    ws.cell(1, 6, 1, 8, true).string('ระดับ 2.2 Oxygen high flow').style(center)
    ws.cell(1, 9, 1, 11, true).string('ระดับ 2.1 Oxygen low flow').style(center)
    ws.cell(1, 12, 1, 14, true).string('ระดับ 1 ไม่ใช้ Oxygen').style(center)
    ws.cell(1, 15, 1, 17, true).string('ระดับ 0 Home Isolation (stepdown)').style(center)
    ws.cell(1, 18, 1, 20, true).string('Home Isolation (New case)').style(center)
    ws.cell(1, 21, 1, 23, true).string('Community Isolation (New case)').style(center)

    let all = 3
    let use = 4
    let left = 5

    for (let i = 0; i < 7; i++) {
      ws.cell(2, all).string('ทั้งหมด').style(center)
      ws.cell(2, use).string('ใช้ไป').style(center)
      ws.cell(2, left).string('คงเหลือ').style(center)

      all += 3
      use += 3
      left += 3
    }


    const rsZone1 = rs.filter(item => item.zone_code === '01')
    for (let i = 0; i < rsZone1.length; i++) {
      ws.cell(3 + i, 1).string(rsZone1[i].zone_code).style(center)
      ws.cell(3 + i, 2).string(rsZone1[i].province_name)
      ws.cell(3 + i, 3).number(0)
      ws.cell(3 + i, 4).number(0)
      ws.cell(3 + i, 5).number(0)
      ws.cell(3 + i, 6).number(0)
      ws.cell(3 + i, 7).number(0)
      ws.cell(3 + i, 8).number(0)
      ws.cell(3 + i, 9).number(0)
      ws.cell(3 + i, 10).number(0)
      ws.cell(3 + i, 11).number(0)
      ws.cell(3 + i, 12).number(0)
      ws.cell(3 + i, 13).number(0)
      ws.cell(3 + i, 14).number(0)
      ws.cell(3 + i, 15).number(0)
      ws.cell(3 + i, 16).number(0)
      ws.cell(3 + i, 17).number(0)
      ws.cell(3 + i, 18).number(0)
      ws.cell(3 + i, 19).number(0)
      ws.cell(3 + i, 20).number(0)
      ws.cell(3 + i, 21).number(0)
      ws.cell(3 + i, 22).number(0)
      ws.cell(3 + i, 23).number(0)
    }
    rowEnd1 = 3 + rsZone1.length
    ws.cell(rowEnd1, 1, rowEnd1, 2, true).string('รวมเขต 1')
    ws.cell(rowEnd1, 3).number(0)
    ws.cell(rowEnd1, 4).number(0)
    ws.cell(rowEnd1, 5).number(0)
    ws.cell(rowEnd1, 6).number(0)
    ws.cell(rowEnd1, 7).number(0)
    ws.cell(rowEnd1, 8).number(0)
    ws.cell(rowEnd1, 9).number(0)
    ws.cell(rowEnd1, 10).number(0)
    ws.cell(rowEnd1, 11).number(0)
    ws.cell(rowEnd1, 12).number(0)
    ws.cell(rowEnd1, 13).number(0)
    ws.cell(rowEnd1, 14).number(0)
    ws.cell(rowEnd1, 15).number(0)
    ws.cell(rowEnd1, 16).number(0)
    ws.cell(rowEnd1, 17).number(0)
    ws.cell(rowEnd1, 18).number(0)
    ws.cell(rowEnd1, 19).number(0)
    ws.cell(rowEnd1, 20).number(0)
    ws.cell(rowEnd1, 21).number(0)
    ws.cell(rowEnd1, 22).number(0)
    ws.cell(rowEnd1, 23).number(0)

    const rsZone2 = rs.filter(item => item.zone_code === '02')
    row2 = rowEnd1 + 1
    for (let i = 0; i < rsZone2.length; i++) {
      ws.cell(row2 + i, 1).string(rsZone2[i].zone_code).style(center)
      ws.cell(row2 + i, 2).string(rsZone2[i].province_name)
      ws.cell(row2 + i, 3).number(0)
      ws.cell(row2 + i, 4).number(0)
      ws.cell(row2 + i, 5).number(0)
      ws.cell(row2 + i, 6).number(0)
      ws.cell(row2 + i, 7).number(0)
      ws.cell(row2 + i, 8).number(0)
      ws.cell(row2 + i, 9).number(0)
      ws.cell(row2 + i, 10).number(0)
      ws.cell(row2 + i, 11).number(0)
      ws.cell(row2 + i, 12).number(0)
      ws.cell(row2 + i, 13).number(0)
      ws.cell(row2 + i, 14).number(0)
      ws.cell(row2 + i, 15).number(0)
      ws.cell(row2 + i, 16).number(0)
      ws.cell(row2 + i, 17).number(0)
      ws.cell(row2 + i, 18).number(0)
      ws.cell(row2 + i, 19).number(0)
      ws.cell(row2 + i, 20).number(0)
      ws.cell(row2 + i, 21).number(0)
      ws.cell(row2 + i, 22).number(0)
      ws.cell(row2 + i, 23).number(0)
    }
    rowEnd2 = row2 + rsZone2.length
    ws.cell(rowEnd2, 1, rowEnd2, 2, true).string('รวมเขต 2')
    ws.cell(rowEnd2, 3).number(0)
    ws.cell(rowEnd2, 4).number(0)
    ws.cell(rowEnd2, 5).number(0)
    ws.cell(rowEnd2, 6).number(0)
    ws.cell(rowEnd2, 7).number(0)
    ws.cell(rowEnd2, 8).number(0)
    ws.cell(rowEnd2, 9).number(0)
    ws.cell(rowEnd2, 10).number(0)
    ws.cell(rowEnd2, 11).number(0)
    ws.cell(rowEnd2, 12).number(0)
    ws.cell(rowEnd2, 13).number(0)
    ws.cell(rowEnd2, 14).number(0)
    ws.cell(rowEnd2, 15).number(0)
    ws.cell(rowEnd2, 16).number(0)
    ws.cell(rowEnd2, 17).number(0)
    ws.cell(rowEnd2, 18).number(0)
    ws.cell(rowEnd2, 19).number(0)
    ws.cell(rowEnd2, 20).number(0)
    ws.cell(rowEnd2, 21).number(0)
    ws.cell(rowEnd2, 22).number(0)
    ws.cell(rowEnd2, 23).number(0)

    const rsZone3 = rs.filter(item => item.zone_code === '03')
    row3 = rowEnd2 + 1
    for (let i = 0; i < rsZone3.length; i++) {
      ws.cell(row3 + i, 1).string(rsZone3[i].zone_code).style(center)
      ws.cell(row3 + i, 2).string(rsZone3[i].province_name)
      ws.cell(row3 + i, 3).number(0)
      ws.cell(row3 + i, 4).number(0)
      ws.cell(row3 + i, 5).number(0)
      ws.cell(row3 + i, 6).number(0)
      ws.cell(row3 + i, 7).number(0)
      ws.cell(row3 + i, 8).number(0)
      ws.cell(row3 + i, 9).number(0)
      ws.cell(row3 + i, 10).number(0)
      ws.cell(row3 + i, 11).number(0)
      ws.cell(row3 + i, 12).number(0)
      ws.cell(row3 + i, 13).number(0)
      ws.cell(row3 + i, 14).number(0)
      ws.cell(row3 + i, 15).number(0)
      ws.cell(row3 + i, 16).number(0)
      ws.cell(row3 + i, 17).number(0)
      ws.cell(row3 + i, 18).number(0)
      ws.cell(row3 + i, 19).number(0)
      ws.cell(row3 + i, 20).number(0)
      ws.cell(row3 + i, 21).number(0)
      ws.cell(row3 + i, 22).number(0)
      ws.cell(row3 + i, 23).number(0)
    }
    rowEnd3 = row3 + rsZone3.length
    ws.cell(rowEnd3, 1, rowEnd3, 2, true).string('รวมเขต 3')
    ws.cell(rowEnd3, 3).number(0)
    ws.cell(rowEnd3, 4).number(0)
    ws.cell(rowEnd3, 5).number(0)
    ws.cell(rowEnd3, 6).number(0)
    ws.cell(rowEnd3, 7).number(0)
    ws.cell(rowEnd3, 8).number(0)
    ws.cell(rowEnd3, 9).number(0)
    ws.cell(rowEnd3, 10).number(0)
    ws.cell(rowEnd3, 11).number(0)
    ws.cell(rowEnd3, 12).number(0)
    ws.cell(rowEnd3, 13).number(0)
    ws.cell(rowEnd3, 14).number(0)
    ws.cell(rowEnd3, 15).number(0)
    ws.cell(rowEnd3, 16).number(0)
    ws.cell(rowEnd3, 17).number(0)
    ws.cell(rowEnd3, 18).number(0)
    ws.cell(rowEnd3, 19).number(0)
    ws.cell(rowEnd3, 20).number(0)
    ws.cell(rowEnd3, 21).number(0)
    ws.cell(rowEnd3, 22).number(0)
    ws.cell(rowEnd3, 23).number(0)

    const rsZone4 = rs.filter(item => item.zone_code === '04')
    row4 = rowEnd3 + 1
    for (let i = 0; i < rsZone4.length; i++) {
      ws.cell(row4 + i, 1).string(rsZone4[i].zone_code).style(center)
      ws.cell(row4 + i, 2).string(rsZone4[i].province_name)
      ws.cell(row4 + i, 3).number(0)
      ws.cell(row4 + i, 4).number(0)
      ws.cell(row4 + i, 5).number(0)
      ws.cell(row4 + i, 6).number(0)
      ws.cell(row4 + i, 7).number(0)
      ws.cell(row4 + i, 8).number(0)
      ws.cell(row4 + i, 9).number(0)
      ws.cell(row4 + i, 10).number(0)
      ws.cell(row4 + i, 11).number(0)
      ws.cell(row4 + i, 12).number(0)
      ws.cell(row4 + i, 13).number(0)
      ws.cell(row4 + i, 14).number(0)
      ws.cell(row4 + i, 15).number(0)
      ws.cell(row4 + i, 16).number(0)
      ws.cell(row4 + i, 17).number(0)
      ws.cell(row4 + i, 18).number(0)
      ws.cell(row4 + i, 19).number(0)
      ws.cell(row4 + i, 20).number(0)
      ws.cell(row4 + i, 21).number(0)
      ws.cell(row4 + i, 22).number(0)
      ws.cell(row4 + i, 23).number(0)
    }
    rowEnd4 = row4 + rsZone4.length
    ws.cell(rowEnd4, 1, rowEnd4, 2, true).string('รวมเขต 4')
    ws.cell(rowEnd4, 3).number(0)
    ws.cell(rowEnd4, 4).number(0)
    ws.cell(rowEnd4, 5).number(0)
    ws.cell(rowEnd4, 6).number(0)
    ws.cell(rowEnd4, 7).number(0)
    ws.cell(rowEnd4, 8).number(0)
    ws.cell(rowEnd4, 9).number(0)
    ws.cell(rowEnd4, 10).number(0)
    ws.cell(rowEnd4, 11).number(0)
    ws.cell(rowEnd4, 12).number(0)
    ws.cell(rowEnd4, 13).number(0)
    ws.cell(rowEnd4, 14).number(0)
    ws.cell(rowEnd4, 15).number(0)
    ws.cell(rowEnd4, 16).number(0)
    ws.cell(rowEnd4, 17).number(0)
    ws.cell(rowEnd4, 18).number(0)
    ws.cell(rowEnd4, 19).number(0)
    ws.cell(rowEnd4, 20).number(0)
    ws.cell(rowEnd4, 21).number(0)
    ws.cell(rowEnd4, 22).number(0)
    ws.cell(rowEnd4, 23).number(0)

    const rsZone5 = rs.filter(item => item.zone_code === '05')
    row5 = rowEnd4 + 1
    for (let i = 0; i < rsZone5.length; i++) {
      ws.cell(row5 + i, 1).string(rsZone5[i].zone_code).style(center)
      ws.cell(row5 + i, 2).string(rsZone5[i].province_name)
      ws.cell(row5 + i, 3).number(0)
      ws.cell(row5 + i, 4).number(0)
      ws.cell(row5 + i, 5).number(0)
      ws.cell(row5 + i, 6).number(0)
      ws.cell(row5 + i, 7).number(0)
      ws.cell(row5 + i, 8).number(0)
      ws.cell(row5 + i, 9).number(0)
      ws.cell(row5 + i, 10).number(0)
      ws.cell(row5 + i, 11).number(0)
      ws.cell(row5 + i, 12).number(0)
      ws.cell(row5 + i, 13).number(0)
      ws.cell(row5 + i, 14).number(0)
      ws.cell(row5 + i, 15).number(0)
      ws.cell(row5 + i, 16).number(0)
      ws.cell(row5 + i, 17).number(0)
      ws.cell(row5 + i, 18).number(0)
      ws.cell(row5 + i, 19).number(0)
      ws.cell(row5 + i, 20).number(0)
      ws.cell(row5 + i, 21).number(0)
      ws.cell(row5 + i, 22).number(0)
      ws.cell(row5 + i, 23).number(0)
    }
    rowEnd5 = row5 + rsZone5.length
    ws.cell(rowEnd5, 1, rowEnd5, 2, true).string('รวมเขต 5')
    ws.cell(rowEnd5, 3).number(0)
    ws.cell(rowEnd5, 4).number(0)
    ws.cell(rowEnd5, 5).number(0)
    ws.cell(rowEnd5, 6).number(0)
    ws.cell(rowEnd5, 7).number(0)
    ws.cell(rowEnd5, 8).number(0)
    ws.cell(rowEnd5, 9).number(0)
    ws.cell(rowEnd5, 10).number(0)
    ws.cell(rowEnd5, 11).number(0)
    ws.cell(rowEnd5, 12).number(0)
    ws.cell(rowEnd5, 13).number(0)
    ws.cell(rowEnd5, 14).number(0)
    ws.cell(rowEnd5, 15).number(0)
    ws.cell(rowEnd5, 16).number(0)
    ws.cell(rowEnd5, 17).number(0)
    ws.cell(rowEnd5, 18).number(0)
    ws.cell(rowEnd5, 19).number(0)
    ws.cell(rowEnd5, 20).number(0)
    ws.cell(rowEnd5, 21).number(0)
    ws.cell(rowEnd5, 22).number(0)
    ws.cell(rowEnd5, 23).number(0)

    const rsZone6 = rs.filter(item => item.zone_code === '06')
    row6 = rowEnd5 + 1
    for (let i = 0; i < rsZone6.length; i++) {
      ws.cell(row6 + i, 1).string(rsZone6[i].zone_code).style(center)
      ws.cell(row6 + i, 2).string(rsZone6[i].province_name)
      ws.cell(row6 + i, 3).number(0)
      ws.cell(row6 + i, 4).number(0)
      ws.cell(row6 + i, 5).number(0)
      ws.cell(row6 + i, 6).number(0)
      ws.cell(row6 + i, 7).number(0)
      ws.cell(row6 + i, 8).number(0)
      ws.cell(row6 + i, 9).number(0)
      ws.cell(row6 + i, 10).number(0)
      ws.cell(row6 + i, 11).number(0)
      ws.cell(row6 + i, 12).number(0)
      ws.cell(row6 + i, 13).number(0)
      ws.cell(row6 + i, 14).number(0)
      ws.cell(row6 + i, 15).number(0)
      ws.cell(row6 + i, 16).number(0)
      ws.cell(row6 + i, 17).number(0)
      ws.cell(row6 + i, 18).number(0)
      ws.cell(row6 + i, 19).number(0)
      ws.cell(row6 + i, 20).number(0)
      ws.cell(row6 + i, 21).number(0)
      ws.cell(row6 + i, 22).number(0)
      ws.cell(row6 + i, 23).number(0)
    }
    rowEnd6 = row6 + rsZone6.length
    ws.cell(rowEnd6, 1, rowEnd6, 2, true).string('รวมเขต 6')
    ws.cell(rowEnd6, 3).number(0)
    ws.cell(rowEnd6, 4).number(0)
    ws.cell(rowEnd6, 5).number(0)
    ws.cell(rowEnd6, 6).number(0)
    ws.cell(rowEnd6, 7).number(0)
    ws.cell(rowEnd6, 8).number(0)
    ws.cell(rowEnd6, 9).number(0)
    ws.cell(rowEnd6, 10).number(0)
    ws.cell(rowEnd6, 11).number(0)
    ws.cell(rowEnd6, 12).number(0)
    ws.cell(rowEnd6, 13).number(0)
    ws.cell(rowEnd6, 14).number(0)
    ws.cell(rowEnd6, 15).number(0)
    ws.cell(rowEnd6, 16).number(0)
    ws.cell(rowEnd6, 17).number(0)
    ws.cell(rowEnd6, 18).number(0)
    ws.cell(rowEnd6, 19).number(0)
    ws.cell(rowEnd6, 20).number(0)
    ws.cell(rowEnd6, 21).number(0)
    ws.cell(rowEnd6, 22).number(0)
    ws.cell(rowEnd6, 23).number(0)

    const rsZone7 = rs.filter(item => item.zone_code === '07')
    row7 = rowEnd6 + 1
    for (let i = 0; i < rsZone7.length; i++) {
      ws.cell(row7 + i, 1).string(rsZone7[i].zone_code).style(center)
      ws.cell(row7 + i, 2).string(rsZone7[i].province_name)
      ws.cell(row7 + i, 3).number(0)
      ws.cell(row7 + i, 4).number(0)
      ws.cell(row7 + i, 5).number(0)
      ws.cell(row7 + i, 6).number(0)
      ws.cell(row7 + i, 7).number(0)
      ws.cell(row7 + i, 8).number(0)
      ws.cell(row7 + i, 9).number(0)
      ws.cell(row7 + i, 10).number(0)
      ws.cell(row7 + i, 11).number(0)
      ws.cell(row7 + i, 12).number(0)
      ws.cell(row7 + i, 13).number(0)
      ws.cell(row7 + i, 14).number(0)
      ws.cell(row7 + i, 15).number(0)
      ws.cell(row7 + i, 16).number(0)
      ws.cell(row7 + i, 17).number(0)
      ws.cell(row7 + i, 18).number(0)
      ws.cell(row7 + i, 19).number(0)
      ws.cell(row7 + i, 20).number(0)
      ws.cell(row7 + i, 21).number(0)
      ws.cell(row7 + i, 22).number(0)
      ws.cell(row7 + i, 23).number(0)
    }
    rowEnd7 = row7 + rsZone7.length
    ws.cell(rowEnd7, 1, rowEnd7, 2, true).string('รวมเขต 7')
    ws.cell(rowEnd7, 3).number(0)
    ws.cell(rowEnd7, 4).number(0)
    ws.cell(rowEnd7, 5).number(0)
    ws.cell(rowEnd7, 6).number(0)
    ws.cell(rowEnd7, 7).number(0)
    ws.cell(rowEnd7, 8).number(0)
    ws.cell(rowEnd7, 9).number(0)
    ws.cell(rowEnd7, 10).number(0)
    ws.cell(rowEnd7, 11).number(0)
    ws.cell(rowEnd7, 12).number(0)
    ws.cell(rowEnd7, 13).number(0)
    ws.cell(rowEnd7, 14).number(0)
    ws.cell(rowEnd7, 15).number(0)
    ws.cell(rowEnd7, 16).number(0)
    ws.cell(rowEnd7, 17).number(0)
    ws.cell(rowEnd7, 18).number(0)
    ws.cell(rowEnd7, 19).number(0)
    ws.cell(rowEnd7, 20).number(0)
    ws.cell(rowEnd7, 21).number(0)
    ws.cell(rowEnd7, 22).number(0)
    ws.cell(rowEnd7, 23).number(0)

    const rsZone8 = rs.filter(item => item.zone_code === '08')
    row8 = rowEnd7 + 1
    for (let i = 0; i < rsZone8.length; i++) {
      ws.cell(row8 + i, 1).string(rsZone8[i].zone_code).style(center)
      ws.cell(row8 + i, 2).string(rsZone8[i].province_name)
      ws.cell(row8 + i, 3).number(0)
      ws.cell(row8 + i, 4).number(0)
      ws.cell(row8 + i, 5).number(0)
      ws.cell(row8 + i, 6).number(0)
      ws.cell(row8 + i, 7).number(0)
      ws.cell(row8 + i, 8).number(0)
      ws.cell(row8 + i, 9).number(0)
      ws.cell(row8 + i, 10).number(0)
      ws.cell(row8 + i, 11).number(0)
      ws.cell(row8 + i, 12).number(0)
      ws.cell(row8 + i, 13).number(0)
      ws.cell(row8 + i, 14).number(0)
      ws.cell(row8 + i, 15).number(0)
      ws.cell(row8 + i, 16).number(0)
      ws.cell(row8 + i, 17).number(0)
      ws.cell(row8 + i, 18).number(0)
      ws.cell(row8 + i, 19).number(0)
      ws.cell(row8 + i, 20).number(0)
      ws.cell(row8 + i, 21).number(0)
      ws.cell(row8 + i, 22).number(0)
      ws.cell(row8 + i, 23).number(0)
    }
    rowEnd8 = row8 + rsZone8.length
    ws.cell(rowEnd8, 1, rowEnd8, 2, true).string('รวมเขต 8')
    ws.cell(rowEnd8, 3).number(0)
    ws.cell(rowEnd8, 4).number(0)
    ws.cell(rowEnd8, 5).number(0)
    ws.cell(rowEnd8, 6).number(0)
    ws.cell(rowEnd8, 7).number(0)
    ws.cell(rowEnd8, 8).number(0)
    ws.cell(rowEnd8, 9).number(0)
    ws.cell(rowEnd8, 10).number(0)
    ws.cell(rowEnd8, 11).number(0)
    ws.cell(rowEnd8, 12).number(0)
    ws.cell(rowEnd8, 13).number(0)
    ws.cell(rowEnd8, 14).number(0)
    ws.cell(rowEnd8, 15).number(0)
    ws.cell(rowEnd8, 16).number(0)
    ws.cell(rowEnd8, 17).number(0)
    ws.cell(rowEnd8, 18).number(0)
    ws.cell(rowEnd8, 19).number(0)
    ws.cell(rowEnd8, 20).number(0)
    ws.cell(rowEnd8, 21).number(0)
    ws.cell(rowEnd8, 22).number(0)
    ws.cell(rowEnd8, 23).number(0)

    const rsZone9 = rs.filter(item => item.zone_code === '09')
    row9 = rowEnd8 + 1
    for (let i = 0; i < rsZone9.length; i++) {
      ws.cell(row9 + i, 1).string(rsZone9[i].zone_code).style(center)
      ws.cell(row9 + i, 2).string(rsZone9[i].province_name)
      ws.cell(row9 + i, 3).number(0)
      ws.cell(row9 + i, 4).number(0)
      ws.cell(row9 + i, 5).number(0)
      ws.cell(row9 + i, 6).number(0)
      ws.cell(row9 + i, 7).number(0)
      ws.cell(row9 + i, 8).number(0)
      ws.cell(row9 + i, 9).number(0)
      ws.cell(row9 + i, 10).number(0)
      ws.cell(row9 + i, 11).number(0)
      ws.cell(row9 + i, 12).number(0)
      ws.cell(row9 + i, 13).number(0)
      ws.cell(row9 + i, 14).number(0)
      ws.cell(row9 + i, 15).number(0)
      ws.cell(row9 + i, 16).number(0)
      ws.cell(row9 + i, 17).number(0)
      ws.cell(row9 + i, 18).number(0)
      ws.cell(row9 + i, 19).number(0)
      ws.cell(row9 + i, 20).number(0)
      ws.cell(row9 + i, 21).number(0)
      ws.cell(row9 + i, 22).number(0)
      ws.cell(row9 + i, 23).number(0)
    }
    rowEnd9 = row9 + rsZone9.length
    ws.cell(rowEnd9, 1, rowEnd9, 2, true).string('รวมเขต 9')
    ws.cell(rowEnd9, 3).number(0)
    ws.cell(rowEnd9, 4).number(0)
    ws.cell(rowEnd9, 5).number(0)
    ws.cell(rowEnd9, 6).number(0)
    ws.cell(rowEnd9, 7).number(0)
    ws.cell(rowEnd9, 8).number(0)
    ws.cell(rowEnd9, 9).number(0)
    ws.cell(rowEnd9, 10).number(0)
    ws.cell(rowEnd9, 11).number(0)
    ws.cell(rowEnd9, 12).number(0)
    ws.cell(rowEnd9, 13).number(0)
    ws.cell(rowEnd9, 14).number(0)
    ws.cell(rowEnd9, 15).number(0)
    ws.cell(rowEnd9, 16).number(0)
    ws.cell(rowEnd9, 17).number(0)
    ws.cell(rowEnd9, 18).number(0)
    ws.cell(rowEnd9, 19).number(0)
    ws.cell(rowEnd9, 20).number(0)
    ws.cell(rowEnd9, 21).number(0)
    ws.cell(rowEnd9, 22).number(0)
    ws.cell(rowEnd9, 23).number(0)

    const rsZone10 = rs.filter(item => item.zone_code === '10')
    row10 = rowEnd9 + 1
    for (let i = 0; i < rsZone10.length; i++) {
      ws.cell(row10 + i, 1).string(rsZone10[i].zone_code).style(center)
      ws.cell(row10 + i, 2).string(rsZone10[i].province_name)
      ws.cell(row10 + i, 3).number(0)
      ws.cell(row10 + i, 4).number(0)
      ws.cell(row10 + i, 5).number(0)
      ws.cell(row10 + i, 6).number(0)
      ws.cell(row10 + i, 7).number(0)
      ws.cell(row10 + i, 8).number(0)
      ws.cell(row10 + i, 9).number(0)
      ws.cell(row10 + i, 10).number(0)
      ws.cell(row10 + i, 11).number(0)
      ws.cell(row10 + i, 12).number(0)
      ws.cell(row10 + i, 13).number(0)
      ws.cell(row10 + i, 14).number(0)
      ws.cell(row10 + i, 15).number(0)
      ws.cell(row10 + i, 16).number(0)
      ws.cell(row10 + i, 17).number(0)
      ws.cell(row10 + i, 18).number(0)
      ws.cell(row10 + i, 19).number(0)
      ws.cell(row10 + i, 20).number(0)
      ws.cell(row10 + i, 21).number(0)
      ws.cell(row10 + i, 22).number(0)
      ws.cell(row10 + i, 23).number(0)
    }
    rowEnd10 = row10 + rsZone10.length
    ws.cell(rowEnd10, 1, rowEnd10, 2, true).string('รวมเขต 10')
    ws.cell(rowEnd10, 3).number(0)
    ws.cell(rowEnd10, 4).number(0)
    ws.cell(rowEnd10, 5).number(0)
    ws.cell(rowEnd10, 6).number(0)
    ws.cell(rowEnd10, 7).number(0)
    ws.cell(rowEnd10, 8).number(0)
    ws.cell(rowEnd10, 9).number(0)
    ws.cell(rowEnd10, 10).number(0)
    ws.cell(rowEnd10, 11).number(0)
    ws.cell(rowEnd10, 12).number(0)
    ws.cell(rowEnd10, 13).number(0)
    ws.cell(rowEnd10, 14).number(0)
    ws.cell(rowEnd10, 15).number(0)
    ws.cell(rowEnd10, 16).number(0)
    ws.cell(rowEnd10, 17).number(0)
    ws.cell(rowEnd10, 18).number(0)
    ws.cell(rowEnd10, 19).number(0)
    ws.cell(rowEnd10, 20).number(0)
    ws.cell(rowEnd10, 21).number(0)
    ws.cell(rowEnd10, 22).number(0)
    ws.cell(rowEnd10, 23).number(0)

    const rsZone11 = rs.filter(item => item.zone_code === '11')
    row11 = rowEnd10 + 1
    for (let i = 0; i < rsZone11.length; i++) {
      ws.cell(row11 + i, 1).string(rsZone11[i].zone_code).style(center)
      ws.cell(row11 + i, 2).string(rsZone11[i].province_name)
      ws.cell(row11 + i, 3).number(0)
      ws.cell(row11 + i, 4).number(0)
      ws.cell(row11 + i, 5).number(0)
      ws.cell(row11 + i, 6).number(0)
      ws.cell(row11 + i, 7).number(0)
      ws.cell(row11 + i, 8).number(0)
      ws.cell(row11 + i, 9).number(0)
      ws.cell(row11 + i, 10).number(0)
      ws.cell(row11 + i, 11).number(0)
      ws.cell(row11 + i, 12).number(0)
      ws.cell(row11 + i, 13).number(0)
      ws.cell(row11 + i, 14).number(0)
      ws.cell(row11 + i, 15).number(0)
      ws.cell(row11 + i, 16).number(0)
      ws.cell(row11 + i, 17).number(0)
      ws.cell(row11 + i, 18).number(0)
      ws.cell(row11 + i, 19).number(0)
      ws.cell(row11 + i, 20).number(0)
      ws.cell(row11 + i, 21).number(0)
      ws.cell(row11 + i, 22).number(0)
      ws.cell(row11 + i, 23).number(0)
    }
    rowEnd11 = row11 + rsZone11.length
    ws.cell(rowEnd11, 1, rowEnd11, 2, true).string('รวมเขต 11')
    ws.cell(rowEnd11, 3).number(0)
    ws.cell(rowEnd11, 4).number(0)
    ws.cell(rowEnd11, 5).number(0)
    ws.cell(rowEnd11, 6).number(0)
    ws.cell(rowEnd11, 7).number(0)
    ws.cell(rowEnd11, 8).number(0)
    ws.cell(rowEnd11, 9).number(0)
    ws.cell(rowEnd11, 10).number(0)
    ws.cell(rowEnd11, 11).number(0)
    ws.cell(rowEnd11, 12).number(0)
    ws.cell(rowEnd11, 13).number(0)
    ws.cell(rowEnd11, 14).number(0)
    ws.cell(rowEnd11, 15).number(0)
    ws.cell(rowEnd11, 16).number(0)
    ws.cell(rowEnd11, 17).number(0)
    ws.cell(rowEnd11, 18).number(0)
    ws.cell(rowEnd11, 19).number(0)
    ws.cell(rowEnd11, 20).number(0)
    ws.cell(rowEnd11, 21).number(0)
    ws.cell(rowEnd11, 22).number(0)
    ws.cell(rowEnd11, 23).number(0)

    const rsZone12 = rs.filter(item => item.zone_code === '12')
    row12 = rowEnd11 + 1
    for (let i = 0; i < rsZone12.length; i++) {
      ws.cell(row12 + i, 1).string(rsZone12[i].zone_code).style(center)
      ws.cell(row12 + i, 2).string(rsZone12[i].province_name)
      ws.cell(row12 + i, 3).number(0)
      ws.cell(row12 + i, 4).number(0)
      ws.cell(row12 + i, 5).number(0)
      ws.cell(row12 + i, 6).number(0)
      ws.cell(row12 + i, 7).number(0)
      ws.cell(row12 + i, 8).number(0)
      ws.cell(row12 + i, 9).number(0)
      ws.cell(row12 + i, 10).number(0)
      ws.cell(row12 + i, 11).number(0)
      ws.cell(row12 + i, 12).number(0)
      ws.cell(row12 + i, 13).number(0)
      ws.cell(row12 + i, 14).number(0)
      ws.cell(row12 + i, 15).number(0)
      ws.cell(row12 + i, 16).number(0)
      ws.cell(row12 + i, 17).number(0)
      ws.cell(row12 + i, 18).number(0)
      ws.cell(row12 + i, 19).number(0)
      ws.cell(row12 + i, 20).number(0)
      ws.cell(row12 + i, 21).number(0)
      ws.cell(row12 + i, 22).number(0)
      ws.cell(row12 + i, 23).number(0)
    }
    rowEnd12 = row12 + rsZone12.length
    ws.cell(rowEnd12, 1, rowEnd12, 2, true).string('รวมเขต 12')
    ws.cell(rowEnd12, 3).number(0)
    ws.cell(rowEnd12, 4).number(0)
    ws.cell(rowEnd12, 5).number(0)
    ws.cell(rowEnd12, 6).number(0)
    ws.cell(rowEnd12, 7).number(0)
    ws.cell(rowEnd12, 8).number(0)
    ws.cell(rowEnd12, 9).number(0)
    ws.cell(rowEnd12, 10).number(0)
    ws.cell(rowEnd12, 11).number(0)
    ws.cell(rowEnd12, 12).number(0)
    ws.cell(rowEnd12, 13).number(0)
    ws.cell(rowEnd12, 14).number(0)
    ws.cell(rowEnd12, 15).number(0)
    ws.cell(rowEnd12, 16).number(0)
    ws.cell(rowEnd12, 17).number(0)
    ws.cell(rowEnd12, 18).number(0)
    ws.cell(rowEnd12, 19).number(0)
    ws.cell(rowEnd12, 20).number(0)
    ws.cell(rowEnd12, 21).number(0)
    ws.cell(rowEnd12, 22).number(0)
    ws.cell(rowEnd12, 23).number(0)

    const rsZone13 = rs.filter(item => item.zone_code === '13')
    const row13 = rowEnd12 + rsZone13.length
    ws.cell(row13, 1, row13, 2, true).string('กรุงเทพมหานคร')
    ws.cell(row13, 3).number(0)
    ws.cell(row13, 4).number(0)
    ws.cell(row13, 5).number(0)
    ws.cell(row13, 6).number(0)
    ws.cell(row13, 7).number(0)
    ws.cell(row13, 8).number(0)
    ws.cell(row13, 9).number(0)
    ws.cell(row13, 10).number(0)
    ws.cell(row13, 11).number(0)
    ws.cell(row13, 12).number(0)
    ws.cell(row13, 13).number(0)
    ws.cell(row13, 14).number(0)
    ws.cell(row13, 15).number(0)
    ws.cell(row13, 16).number(0)
    ws.cell(row13, 17).number(0)
    ws.cell(row13, 18).number(0)
    ws.cell(row13, 19).number(0)
    ws.cell(row13, 20).number(0)
    ws.cell(row13, 21).number(0)
    ws.cell(row13, 22).number(0)
    ws.cell(row13, 23).number(0)

    const row14 = row13 + 1
    ws.cell(row14, 1, row14, 2, true).string('รวม 12 เขต')
    ws.cell(row14, 3).number(0)
    ws.cell(row14, 4).number(0)
    ws.cell(row14, 5).number(0)
    ws.cell(row14, 6).number(0)
    ws.cell(row14, 7).number(0)
    ws.cell(row14, 8).number(0)
    ws.cell(row14, 9).number(0)
    ws.cell(row14, 10).number(0)
    ws.cell(row14, 11).number(0)
    ws.cell(row14, 12).number(0)
    ws.cell(row14, 13).number(0)
    ws.cell(row14, 14).number(0)
    ws.cell(row14, 15).number(0)
    ws.cell(row14, 16).number(0)
    ws.cell(row14, 17).number(0)
    ws.cell(row14, 18).number(0)
    ws.cell(row14, 19).number(0)
    ws.cell(row14, 20).number(0)
    ws.cell(row14, 21).number(0)
    ws.cell(row14, 22).number(0)
    ws.cell(row14, 23).number(0)

    const row15 = row14 + 1
    ws.cell(row15, 1, row15, 2, true).string('ทั่วประเทศ')
    ws.cell(row15, 3).number(0)
    ws.cell(row15, 4).number(0)
    ws.cell(row15, 5).number(0)
    ws.cell(row15, 6).number(0)
    ws.cell(row15, 7).number(0)
    ws.cell(row15, 8).number(0)
    ws.cell(row15, 9).number(0)
    ws.cell(row15, 10).number(0)
    ws.cell(row15, 11).number(0)
    ws.cell(row15, 12).number(0)
    ws.cell(row15, 13).number(0)
    ws.cell(row15, 14).number(0)
    ws.cell(row15, 15).number(0)
    ws.cell(row15, 16).number(0)
    ws.cell(row15, 17).number(0)
    ws.cell(row15, 18).number(0)
    ws.cell(row15, 19).number(0)
    ws.cell(row15, 20).number(0)
    ws.cell(row15, 21).number(0)
    ws.cell(row15, 22).number(0)
    ws.cell(row15, 23).number(0)


    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = 'report-bed-by-province' + moment().format('x');
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
    })
  } catch (error) {
    res.send({ ok: false, error: error });
  }
})

router.get('/patient-report-by-hospital', async (req: Request, res: Response) => {
  const db = req.dbReport
  const date = req.query.date
  const sector = req.query.sector

  var wb = new excel4node.Workbook()
  var ws = wb.addWorksheet('Sheet 1')

  var center = wb.createStyle({
    alignment: {
      wrapText: true,
      horizontal: 'center',
    },
  })
  var right = wb.createStyle({
    alignment: {
      wrapText: true,
      horizontal: 'right',
    },
  })

  try {
    const rs: any = await model.patientReportByHospital(db, date, sector);

    ws.cell(1,1).string('เขตสุขภาพ').style(center)
    ws.cell(1,2).string('จังหวัด').style(center)
    ws.cell(1,3).string('รหัสพยาบาล').style(center)
    ws.cell(1,4).string('โรงพยาบาล').style(center)
    ws.cell(1,5).string('ระดับขีดความสามารถ').style(center)
    ws.cell(1,6).string('ผู้ป่วยทั้งหมด').style(center)
    ws.cell(1,7).string('Severe').style(center)
    ws.cell(1,8).string('Invasive Ventilator').style(center)
    ws.cell(1,9).string('Non-Invasive Ventilator').style(center)
    ws.cell(1,10).string('High flow').style(center)
    ws.cell(1,11).string('Moderate').style(center)
    ws.cell(1,12).string('Mild').style(center)
    ws.cell(1,13).string('Asymptomatic').style(center)
    ws.cell(1,14).string('Dead').style(center)
    ws.cell(1,15).string('PUI').style(center)
    ws.cell(1,16).string('หน่วยงาน').style(center)

    for (let i = 0; i < rs.length; i++) {
      ws.cell(2 + i, 1).string(rs[i].zone_code).style(center)
      ws.cell(2 + i, 2).string(rs[i].province_name).style(center)
      ws.cell(2 + i, 3).string(rs[i].hospcode).style(center)
      ws.cell(2 + i, 4).string(rs[i].hospname).style(center)
      ws.cell(2 + i, 5).number(0)
      ws.cell(2 + i, 6).number(0)
      ws.cell(2 + i, 7).number(0)
      ws.cell(2 + i, 8).number(0)
      ws.cell(2 + i, 9).number(0)
      ws.cell(2 + i, 10).number(0)
      ws.cell(2 + i, 11).number(0)
      ws.cell(2 + i, 12).number(0)
      ws.cell(2 + i, 13).number(0)
      ws.cell(2 + i, 14).number(0)
      ws.cell(2 + i, 15).number(0)
      ws.cell(2 + i, 16).number(0)
    }

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = 'report-patient-by-hospital' + moment().format('x');
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
    })
  } catch (error) {
    res.send({ ok: false, error: error });
  }
})

router.get('/bed-report-by-hospital', async (req: Request, res: Response) => {
  const db = req.dbReport
  const date = req.query.date
  const sector = req.query.sector

  var wb = new excel4node.Workbook()
  var ws = wb.addWorksheet('Sheet 1')

  var center = wb.createStyle({
    alignment: {
      wrapText: true,
      horizontal: 'center',
    },
  })
  var right = wb.createStyle({
    alignment: {
      wrapText: true,
      horizontal: 'right',
    },
  })

  try {
    const rs: any = await model.bedReportByHospital(db, date, sector);

    ws.cell(1, 1, 2, 1, true).string('เขตสุขภาพ').style(center)
    ws.cell(1, 2, 2, 2, true).string('จังหวัด').style(center)
    ws.cell(1, 3, 2, 3, true).string('รหัสโรงพยาบาล').style(center)
    ws.cell(1, 4, 2, 4, true).string('โรงยาบาล').style(center)
    ws.cell(1, 5, 2, 5, true).string('ระดับขีดความสามารถ').style(center)


    ws.cell(1, 6, 1, 8, true).string('ระดับ 3 ใส่ท่อและเครื่องช่วยหายใจได้').style(center)
    ws.cell(1, 9, 1, 11, true).string('ระดับ 2.2 Oxygen high flow').style(center)
    ws.cell(1, 12, 1, 14, true).string('ระดับ 2.1 Oxygen low flow').style(center)
    ws.cell(1, 15, 1, 17, true).string('ระดับ 1 ไม่ใช้ Oxygen').style(center)
    ws.cell(1, 18, 1, 20, true).string('ระดับ 0 Home Isolation (stepdown)').style(center)
    ws.cell(1, 21, 1, 23, true).string('Home Isolation (New case)').style(center)
    ws.cell(1, 24, 1, 26, true).string('Community Isolation (New case)').style(center)

    let all = 6
    let use = 7
    let left = 8

    for (let i = 0; i < 7; i++) {
      ws.cell(2, all).string('ทั้งหมด').style(center)
      ws.cell(2, use).string('ใช้ไป').style(center)
      ws.cell(2, left).string('คงเหลือ').style(center)

      all += 3
      use += 3
      left += 3
    }

    for (let i = 0; i < rs.length - 1; i++) {
      ws.cell(3 + i, 1).string(rs[i].zone_code).style(center)
      ws.cell(3 + i, 2).string(rs[i].province_name).style(center)
      ws.cell(3 + i, 3).string(rs[i].hospcode).style(center)
      ws.cell(3 + i, 4).string(rs[i].hospname).style(center)
      ws.cell(3 + i, 5).number(0)
      ws.cell(3 + i, 6).number(0)
      ws.cell(3 + i, 7).number(0)
      ws.cell(3 + i, 8).number(0)
      ws.cell(3 + i, 9).number(0)
      ws.cell(3 + i, 10).number(0)
      ws.cell(3 + i, 11).number(0)
      ws.cell(3 + i, 12).number(0)
      ws.cell(3 + i, 13).number(0)
      ws.cell(3 + i, 14).number(0)
      ws.cell(3 + i, 15).number(0)
      ws.cell(3 + i, 16).number(0)
      ws.cell(3 + i, 17).number(0)
      ws.cell(3 + i, 18).number(0)
      ws.cell(3 + i, 19).number(0)
      ws.cell(3 + i, 20).number(0)
      ws.cell(3 + i, 21).number(0)
      ws.cell(3 + i, 22).number(0)
      ws.cell(3 + i, 23).number(0)
      ws.cell(3 + i, 24).number(0)
      ws.cell(3 + i, 25).number(0)
      ws.cell(3 + i, 26).number(0)
    }

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = 'report-bed-by-hospital' + moment().format('x');
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
    })
  } catch (error) {
    res.send({ ok: false, error: error });
  }
})

router.get('/patient-admit', async (req: Request, res: Response) => {
  const db = req.dbReport
  const date = req.query.date
  const sector = req.query.sector

  var wb = new excel4node.Workbook()
  var ws = wb.addWorksheet('Sheet 1')

  var center = wb.createStyle({
    alignment: {
      wrapText: true,
      horizontal: 'center',
    },
  })
  var right = wb.createStyle({
    alignment: {
      wrapText: true,
      horizontal: 'right',
    },
  })

  try {
    // const rs: any = await model.patientReportAdmit(db, date, sector);

    ws.cell(1,1).string('เขต').style(center)
    ws.cell(1,2).string('จังหวัด').style(center)
    ws.cell(1,3).string('โรงพยาบาล').style(center)
    ws.cell(1,4).string('HN').style(center)
    ws.cell(1,5).string('AN').style(center)
    ws.cell(1,6).string('CID').style(center)
    ws.cell(1,7).string('ชื่อ').style(center)
    ws.cell(1,8).string('นามสกุล').style(center)
    ws.cell(1,9).string('เพศ').style(center)
    ws.cell(1,10).string('อายุ').style(center)
    ws.cell(1,11).string('วันที่ Admit').style(center)
    ws.cell(1,12).string('วันที่ บันทึก').style(center)
    ws.cell(1,13).string('ควมารุนแรง').style(center)
    ws.cell(1,14).string('เตียง').style(center)
    ws.cell(1,15).string('เครื่องช่วยหายใจ').style(center)
    ws.cell(1,16).string('วันที่ update อาการล่าสุด').style(center)
    ws.cell(1,17).string('ไม่ได้บันทึกมา').style(center)
    ws.cell(1,18).string('Darunavir 600 mg.').style(center)
    ws.cell(1,19).string('Lopinavir 200 mg. / Ritonavir 50 mg.').style(center)
    ws.cell(1,20).string('Ritonavir 100 mg.').style(center)
    ws.cell(1,21).string('Azithromycin 250 mg.').style(center)
    ws.cell(1,22).string('Favipiravi').style(center)
    ws.cell(1,23).string('หน่วยงานสังกัด').style(center)

    // for (let i = 0; i < rs.length; i++) {
    //   ws.cell(2 + i, 1).string(rs[i].zone_code).style(center)
    //   ws.cell(2 + i, 2).string(rs[i].province_name).style(center)
    //   ws.cell(2 + i, 3).string(rs[i].hospname).style(center)
    //   ws.cell(2 + i, 4).string('').style(center)
    //   ws.cell(2 + i, 5).number(0)
    //   ws.cell(2 + i, 6).number(0)
    //   ws.cell(2 + i, 7).number(0)
    //   ws.cell(2 + i, 8).number(0)
    //   ws.cell(2 + i, 9).number(0)
    //   ws.cell(2 + i, 10).number(0)
    //   ws.cell(2 + i, 11).number(0)
    //   ws.cell(2 + i, 12).number(0)
    //   ws.cell(2 + i, 13).number(0)
    //   ws.cell(2 + i, 14).number(0)
    //   ws.cell(2 + i, 15).number(0)
    //   ws.cell(2 + i, 16).number(0)
    //   ws.cell(2 + i, 17).number(0)
    //   ws.cell(2 + i, 18).number(0)
    //   ws.cell(2 + i, 19).number(0)
    //   ws.cell(2 + i, 20).number(0)
    //   ws.cell(2 + i, 21).number(0)
    //   ws.cell(2 + i, 22).number(0)
    //   ws.cell(2 + i, 23).number(0)
    // }

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = 'report-patient-admit' + moment().format('x');
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
    })
  } catch (error) {
    res.send({ ok: false, error: error });
  }
})

router.get('/patient-discharge', async (req: Request, res: Response) => {
  const db = req.dbReport
  const date = req.query.date
  const sector = req.query.sector

  var wb = new excel4node.Workbook()
  var ws = wb.addWorksheet('Sheet 1')

  var center = wb.createStyle({
    alignment: {
      wrapText: true,
      horizontal: 'center',
    },
  })
  var right = wb.createStyle({
    alignment: {
      wrapText: true,
      horizontal: 'right',
    },
  })

  try {
    // const rs: any = await model.patientReportAdmit(db, date, sector);

    ws.cell(1,1).string('เขต').style(center)
    ws.cell(1,2).string('จังหวัด').style(center)
    ws.cell(1,3).string('รหัสโรงพยาบาล').style(center)
    ws.cell(1,4).string('โรงพยาบาล').style(center)
    ws.cell(1,5).string('HN').style(center)
    ws.cell(1,6).string('AN').style(center)
    ws.cell(1,7).string('CID').style(center)
    ws.cell(1,8).string('ชื่อ').style(center)
    ws.cell(1,9).string('นามสกุล').style(center)
    ws.cell(1,10).string('เพศ').style(center)
    ws.cell(1,11).string('อายุ').style(center)
    ws.cell(1,12).string('Status').style(center)
    ws.cell(1,13).string('Date Admit').style(center)
    ws.cell(1,14).string('Date Discharge').style(center)
    ws.cell(1,15).string('Refer Hospital Code').style(center)
    ws.cell(1,16).string('Refer Hospital Name').style(center)
    ws.cell(1,17).string('หน่วยงานสังกัด').style(center)

    // for (let i = 0; i < rs.length; i++) {
    //   ws.cell(2 + i, 1).string(rs[i].zone_code).style(center)
    //   ws.cell(2 + i, 2).string(rs[i].province_name).style(center)
    //   ws.cell(2 + i, 3).string(rs[i].hospcode).style(center)
    //   ws.cell(2 + i, 4).string(rs[i].hospname).style(center)
    //   ws.cell(2 + i, 5).number(0)
    //   ws.cell(2 + i, 6).number(0)
    //   ws.cell(2 + i, 7).number(0)
    //   ws.cell(2 + i, 8).number(0)
    //   ws.cell(2 + i, 9).number(0)
    //   ws.cell(2 + i, 10).number(0)
    //   ws.cell(2 + i, 11).number(0)
    //   ws.cell(2 + i, 12).number(0)
    //   ws.cell(2 + i, 13).number(0)
    //   ws.cell(2 + i, 14).number(0)
    //   ws.cell(2 + i, 15).number(0)
    //   ws.cell(2 + i, 16).number(0)
    //   ws.cell(2 + i, 17).number(0)
    // }

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = 'report-patient-discharge' + moment().format('x');
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
    })
  } catch (error) {
    res.send({ ok: false, error: error });
  }
})

router.get('/patient-sum-daily', async (req: Request, res: Response) => {
  const db = req.dbReport
  const date = req.query.date
  const sector = req.query.sector

  var wb = new excel4node.Workbook()
  var ws = wb.addWorksheet('Sheet 1')

  var center = wb.createStyle({
    alignment: {
      wrapText: true,
      horizontal: 'center',
    },
  })
  var right = wb.createStyle({
    alignment: {
      wrapText: true,
      horizontal: 'right',
    },
  })

  try {
    // const rs: any = await model.patientReportAdmit(db, date, sector);

    ws.cell(1, 1, 2, 1, true).string('เขตสุขภาพ').style(center)
    ws.cell(1, 2, 2, 2, true).string('จังหวัด').style(center)
    ws.cell(1, 3, 2, 3, true).string('รหัสโรงพยาบาล').style(center)
    ws.cell(1, 4, 2, 4, true).string('โรงพยาบาล').style(center)
    ws.cell(1, 5, 1, 8, true).string('Positive ยอดสะสม').style(center)
    ws.cell(1, 9, 1, 12, true).string('PUI ยอดสะสม').style(center)
    ws.cell(1, 13, 1, 16, true).string('Positive วันนี้').style(center)
    ws.cell(1, 17, 1, 20, true).string('PUI วันนี้').style(center)
    ws.cell(1, 21, 2, 21, true).string('หน่วยงาน').style(center)

    let admit = 5
    let dischargeSum = 6
    let dischargeHospital = 7
    let dischargeDead = 8

    for (let i = 0; i < 4; i++) {
      ws.cell(2, admit).string('Admit').style(center)
      ws.cell(2, dischargeSum).string('Discharge รวมสะสม').style(center)
      ws.cell(2, dischargeHospital).string('Discharge ส่ง Hospital').style(center)
      ws.cell(2, dischargeDead).string('Discharge ตายสะสม').style(center)

      admit += 4
      dischargeSum += 4
      dischargeHospital += 4
      dischargeDead += 4
    }


    // for (let i = 0; i < rs.length; i++) {
    //   ws.cell(2 + i, 1).string(rs[i].zone_code).style(center)
    //   ws.cell(2 + i, 2).string(rs[i].province_name).style(center)
    //   ws.cell(2 + i, 3).string(rs[i].hospcode).style(center)
    //   ws.cell(2 + i, 4).string(rs[i].hospname).style(center)
    //   ws.cell(2 + i, 5).number(0)
    //   ws.cell(2 + i, 6).number(0)
    //   ws.cell(2 + i, 7).number(0)
    //   ws.cell(2 + i, 8).number(0)
    //   ws.cell(2 + i, 9).number(0)
    //   ws.cell(2 + i, 10).number(0)
    //   ws.cell(2 + i, 11).number(0)
    //   ws.cell(2 + i, 12).number(0)
    //   ws.cell(2 + i, 13).number(0)
    //   ws.cell(2 + i, 14).number(0)
    //   ws.cell(2 + i, 15).number(0)
    //   ws.cell(2 + i, 16).number(0)
    //   ws.cell(2 + i, 17).number(0)
    // }

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = 'report-patient-sum-daily' + moment().format('x');
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
    })
  } catch (error) {
    res.send({ ok: false, error: error });
  }
})

router.get('/respirator', async (req: Request, res: Response) => {
  const db = req.dbReport
  const date = req.query.date
  const sector = req.query.sector

  var wb = new excel4node.Workbook()
  var ws = wb.addWorksheet('Sheet 1')

  var center = wb.createStyle({
    alignment: {
      wrapText: true,
      horizontal: 'center',
    },
  })
  var right = wb.createStyle({
    alignment: {
      wrapText: true,
      horizontal: 'right',
    },
  })

  try {
    // const rs: any = await model.patientReportAdmit(db, date, sector);

    ws.cell(1, 1, 2, 1, true).string('เขตสุขภาพ').style(center)
    ws.cell(1, 2, 2, 2, true).string('จังหวัด').style(center)
    ws.cell(1, 3, 2, 3, true).string('รหัสโรงพยาบาล').style(center)
    ws.cell(1, 4, 2, 4, true).string('โรงพยาบาล').style(center)

    ws.cell(1, 5, 1, 6, true).string('Non Invasive').style(center)
    ws.cell(1, 7, 1, 8, true).string('Invasive Ventilator').style(center)
    ws.cell(1, 9, 1, 10, true).string('High Flow').style(center)
    ws.cell(1, 11, 1, 12, true).string('PAPR').style(center)
    ws.cell(1, 13, 2, 14, true).string('หน่วยงาน').style(center)

    let use = 5
    let all = 6

    for (let i = 0; i < 4; i++) {
      ws.cell(2, use).string('ใช้กับผู้ป่วย').style(center)
      ws.cell(2, all).string('ทั้งหมด').style(center)

      use += 2
      all += 2
    }

    // for (let i = 0; i < rs.length; i++) {
    //   ws.cell(2 + i, 1).string(rs[i].zone_code).style(center)
    //   ws.cell(2 + i, 2).string(rs[i].province_name).style(center)
    //   ws.cell(2 + i, 3).string(rs[i].hospcode).style(center)
    //   ws.cell(2 + i, 4).string(rs[i].hospname).style(center)
    //   ws.cell(2 + i, 5).number(0)
    //   ws.cell(2 + i, 6).number(0)
    //   ws.cell(2 + i, 7).number(0)
    //   ws.cell(2 + i, 8).number(0)
    //   ws.cell(2 + i, 9).number(0)
    //   ws.cell(2 + i, 10).number(0)
    //   ws.cell(2 + i, 11).number(0)
    //   ws.cell(2 + i, 12).number(0)
    //   ws.cell(2 + i, 13).number(0)
    //   ws.cell(2 + i, 14).number(0)
    //   ws.cell(2 + i, 15).number(0)
    //   ws.cell(2 + i, 16).number(0)
    //   ws.cell(2 + i, 17).number(0)
    // }

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = 'report-respirator' + moment().format('x');
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
    })
  } catch (error) {
    res.send({ ok: false, error: error });
  }
})

export default router;
