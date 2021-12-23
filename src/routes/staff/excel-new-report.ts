import { Router, Request, Response } from 'express';
import { sumBy } from 'lodash';
import { ReportAllModel } from '../../models/new-report-all';
import { ReportModel } from '../../models/new-report';
const excel4node = require('excel4node');
const path = require('path')
const fse = require('fs-extra');
import moment = require('moment');
import console = require('console');

const model = new ReportAllModel();
const reportModel = new ReportModel();
const router: Router = Router();

function getAge (value) {
  const now =  moment()
  const dateBirth = moment(value)
  return now.diff(dateBirth, 'years')
}

function formatDate (value) {
  return moment(value).format('DD-MM-YYYY')
}

const mapPersonsGenerics = (genericsPersons: any[], cases: any[]) => {
  let results = genericsPersons
  results = cases.map((eachCase) => {
    const found = results.filter((result) => result.covid_case_detail_id === eachCase.detail_id)

    const obj = {}
    found.forEach((each) => {
      obj[each.name] = each.qty
    })

    const today = moment()
    const birthDate = moment(eachCase.birth_date)
    const age = today.diff(birthDate, 'year')

    const notUpdated = today.diff(moment(eachCase.update_date), 'day')

    return { ...eachCase, ...obj, age, notUpdated }
  })

  return results
}

const mapBedReports = (raws: any[]) => {
  const results = []

  for (let index = 1; index <= 13; index++) {
    const indexString = index.toString().padStart(2, '0')
    const grouped = raws.filter((raw) => raw.zone_code === indexString)
    results.push(grouped)
  }

  return results
}

router.get('/admit-case', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const date = req.query.date || moment().format('YYYY-MM-DD');

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
    const [ cases, genericsPersons, headers ] = await Promise.all([
      reportModel.admitCase(db, date),
      reportModel.getPersonsGenerics(db, date),
      reportModel.getGenericNames(db)
    ])
    const results = mapPersonsGenerics(genericsPersons, cases)

    ws.column(2).setWidth(20)
    ws.column(3).setWidth(40)
    ws.column(7).setWidth(20)
    ws.column(8).setWidth(20)
    ws.column(13).setWidth(20)
    ws.column(23).setWidth(40)

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

    results.forEach((result, i) => {
      ws.cell(2 + i, 1).string(result.zone_code).style(center)
      ws.cell(2 + i, 2).string(result.province_name).style(center)
      ws.cell(2 + i, 3).string(result.hospname).style(center)
      ws.cell(2 + i, 4).string(result.hn).style(center)
      ws.cell(2 + i, 5).string(result.an).style(center)
      ws.cell(2 + i, 6).number(result.cid)
      ws.cell(2 + i, 7).string(result.first_name).style(center)
      ws.cell(2 + i, 8).string(result.last_name).style(center)
      ws.cell(2 + i, 9).string(result.gender).style(center)
      ws.cell(2 + i, 10).number(getAge(result.birth_date))
      ws.cell(2 + i, 11).string(formatDate(result.date_admit)).style(center)
      ws.cell(2 + i, 12).string(formatDate(result.create_date)).style(center)
      ws.cell(2 + i, 13).string(result.gcs_name || '-').style(center)
      ws.cell(2 + i, 14).string(result.bed_name || '-').style(center)
      ws.cell(2 + i, 15).string(result.supplies_name || '-').style(center)
      ws.cell(2 + i, 16).string(formatDate(result.update_date)).style(center)
      ws.cell(2 + i, 17).number(result.notUpdated || 0)
      ws.cell(2 + i, 18).string(result['Darunavir 600 mg.'] ? '✔️' : '❌').style(center)
      ws.cell(2 + i, 19).string(result['Lopinavir 200 mg. / Ritonavir 50 mg.'] ? '✔️' : '❌').style(center)
      ws.cell(2 + i, 20).string(result['Ritonavir 100 mg.'] ? '✔️' : '❌').style(center)
      ws.cell(2 + i, 21).string(result['Azithromycin 250 mg.'] ? '✔️' : '❌').style(center)
      ws.cell(2 + i, 22).string(result['Favipiravi'] ? '✔️' : '❌').style(center)
      ws.cell(2 + i, 23).string(result.sub_ministry_name || '-').style(center)
    })

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = 'admit-case' + moment().format('x');
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

router.get('/admit-case-summary', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const start = req.query.start || moment().format('YYYY-MM-DD');
  const end = req.query.end || moment().format('YYYY-MM-DD');

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
    const results = await reportModel.admitCaseSummary(db, { start, end })

    ws.cell(1,1).string('เขต').style(center)
    ws.cell(1,2).string('Admit').style(center)

    results.forEach((result, i) => {
      ws.cell(2 + i, 1).string(result.zone_code).style(center)
      ws.cell(2 + i, 2).number(result.admit)
    })

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = 'admit-case-summary' + moment().format('x');
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

router.get('/bed2', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const { zones, provinces, date, } = req.query;

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
    const rs: any = await model.getBedReportByZone(db, moment(date).format('YYYY-MM-DD'), { case: 'COVID', status: 'ADMIT', groupBy: 'h.id', zones, provinces });
    const results = mapBedReports(rs)
    const items = []

    results.forEach((result, i) => {
      result.forEach((x, j) => {
        if (!items.some(item => item.hospcode === x.hospcode)) {
          items.push({
            zone_code: x.zone_code,
            province_code: x.province_code,
            province_name: x.province_name,
            hospcode: x.hospcode,
            hospname: x.hospname,
            level: x.level,
            sub_ministry_name: x.sub_ministry_name
          })
        }

        const index = items.findIndex(item => item.hospcode === x.hospcode)
        if (index > -1) {
          if (x.bed_name === 'ระดับ3 ใส่ท่อและเครื่องช่วยหายใจ') {
            items[index].level3_total = x.total
            items[index].level3_used = x.used
          } else if (x.bed_name === 'ระดับ 2.2 Oxygen high flow') {
            items[index].level2_2_total = x.total
            items[index].level2_2_used = x.used
          } else if (x.bed_name === 'ระดับ 2.2 Oxygen high flow') {
            items[index].level2_2_total = x.total
            items[index].level2_2_used = x.used
          } else if (x.bed_name === 'ระดับ 2.1 Oxygen high low') {
            items[index].level2_1_total = x.total
            items[index].level2_1_used = x.used
          } else if (x.bed_name === 'ระดับ 1 ไม่ใช่ Oxygen') {
            items[index].level1_total = x.total
            items[index].level1_used = x.used
          } else if (x.bed_name === 'ระดับ 0 Home Isolation (stepdown)') {
            items[index].level0_total = x.total
            items[index].level0_used = x.used
          } else if (x.bed_name === 'Home Isolation') {
            items[index].home_isolation_total = x.total
            items[index].home_isolation_used = x.used
          } else if (x.bed_name === 'Community Isolation') {
            items[index].community_isolation_total = x.total
            items[index].community_isolation_used = x.used
          } else if (x.bed_name === 'AIIR') {
            items[index].aiir_total = x.total
            items[index].aiir_used = x.used
          } else if (x.bed_name === 'Modified AIIR') {
            items[index].modified_aiir_total = x.total
            items[index].modified_aiir_used = x.used
          } else if (x.bed_name === 'Isolate') {
            items[index].isolate_total = x.total
            items[index].isolate_used = x.used
          } else if (x.bed_name === 'Cohort') {
            items[index].cohort_total = x.total
            items[index].cohort_used = x.used
          } else if (x.bed_name === 'Hospitel') {
            items[index].hospitel_total = x.total
            items[index].hospitel_used = x.used
          } else if (x.bed_name === 'Cohort ICU') {
            items[index].cohort_icu_total = x.total
            items[index].cohort_icu_used = x.used
          }
        }
      })
    })

    ws.column(1).setWidth(40)
    ws.column(41).setWidth(40)

    ws.cell(1, 1, 2, 1, true).string('โรงยาบาล').style(center)

    ws.cell(1, 2, 1, 4, true).string('ระดับ 3 ใส่ท่อและเครื่องช่วยหายใจได้').style(center)
    ws.cell(1, 5, 1, 7, true).string('ระดับ 2.2 Oxygen high flow').style(center)
    ws.cell(1, 8, 1, 10, true).string('ระดับ 2.1 Oxygen low flow').style(center)
    ws.cell(1, 11, 1, 13, true).string('ระดับ 1 ไม่ใช้ Oxygen').style(center)
    ws.cell(1, 14, 1, 16, true).string('ระดับ 0 Home Isolation (stepdown)').style(center)
    ws.cell(1, 17, 1, 19, true).string('Home Isolation (New case)').style(center)
    ws.cell(1, 20, 1, 22, true).string('Community Isolation (New case)').style(center)
    ws.cell(1, 23, 1, 25, true).string('AIIR').style(center)
    ws.cell(1, 26, 1, 28, true).string('Modified AIIR').style(center)
    ws.cell(1, 29, 1, 31, true).string('Cohort ICU').style(center)
    ws.cell(1, 32, 1, 34, true).string('Isolate').style(center)
    ws.cell(1, 35, 1, 37, true).string('Cohort').style(center)
    ws.cell(1, 38, 1, 40, true).string('Hospitel').style(center)

    let all = 2
    let use = 3
    let left = 4

    for (let i = 0; i < 13; i++) {
      ws.cell(2, all).string('ทั้งหมด').style(center)
      ws.cell(2, use).string('ใช้ไป').style(center)
      ws.cell(2, left).string('คงเหลือ').style(center)

      all += 3
      use += 3
      left += 3
    }

    ws.cell(1, 41, 2, 41, true).string('สังกัด').style(center)

    items.forEach((item, i) => {
      ws.cell(3 + i, 1).string(item.hospname).style(center)
      ws.cell(3 + i, 2).number(item.level3_total || 0)
      ws.cell(3 + i, 3).number(item.level3_used || 0)
      ws.cell(3 + i, 4).number((item.level3_total || 0) - (item.level3_used || 0))
      ws.cell(3 + i, 5).number(item.level2_2_total || 0)
      ws.cell(3 + i, 6).number(item.level2_2_used || 0)
      ws.cell(3 + i, 7).number((item.level2_2_total || 0) - (item.level2_2_used || 0))
      ws.cell(3 + i, 8).number(item.level2_1_total || 0)
      ws.cell(3 + i, 9).number(item.level2_1_used || 0)
      ws.cell(3 + i, 10).number((item.level2_1_total || 0) - (item.level2_1_used || 0))
      ws.cell(3 + i, 11).number(item.level1_total || 0)
      ws.cell(3 + i, 12).number(item.level1_used || 0)
      ws.cell(3 + i, 13).number((item.level1_total || 0) - (item.level1_used || 0))
      ws.cell(3 + i, 14).number(item.level0_total || 0)
      ws.cell(3 + i, 15).number(item.level0_used || 0)
      ws.cell(3 + i, 16).number((item.level0_total || 0) - (item.level0_used || 0))
      ws.cell(3 + i, 17).number(item.home_isolation_total || 0)
      ws.cell(3 + i, 18).number(item.home_isolation_used || 0)
      ws.cell(3 + i, 19).number((item.home_isolation_total || 0) - (item.home_isolation_used || 0))
      ws.cell(3 + i, 20).number(item.community_isolation_total || 0)
      ws.cell(3 + i, 21).number(item.community_isolation_used || 0)
      ws.cell(3 + i, 22).number((item.community_isolation_total || 0) - (item.community_isolation_used || 0))
      ws.cell(3 + i, 23).number(item.aiir_total || 0)
      ws.cell(3 + i, 24).number(item.aiir_used || 0)
      ws.cell(3 + i, 25).number((item.aiir_total || 0) - (item.aiir_used || 0))
      ws.cell(3 + i, 26).number(item.modified_aiir_total || 0)
      ws.cell(3 + i, 27).number(item.modified_aiir_used || 0)
      ws.cell(3 + i, 28).number((item.modified_aiir_total || 0) - (item.modified_aiir_used || 0))
      ws.cell(3 + i, 29).number(item.cohort_icu_total || 0)
      ws.cell(3 + i, 30).number(item.cohort_icu_used || 0)
      ws.cell(3 + i, 31).number((item.cohort_icu_total || 0) - (item.cohort_icu_used || 0))
      ws.cell(3 + i, 32).number(item.isolate_total || 0)
      ws.cell(3 + i, 33).number(item.isolate_used || 0)
      ws.cell(3 + i, 34).number((item.isolate_total || 0) - (item.isolate_used || 0))
      ws.cell(3 + i, 35).number(item.cohort_total || 0)
      ws.cell(3 + i, 36).number(item.cohort_used || 0)
      ws.cell(3 + i, 37).number((item.cohort_total || 0) - (item.cohort_used || 0))
      ws.cell(3 + i, 38).number(item.hospitel_total || 0)
      ws.cell(3 + i, 39).number(item.hospitel_used || 0)
      ws.cell(3 + i, 40).number((item.hospitel_total || 0) - (item.hospitel_used || 0))
      ws.cell(3 + i, 41).string(item.sub_ministry_name || '-').style(center)
    })

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = 'bed2' + moment().format('x');
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
