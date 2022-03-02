import * as HttpStatus from 'http-status-codes';
import { Router, Request, Response } from 'express';
import { sumBy, uniqBy, filter, findIndex } from 'lodash';
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

function getAge(value) {
  const now = moment()
  const dateBirth = moment(value)
  return now.diff(dateBirth, 'years')
}

function formatDate(value) {
  if (value) {
    return moment(value).format('DD-MM-YYYY')
  } else {
    return '-';
  }
}

// function checkExistingZone (items) {
//   let check = false
//   items.forEach((item) => {
//     if (item.length) {
//       check = true
//     }
//   })
//   return check
// }

function countExistingZone(items) {
  let count = 0
  items.forEach((item) => {
    if (item.length) {
      count++
    }
  })
  return count
}

function sumField(value) {
  let sum = 0
  const keys = Object.keys(value)
  keys.forEach(key => {
    if (key !== 'zone_code') {
      if (value[key] !== null && value[key] !== undefined) {
        sum += value[key]
      }
    }
  })
  return sum
}

function sumZone(items, value) {
  return sumBy(items, value)
}

function sum12Zone(items, value) {
  return +sumBy(items, value) - +items[12][value]
}

function sumAllZone(items, value) {
  return sumBy(items, value)
}

function sum12ZoneByProvince(items, value) {
  let sum = 0
  items.forEach(item => {
    sum += sumBy(item, value) || 0
  })
  return sum - (items[12].length ? items[12][0][value] : 0)
}

function sumAllZoneByProvince(items, value) {
  let sum = 0
  items.forEach(item => {
    sum += sumBy(item, value) || 0
  })
  return sum
}

const mapPatientReportByZone = (normalCases: any[], deathCases: any[], puiCases: any[], atkCases: any[]) => {
  const results = []
  for (let index = 1; index <= 13; index++) {
    const zoneCodeString = (index + '').padStart(2, '0')
    const obj = { zoneCode: zoneCodeString }
    const normalCaseFounds = normalCases.filter((each) => each.zone_code === zoneCodeString)
    const puiCaseFounds = puiCases.filter((each) => each.zone_code === zoneCodeString)
    const atkCaseFounds = atkCases.filter((each) => each.zone_code === zoneCodeString)
    const deathCasesFounds = deathCases.filter((each) => each.zone_code === zoneCodeString)

    let normalCaseAmount = 0

    normalCaseFounds.forEach((each) => {
      const field = each.gcs_name.toLowerCase().split(' ').join('_')
      obj[field] = each.count
      normalCaseAmount += each.count
    })

    const deathCaseAmount = deathCasesFounds.reduce((total, acc) => total + acc.count, 0);
    const puiCaseAmount = puiCaseFounds.reduce((total, acc) => total + acc.count, 0);
    const atkCaseAmount = atkCaseFounds.reduce((total, acc) => total + acc.count, 0);
    obj['death'] = deathCaseAmount
    obj['pui'] = puiCaseAmount
    obj['atk'] = atkCaseAmount
    obj['total'] = normalCaseAmount + deathCaseAmount + puiCaseAmount + atkCaseAmount

    results.push(obj)
  }

  return results
}

const removeDupProvinceHeaders = (normalCases: any[], deathCases: any[], puiCases: any[], atkCases: any[]) => {
  const results = []
  normalCases.forEach((each) => {
    if (!results.some((result) => result.province_code === each.province_code)) {
      results.push({ province_code: each.province_code, province_name: each.province_name, zone_code: each.zone_code })
    }
  })

  deathCases.forEach((each) => {
    if (!results.some((result) => result.province_code === each.province_code)) {
      results.push({ province_code: each.province_code, province_name: each.province_name, zone_code: each.zone_code })
    }
  })

  puiCases.forEach((each) => {
    if (!results.some((result) => result.province_code === each.province_code)) {
      results.push({ province_code: each.province_code, province_name: each.province_name, zone_code: each.zone_code })
    }
  })

  atkCases.forEach((each) => {
    if (!results.some((result) => result.province_code === each.province_code)) {
      results.push({ province_code: each.province_code, province_name: each.province_name, zone_code: each.zone_code })
    }
  })

  return results
}

const mapPatientReportByProvince = (normalCases: any[], deathCases: any[], puiCases: any[], atkCases: any[]) => {
  const results = []

  const provinces = removeDupProvinceHeaders(normalCases, deathCases, puiCases, atkCases)
  provinces.forEach((province) => {
    const { province_code, province_name, zone_code } = province
    const obj = { province_code, province_name, zone_code }

    const normalCaseFounds = normalCases.filter((each) => each.province_code === province_code)
    const puiCaseFounds = puiCases.filter((each) => each.province_code === province_code)
    const atkCaseFounds = atkCases.filter((each) => each.province_code === province_code)
    const deathCasesFounds = deathCases.filter((each) => each.province_code === province_code)

    let normalCaseAmount = 0

    normalCaseFounds.forEach((each) => {
      const field = each.gcs_name.toLowerCase().split(' ').join('_')
      obj[field] = each.count
      normalCaseAmount += each.count
    })

    const deathCaseAmount = deathCasesFounds.reduce((total, acc) => total + acc.count, 0)
    const puiCaseAmount = puiCaseFounds.reduce((total, acc) => total + acc.count, 0)
    const atkCaseAmount = atkCaseFounds.reduce((total, acc) => total + acc.count, 0)
    obj['death'] = deathCaseAmount
    obj['pui'] = puiCaseAmount
    obj['atk'] = atkCaseAmount
    obj['total'] = normalCaseAmount + deathCaseAmount + puiCaseAmount + atkCaseAmount

    results.push(obj)
  })

  return results
}

const removeDupHospitalHeaders = (normalCases: any[], deathCases: any[], puiCases: any[], atkCases: any[]) => {
  const results = []

  normalCases.forEach((each) => {
    if (!results.some((result) => result.id === each.id)) {
      results.push({
        id: each.id,
        province_name: each.province_name,
        province_code: each.province_code,
        zone_code: each.zone_code,
        hospname: each.hospname,
        hospcode: each.hospcode,
        sub_ministry_name: each.sub_ministry_name,
        level: each.level
      })
    }
  })

  deathCases.forEach((each) => {
    if (!results.some((result) => result.id === each.id)) {
      results.push({
        id: each.id,
        province_name: each.province_name,
        province_code: each.province_code,
        zone_code: each.zone_code,
        hospname: each.hospname,
        hospcode: each.hospcode,
        sub_ministry_name: each.sub_ministry_name,
        level: each.level
      })
    }
  })

  puiCases.forEach((each) => {
    if (!results.some((result) => result.id === each.id)) {
      results.push({
        id: each.id,
        province_name: each.province_name,
        province_code: each.province_code,
        zone_code: each.zone_code,
        hospname: each.hospname,
        hospcode: each.hospcode,
        sub_ministry_name: each.sub_ministry_name,
        level: each.level
      })
    }
  })

  atkCases.forEach((each) => {
    if (!results.some((result) => result.id === each.id)) {
      results.push({
        id: each.id,
        province_name: each.province_name,
        province_code: each.province_code,
        zone_code: each.zone_code,
        hospname: each.hospname,
        hospcode: each.hospcode,
        sub_ministry_name: each.sub_ministry_name,
        level: each.level
      })
    }
  })

  return results
}

const mapPatientReportByHospital = (normalCases: any[], medicalCases: any[], deathCases: any[], puiCases: any[], atkCases: any[]) => {
  const results = []

  const provinces = removeDupHospitalHeaders(normalCases, deathCases, puiCases, atkCases)
  provinces.forEach((province) => {
    const { id, hospcode, hospname, province_name, province_code, zone_code, sub_ministry_name, level } = province
    const obj = { id, hospcode, hospname, province_name, zone_code, sub_ministry_name, level, province_code }

    const normalCaseFounds = normalCases.filter((each) => each.id === id)
    const medicalCasesFounds = medicalCases.filter((each) => each.id === id)
    const puiCaseFounds = puiCases.filter((each) => each.id === id)
    const atkCaseFounds = atkCases.filter((each) => each.id === id)
    const deathCasesFounds = deathCases.filter((each) => each.id === id)

    let normalCaseAmount = 0

    normalCaseFounds.forEach((each) => {
      const field = each.gcs_name.toLowerCase().split(' ').join('_')
      obj[field] = each.count
      normalCaseAmount += each.count
    })

    medicalCasesFounds.forEach((each) => {
      if (each.ms_name) {
        const field = each.ms_name?.toLowerCase().split(' ').join('_')
        obj[field] = each.count
      }
    })

    const deathCaseAmount = deathCasesFounds.reduce((total, acc) => total + acc.count, 0)
    const puiCaseAmount = puiCaseFounds.reduce((total, acc) => total + acc.count, 0)
    const atkCaseAmount = atkCaseFounds.reduce((total, acc) => total + acc.count, 0)
    obj['death'] = deathCaseAmount
    obj['pui'] = puiCaseAmount
    obj['atk'] = atkCaseAmount
    obj['total'] = normalCaseAmount + deathCaseAmount + puiCaseAmount + atkCaseAmount

    results.push(obj)
  })

  return results
}

const mapPatientsResult = (total: any[], today: any[]) => {
  const result = total.map((each) => {
    const found = today.find(item => each.hospital_id === item.hospital_id)
    if (found) {
      return {
        ...each,
        today_admit: found.admit,
        today_discharge: found.discharge,
        today_discharge_hospitel: found.discharge_hospitel,
        today_discharge_death: found.discharge_death,
        today_pui_admit: found.pui_admit,
        today_pui_discharge: found.pui_discharge,
        today_pui_discharge_hospitel: found.pui_discharge_hospitel,
        today_pui_discharge_death: found.pui_discharge_death,
      }
    }

    return {
      ...each,
      today_admit: 0,
      today_discharge: 0,
      today_discharge_hospitel: 0,
      today_discharge_death: 0,
      today_pui_admit: 0,
      today_pui_discharge: 0,
      today_pui_discharge_hospitel: 0,
      today_pui_discharge_death: 0,
    }
  })

  return result
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

const mapDischargeSummary = (raws: any[]) => {
  const results = []

  raws.forEach((raw) => {
    const foundIndex = results.findIndex((result) => result.zone_code === raw.zone_code)
    let obj = { zone_code: raw.zone_code }
    obj[raw.status] = raw.count

    if (foundIndex === -1) {
      results.push(obj)
    } else {
      results[foundIndex][raw.status] = raw.count
    }
  })

  return results
}

router.get('/patient-report-by-zone', async (req: Request, res: Response) => {
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
    const [headers, cases, deathCases, puiCases, atkCases] = await Promise.all([
      model.getPatientsReportHeaders(db),
      model.getPatientsCases(db, moment(date).format('YYYY-MM-DD'), { case: 'COVID', status: 'ADMIT', groupBy: 'h.zone_code', zones: [], provinces: [] }),
      model.getPatientsCases(db, moment(date).format('YYYY-MM-DD'), { case: 'COVID', status: 'DEATH', groupBy: 'h.zone_code', zones: [], provinces: [] }),
      model.getPatientsCases(db, moment(date).format('YYYY-MM-DD'), { case: 'IPPUI', status: 'ADMIT', groupBy: 'h.zone_code', zones: [], provinces: [] }),
      model.getPatientsCases(db, moment(date).format('YYYY-MM-DD'), { case: 'ATK', status: 'ADMIT', groupBy: 'h.zone_code', zones: [], provinces: [] })
    ])

    const result = mapPatientReportByZone(cases, deathCases, puiCases, atkCases)

    ws.column(1).setWidth(20)

    ws.cell(1, 1).string('เขตสุขภาพ').style(center)
    ws.cell(1, 2).string('ผู้ป่วยทั้งหมด').style(center)
    ws.cell(1, 3).string('Severe').style(center)
    ws.cell(1, 4).string('Moderate').style(center)
    ws.cell(1, 5).string('Mild').style(center)
    ws.cell(1, 6).string('Asymptomatic').style(center)
    ws.cell(1, 7).string('Invasive Ventilator').style(center)
    ws.cell(1, 8).string('Non-Invasive Ventilator').style(center)
    ws.cell(1, 9).string('High flow').style(center)
    ws.cell(1, 10).string('Dead').style(center)
    ws.cell(1, 11).string('PUI').style(center)
    ws.cell(1, 12).string('ATK').style(center)

    // ws.cell(1, 1).string('เขตสุขภาพ').style(center)
    // ws.cell(1, 2).string('ผู้ป่วยทั้งหมด').style(center)
    // ws.cell(1, 3).string('Severe').style(center)
    // ws.cell(1, 4).string('Invasive Ventilator').style(center)
    // ws.cell(1, 5).string('Non-Invasive Ventilator').style(center)
    // ws.cell(1, 6).string('High flow').style(center)
    // ws.cell(1, 7).string('Moderate').style(center)
    // ws.cell(1, 8).string('Mild').style(center)
    // ws.cell(1, 9).string('Asymptomatic').style(center)
    // ws.cell(1, 10).string('Dead').style(center)
    // ws.cell(1, 11).string('PUI').style(center)

    result.forEach((row, i) => {
      if (row.zoneCode !== '13') {
        ws.cell(2 + i, 1).string('รวมเขต ' + row.zoneCode).style(center)
      } else {
        ws.cell(2 + i, 1).string('กรุงเทพมหานคร').style(center)
      }
      ws.cell(2 + i, 2).number(row.total || 0)
      ws.cell(2 + i, 3).number(row.severe || 0)
      ws.cell(2 + i, 4).number(row.moderate || 0)
      ws.cell(2 + i, 5).number(row.mild || 0)
      ws.cell(2 + i, 6).number(row.asymptomatic || 0)
      ws.cell(2 + i, 7).number(row.invasive || 0)
      ws.cell(2 + i, 8).number(row.nonInvasive || 0)
      ws.cell(2 + i, 9).number(row.highFlow || 0)
      ws.cell(2 + i, 10).number(row.death || 0)
      ws.cell(2 + i, 11).number(row.pui || 0)
      ws.cell(2 + i, 12).number(row.atk || 0)
    })

    ws.cell(15, 1).string('รวม 12 เขต').style(center)
    ws.cell(15, 2).number(sum12Zone(result, 'total') || 0)
    ws.cell(15, 3).number(sum12Zone(result, 'severe') || 0)
    ws.cell(15, 4).number(sum12Zone(result, 'invasive') || 0)
    ws.cell(15, 5).number(sum12Zone(result, 'moderate') || 0)
    ws.cell(15, 6).number(sum12Zone(result, 'mild') || 0)
    ws.cell(15, 7).number(sum12Zone(result, 'asymptomatic') || 0)
    ws.cell(15, 8).number(sum12Zone(result, 'nonInvasive') || 0)
    ws.cell(15, 9).number(sum12Zone(result, 'highFlow') || 0)
    ws.cell(15, 10).number(sum12Zone(result, 'death') || 0)
    ws.cell(15, 11).number(sum12Zone(result, 'pui') || 0)
    ws.cell(15, 12).number(sum12Zone(result, 'atk') || 0)

    ws.cell(16, 1).string('ทั่วประเทศ').style(center)
    ws.cell(16, 2).number(sumAllZone(result, 'total') || 0)
    ws.cell(16, 3).number(sumAllZone(result, 'severe') || 0)
    ws.cell(16, 4).number(sumAllZone(result, 'moderate') || 0)
    ws.cell(16, 5).number(sumAllZone(result, 'mild') || 0)
    ws.cell(16, 6).number(sumAllZone(result, 'asymptomatic') || 0)
    ws.cell(16, 7).number(sumAllZone(result, 'invasive') || 0)
    ws.cell(16, 8).number(sumAllZone(result, 'nonInvasive') || 0)
    ws.cell(16, 9).number(sumAllZone(result, 'highFlow') || 0)
    ws.cell(16, 10).number(sumAllZone(result, 'death') || 0)
    ws.cell(16, 11).number(sumAllZone(result, 'pui') || 0)
    ws.cell(16, 12).number(sumAllZone(result, 'atk') || 0)

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
  const db = req.dbReport;
  const { zones, date } = req.query;

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
    const [headers, cases, deathCases, puiCases, atkCases] = await Promise.all([
      model.getPatientsReportHeaders(db),
      model.getPatientsCases(db, moment(date).format('YYYY-MM-DD'), { case: 'COVID', status: 'ADMIT', groupBy: 'h.province_code', zones, provinces: [] }),
      model.getPatientsCases(db, moment(date).format('YYYY-MM-DD'), { case: 'COVID', status: 'DEATH', groupBy: 'h.province_code', zones, provinces: [] }),
      model.getPatientsCases(db, moment(date).format('YYYY-MM-DD'), { case: 'IPPUI', status: 'ADMIT', groupBy: 'h.province_code', zones, provinces: [] }),
      model.getPatientsCases(db, moment(date).format('YYYY-MM-DD'), { case: 'ATK', status: 'ADMIT', groupBy: 'h.province_code', zones, provinces: [] })
    ])
    const result = mapPatientReportByProvince(cases, deathCases, puiCases, atkCases)
    const items = [
      [], [], [], [], [],
      [], [], [], [], [],
      [], [], []
    ]
    let rowNumber = 2

    result.forEach(item => {
      if (item.zone_code === '01') {
        items[0].push(item)
      } else if (item.zone_code === '02') {
        items[1].push(item)
      } else if (item.zone_code === '03') {
        items[2].push(item)
      } else if (item.zone_code === '04') {
        items[3].push(item)
      } else if (item.zone_code === '05') {
        items[4].push(item)
      } else if (item.zone_code === '06') {
        items[5].push(item)
      } else if (item.zone_code === '07') {
        items[6].push(item)
      } else if (item.zone_code === '08') {
        items[7].push(item)
      } else if (item.zone_code === '09') {
        items[8].push(item)
      } else if (item.zone_code === '10') {
        items[9].push(item)
      } else if (item.zone_code === '11') {
        items[10].push(item)
      } else if (item.zone_code === '12') {
        items[11].push(item)
      } else {
        items[12].push(item)
      }
    })

    ws.cell(1, 1).string('เขตสุขภาพ').style(center)
    ws.cell(1, 2).string('จังหวัด').style(center)
    ws.cell(1, 3).string('ผู้ป่วยทั้งหมด').style(center)
    ws.cell(1, 4).string('Severe').style(center)
    ws.cell(1, 5).string('Invasive Ventilator').style(center)
    ws.cell(1, 6).string('Non-Invasive Ventilator').style(center)
    ws.cell(1, 7).string('High flow').style(center)
    ws.cell(1, 8).string('Moderate').style(center)
    ws.cell(1, 9).string('Mild').style(center)
    ws.cell(1, 10).string('Asymptomatic').style(center)
    ws.cell(1, 11).string('Dead').style(center)
    ws.cell(1, 12).string('PUI').style(center)
    ws.cell(1, 13).string('ATK').style(center)

    items.forEach((item, i) => {
      item.forEach((x, j) => {
        if (x.zone_code !== '13') {
          ws.cell(rowNumber, 1).string(x.zone_code).style(center)
          ws.cell(rowNumber, 2).string(x.province_name)
          ws.cell(rowNumber, 3).number(x.total || 0)
          ws.cell(rowNumber, 4).number(x.severe || 0)
          ws.cell(rowNumber, 5).number(x.invasive || 0)
          ws.cell(rowNumber, 6).number(x.non_invasive || 0)
          ws.cell(rowNumber, 7).number(x.high_flow || 0)
          ws.cell(rowNumber, 8).number(x.moderate || 0)
          ws.cell(rowNumber, 9).number(x.mild || 0)
          ws.cell(rowNumber, 10).number(x.asymptomatic || 0)
          ws.cell(rowNumber, 11).number(x.death || 0)
          ws.cell(rowNumber, 12).number(x.pui || 0)
          ws.cell(rowNumber, 13).number(x.atk || 0)
        } else {
          ws.cell(rowNumber, 1, rowNumber, 2, true).string(x.province_name).style(center)
          ws.cell(rowNumber, 3).number(x.total || 0)
          ws.cell(rowNumber, 4).number(x.severe || 0)
          ws.cell(rowNumber, 5).number(x.invasive || 0)
          ws.cell(rowNumber, 6).number(x.non_invasive || 0)
          ws.cell(rowNumber, 7).number(x.high_flow || 0)
          ws.cell(rowNumber, 8).number(x.moderate || 0)
          ws.cell(rowNumber, 9).number(x.mild || 0)
          ws.cell(rowNumber, 10).number(x.asymptomatic || 0)
          ws.cell(rowNumber, 11).number(x.death || 0)
          ws.cell(rowNumber, 12).number(x.pui || 0)
          ws.cell(rowNumber, 13).number(x.atk || 0)
        }
        rowNumber++
      })

      if (items[i].length && items[i][0].zone_code !== '13') {
        ws.cell(rowNumber, 1, rowNumber, 2, true).string(`รวมเขต ${items[i][0].zone_code}`).style(center)
        ws.cell(rowNumber, 3).number(sumZone(item, 'total') || 0)
        ws.cell(rowNumber, 4).number(sumZone(item, 'severe') || 0)
        ws.cell(rowNumber, 5).number(sumZone(item, 'invasive') || 0)
        ws.cell(rowNumber, 6).number(sumZone(item, 'non_invasive') || 0)
        ws.cell(rowNumber, 7).number(sumZone(item, 'high_flow') || 0)
        ws.cell(rowNumber, 8).number(sumZone(item, 'moderate') || 0)
        ws.cell(rowNumber, 9).number(sumZone(item, 'mild') || 0)
        ws.cell(rowNumber, 10).number(sumZone(item, 'asymptomatic') || 0)
        ws.cell(rowNumber, 11).number(sumZone(item, 'death') || 0)
        ws.cell(rowNumber, 12).number(sumZone(item, 'pui') || 0)
        ws.cell(rowNumber, 13).number(sumZone(item, 'atk') || 0)
        rowNumber++
      }
    })

    if (countExistingZone(items) >= 12) {
      ws.cell(rowNumber, 1, rowNumber, 2, true).string('รวม 12 เขต').style(center)
      ws.cell(rowNumber, 3).number(sum12ZoneByProvince(items, 'total') || 0)
      ws.cell(rowNumber, 4).number(sum12ZoneByProvince(items, 'severe') || 0)
      ws.cell(rowNumber, 5).number(sum12ZoneByProvince(items, 'invasive') || 0)
      ws.cell(rowNumber, 6).number(sum12ZoneByProvince(items, 'non_invasive') || 0)
      ws.cell(rowNumber, 7).number(sum12ZoneByProvince(items, 'high_flow') || 0)
      ws.cell(rowNumber, 8).number(sum12ZoneByProvince(items, 'moderate') || 0)
      ws.cell(rowNumber, 9).number(sum12ZoneByProvince(items, 'mild') || 0)
      ws.cell(rowNumber, 10).number(sum12ZoneByProvince(items, 'asymptomatic') || 0)
      ws.cell(rowNumber, 11).number(sum12ZoneByProvince(items, 'death') || 0)
      ws.cell(rowNumber, 12).number(sum12ZoneByProvince(items, 'pui') || 0)
      ws.cell(rowNumber, 13).number(sum12ZoneByProvince(items, 'atk') || 0)
      rowNumber++
    }

    if (countExistingZone(items) > 12) {
      ws.cell(rowNumber, 1, rowNumber, 2, true).string('ทั่วประเทศ').style(center)
      ws.cell(rowNumber, 3).number(sumAllZoneByProvince(items, 'total') || 0)
      ws.cell(rowNumber, 4).number(sumAllZoneByProvince(items, 'severe') || 0)
      ws.cell(rowNumber, 5).number(sumAllZoneByProvince(items, 'invasive') || 0)
      ws.cell(rowNumber, 6).number(sumAllZoneByProvince(items, 'non_invasive') || 0)
      ws.cell(rowNumber, 7).number(sumAllZoneByProvince(items, 'high_flow') || 0)
      ws.cell(rowNumber, 8).number(sumAllZoneByProvince(items, 'moderate') || 0)
      ws.cell(rowNumber, 9).number(sumAllZoneByProvince(items, 'mild') || 0)
      ws.cell(rowNumber, 10).number(sumAllZoneByProvince(items, 'asymptomatic') || 0)
      ws.cell(rowNumber, 11).number(sumAllZoneByProvince(items, 'death') || 0)
      ws.cell(rowNumber, 12).number(sumAllZoneByProvince(items, 'pui') || 0)
      ws.cell(rowNumber, 13).number(sumAllZoneByProvince(items, 'atk') || 0)
    }

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
  const db = req.dbReport;
  const { date } = req.query;

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
    const rs: any = await model.getBedReportByZone(db, moment(date).format('YYYY-MM-DD'), { case: null, status: 'ADMIT', groupBy: 'h.zone_code', zones: [], provinces: [] });
    const results = mapBedReports(rs)
    const items = []

    // console.log('results', results)

    results.forEach((result, i) => {
      result.forEach((x, j) => {
        if (!items.some(item => item.zone_code === x.zone_code)) {
          items.push({
            zone_code: x.zone_code
          })
        }

        const index = items.findIndex(item => item.zone_code === x.zone_code)
        if (index > -1) {
          if (x.bed_id === 14) {
            items[index].level3_total = x.total
            items[index].level3_used = x.used
          } else if (x.bed_id === 13) {
            items[index].level22_total = x.total
            items[index].level22_used = x.used
          } else if (x.bed_id === 12) {
            items[index].level21_total = x.total
            items[index].level21_used = x.used
          } else if (x.bed_id === 11) {
            items[index].level1_total = x.total
            items[index].level1_used = x.used
          } else if (x.bed_id === 10) {
            items[index].level0_total = x.total
            items[index].level0_used = x.used
          } else if (x.bed_id === 8) {
            items[index].home_isolation_total = x.total
            items[index].home_isolation_used = x.used
          } else if (x.bed_id === 9) {
            items[index].community_isolation_total = x.total
            items[index].community_isolation_used = x.used
          }
        }
      })
    })

    ws.column(1).setWidth(20)

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

    items.forEach((item, i) => {
      if (item.zone_code !== '13') {
        ws.cell(3 + i, 1).string('รวมเขต ' + item.zone_code).style(center)
      } else {
        ws.cell(3 + i, 1).string('กรุงเทพมหานคร').style(center)
      }
      ws.cell(3 + i, 2).number(item.level3_total || 0)
      ws.cell(3 + i, 3).number(item.level3_used || 0)
      ws.cell(3 + i, 4).number((item.level3_total || 0) - (item.level3_used || 0))
      ws.cell(3 + i, 5).number(item.level22_total || 0)
      ws.cell(3 + i, 6).number(item.level22_used || 0)
      ws.cell(3 + i, 7).number((item.level22_total || 0) - (item.level22_used || 0))
      ws.cell(3 + i, 8).number(item.level21_total || 0)
      ws.cell(3 + i, 9).number(item.level21_used || 0)
      ws.cell(3 + i, 10).number((item.level21_total || 0) - (item.level21_used || 0))
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
    })


    // if (countExistingZone(items) >= 12) {
    ws.cell(16, 1).string('รวม 12 เขต').style(center)
    ws.cell(16, 2).number(sum12Zone(items, 'level3_total') || 0)
    ws.cell(16, 3).number(sum12Zone(items, 'level3_used') || 0)
    ws.cell(16, 4).number((sum12Zone(items, 'level3_total') || 0) - (sum12Zone(items, 'level3_used') || 0))
    ws.cell(16, 5).number(sum12Zone(items, 'level22_total') || 0)
    ws.cell(16, 6).number(sum12Zone(items, 'level22_used') || 0)
    ws.cell(16, 7).number((sum12Zone(items, 'level22_total') || 0) - (sum12Zone(items, 'level22_used') || 0))
    ws.cell(16, 8).number(sum12Zone(items, 'level21_total') || 0)
    ws.cell(16, 9).number(sum12Zone(items, 'level21_used') || 0)
    ws.cell(16, 10).number((sum12Zone(items, 'level21_total') || 0) - (sum12Zone(items, 'level21_used') || 0))
    ws.cell(16, 11).number(sum12Zone(items, 'level1_total') || 0)
    ws.cell(16, 12).number(sum12Zone(items, 'level1_used') || 0)
    ws.cell(16, 13).number((sum12Zone(items, 'level1_total') || 0) - (sum12Zone(items, 'level1_used') || 0))
    ws.cell(16, 14).number(sum12Zone(items, 'level0_total') || 0)
    ws.cell(16, 15).number(sum12Zone(items, 'level0_used') || 0)
    ws.cell(16, 16).number((sum12Zone(items, 'level0_total') || 0) - (sum12Zone(items, 'level0_used') || 0))
    ws.cell(16, 17).number(sum12Zone(items, 'home_isolation_total') || 0)
    ws.cell(16, 18).number(sum12Zone(items, 'home_isolation_used') || 0)
    ws.cell(16, 19).number((sum12Zone(items, 'home_isolation_total') || 0) - (sum12Zone(items, 'home_isolation_used') || 0))
    ws.cell(16, 20).number(sum12Zone(items, 'community_isolation_total') || 0)
    ws.cell(16, 21).number(sum12Zone(items, 'community_isolation_used') || 0)
    ws.cell(16, 22).number((sum12Zone(items, 'community_isolation_total') || 0) - (sum12Zone(items, 'community_isolation_used') || 0))
    // }

    // if (countExistingZone(items) > 12) {
    ws.cell(17, 1).string('ทั่วประเทศ').style(center)
    ws.cell(17, 2).number(sumAllZone(items, 'level3_total') || 0)
    ws.cell(17, 3).number(sumAllZone(items, 'level3_used') || 0)
    ws.cell(17, 4).number((sumAllZone(items, 'level3_total') || 0) - (sumAllZone(items, 'level3_used') || 0))
    ws.cell(17, 5).number(sumAllZone(items, 'level22_total') || 0)
    ws.cell(17, 6).number(sumAllZone(items, 'level22_used') || 0)
    ws.cell(17, 7).number((sumAllZone(items, 'level22_total') || 0) - (sumAllZone(items, 'level22_used') || 0))
    ws.cell(17, 8).number(sumAllZone(items, 'level21_total') || 0)
    ws.cell(17, 9).number(sumAllZone(items, 'level21_used') || 0)
    ws.cell(17, 10).number((sumAllZone(items, 'level21_total') || 0) - (sumAllZone(items, 'level21_used') || 0))
    ws.cell(17, 11).number(sumAllZone(items, 'level1_total') || 0)
    ws.cell(17, 12).number(sumAllZone(items, 'level1_used') || 0)
    ws.cell(17, 13).number((sumAllZone(items, 'level1_total') || 0) - (sumAllZone(items, 'level1_used') || 0))
    ws.cell(17, 14).number(sumAllZone(items, 'level0_total') || 0)
    ws.cell(17, 15).number(sumAllZone(items, 'level0_used') || 0)
    ws.cell(17, 16).number((sumAllZone(items, 'level0_total') || 0) - (sumAllZone(items, 'level0_used') || 0))
    ws.cell(17, 17).number(sumAllZone(items, 'home_isolation_total') || 0)
    ws.cell(17, 18).number(sumAllZone(items, 'home_isolation_used') || 0)
    ws.cell(17, 19).number((sumAllZone(items, 'home_isolation_total') || 0) - (sumAllZone(items, 'home_isolation_used') || 0))
    ws.cell(17, 20).number(sumAllZone(items, 'community_isolation_total') || 0)
    ws.cell(17, 21).number(sumAllZone(items, 'community_isolation_used') || 0)
    ws.cell(17, 22).number((sumAllZone(items, 'community_isolation_total') || 0) - (sumAllZone(items, 'community_isolation_used') || 0))
    // }

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
    console.log(error)
    res.send({ ok: false, error: error });
  }
})

router.get('/bed-report-by-province', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const { zones, date, start, end } = req.query;

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
    let rs: any = [];
    if (date) {
      rs = await model.getBedReportByProvince(db, moment(date).format('YYYY-MM-DD'), { case: null, status: 'ADMIT', groupBy: 'h.province_code', zones, provinces: [] });
    }

    if (!date) {
      rs = await model.getBedReportByProvince(db, null, { case: null, status: 'ADMIT', groupBy: 'h.province_code', zones, provinces: [] }, { start: moment(start).format('YYYY-MM-DD'), end: moment(end).add(1, 'day').format('YYYY-MM-DD') });
    }
    const results = mapBedReports(rs)

    const rows = []
    const items = [
      [], [], [], [], [],
      [], [], [], [], [],
      [], [], []
    ]
    let rowNumber = 3


    results.forEach((result, i) => {
      result.forEach((x, j) => {
        if (!rows.some(item => item.province_code === x.province_code)) {
          rows.push({
            zone_code: x.zone_code,
            province_code: x.province_code,
            province_name: x.province_name,
          })
        }

        const index = rows.findIndex(item => item.province_code === x.province_code)
        if (index > -1) {
          if (x.bed_id === 14) {
            rows[index].level3_total = x.total
            rows[index].level3_used = x.used
          } else if (x.bed_id === 13) {
            rows[index].level22_total = x.total
            rows[index].level22_used = x.used
          } else if (x.bed_id === 12) {
            rows[index].level21_total = x.total
            rows[index].level21_used = x.used
          } else if (x.bed_id === 11) {
            rows[index].level1_total = x.total
            rows[index].level1_used = x.used
          } else if (x.bed_id === 10) {
            rows[index].level0_total = x.total
            rows[index].level0_used = x.used
          } else if (x.bed_id === 8) {
            rows[index].home_isolation_total = x.total
            rows[index].home_isolation_used = x.used
          } else if (x.bed_id === 9) {
            rows[index].community_isolation_total = x.total
            rows[index].community_isolation_used = x.used
          }
        }
      })
    })

    rows.forEach(item => {
      if (item.zone_code === '01') {
        items[0].push(item)
      } else if (item.zone_code === '02') {
        items[1].push(item)
      } else if (item.zone_code === '03') {
        items[2].push(item)
      } else if (item.zone_code === '04') {
        items[3].push(item)
      } else if (item.zone_code === '05') {
        items[4].push(item)
      } else if (item.zone_code === '06') {
        items[5].push(item)
      } else if (item.zone_code === '07') {
        items[6].push(item)
      } else if (item.zone_code === '08') {
        items[7].push(item)
      } else if (item.zone_code === '09') {
        items[8].push(item)
      } else if (item.zone_code === '10') {
        items[9].push(item)
      } else if (item.zone_code === '11') {
        items[10].push(item)
      } else if (item.zone_code === '12') {
        items[11].push(item)
      } else {
        items[12].push(item)
      }
    })

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
    const sum: any = [];
    items.forEach((item, i) => {
      sum.push(
        {
          zone_code: item[0].zone_code,
          level3_total: sumBy(item, 'level3_total'),
          level3_used: sumBy(item, 'level3_used'),
          level22_total: sumBy(item, 'level22_total'),
          level22_used: sumBy(item, 'level22_used'),
          level21_total: sumBy(item, 'level21_total'),
          level21_used: sumBy(item, 'level21_used'),
          level1_total: sumBy(item, 'level1_total'),
          level1_used: sumBy(item, 'level1_used'),
          level0_total: sumBy(item, 'level0_total'),
          level0_used: sumBy(item, 'level0_used'),
          home_isolation_total: sumBy(item, 'home_isolation_total'),
          home_isolation_used: sumBy(item, 'home_isolation_used'),
          community_isolation_total: sumBy(item, 'community_isolation_total'),
          community_isolation_used: sumBy(item, 'community_isolation_used')
        })
      item.forEach((x, j) => {
        if (x.zone_code !== '13') {
          ws.cell(rowNumber, 1).string(x.zone_code).style(center)
          ws.cell(rowNumber, 2).string(x.province_name)
          ws.cell(rowNumber, 3).number(x.level3_total || 0)
          ws.cell(rowNumber, 4).number(x.level3_used || 0)
          ws.cell(rowNumber, 5).number((x.level3_total || 0) - (x.level3_used || 0))
          ws.cell(rowNumber, 6).number(x.level22_total || 0)
          ws.cell(rowNumber, 7).number(x.level22_used || 0)
          ws.cell(rowNumber, 8).number((x.level22_total || 0) - (x.level22_used || 0))
          ws.cell(rowNumber, 9).number(x.level21_total || 0)
          ws.cell(rowNumber, 10).number(x.level21_used || 0)
          ws.cell(rowNumber, 11).number((x.level21_total || 0) - (x.level21_used || 0))
          ws.cell(rowNumber, 12).number(x.level1_total || 0)
          ws.cell(rowNumber, 13).number(x.level1_used || 0)
          ws.cell(rowNumber, 14).number((x.level1_total || 0) - (x.level1_used || 0))
          ws.cell(rowNumber, 15).number(x.level0_total || 0)
          ws.cell(rowNumber, 16).number(x.level0_used || 0)
          ws.cell(rowNumber, 17).number((x.level0_total || 0) - (x.level0_used || 0))
          ws.cell(rowNumber, 18).number(x.home_isolation_total || 0)
          ws.cell(rowNumber, 19).number(x.home_isolation_used || 0)
          ws.cell(rowNumber, 20).number((x.home_isolation_total || 0) - (x.home_isolation_used || 0))
          ws.cell(rowNumber, 21).number(x.community_isolation_total || 0)
          ws.cell(rowNumber, 22).number(x.community_isolation_used || 0)
          ws.cell(rowNumber, 23).number((x.community_isolation_total || 0) - (x.community_isolation_used || 0))
        } else {
          ws.cell(rowNumber, 1, rowNumber, 2, true).string(x.province_name).style(center)
          ws.cell(rowNumber, 3).number(x.level3_total || 0)
          ws.cell(rowNumber, 4).number(x.level3_used || 0)
          ws.cell(rowNumber, 5).number((x.level3_total || 0) - (x.level3_used || 0))
          ws.cell(rowNumber, 6).number(x.level22_total || 0)
          ws.cell(rowNumber, 7).number(x.level22_used || 0)
          ws.cell(rowNumber, 8).number((x.level22_total || 0) - (x.level22_used || 0))
          ws.cell(rowNumber, 9).number(x.level21_total || 0)
          ws.cell(rowNumber, 10).number(x.level21_used || 0)
          ws.cell(rowNumber, 11).number((x.level21_total || 0) - (x.level21_used || 0))
          ws.cell(rowNumber, 12).number(x.level1_total || 0)
          ws.cell(rowNumber, 13).number(x.level1_used || 0)
          ws.cell(rowNumber, 14).number((x.level1_total || 0) - (x.level1_used || 0))
          ws.cell(rowNumber, 15).number(x.level0_total || 0)
          ws.cell(rowNumber, 16).number(x.level0_used || 0)
          ws.cell(rowNumber, 17).number((x.level0_total || 0) - (x.level0_used || 0))
          ws.cell(rowNumber, 18).number(x.home_isolation_total || 0)
          ws.cell(rowNumber, 19).number(x.home_isolation_used || 0)
          ws.cell(rowNumber, 20).number((x.home_isolation_total || 0) - (x.home_isolation_used || 0))
          ws.cell(rowNumber, 21).number(x.community_isolation_total || 0)
          ws.cell(rowNumber, 22).number(x.community_isolation_used || 0)
          ws.cell(rowNumber, 23).number((x.community_isolation_total || 0) - (x.community_isolation_used || 0))
        }
        rowNumber++
      })

      if (items[i].length && items[i][0].zone_code !== '13') {
        ws.cell(rowNumber, 1, rowNumber, 2, true).string(`รวมเขต ${items[i][0].zone_code}`).style(center)
        ws.cell(rowNumber, 3).number(sumZone(item, 'level3_total') || 0)
        ws.cell(rowNumber, 4).number(sumZone(item, 'level3_used') || 0)
        ws.cell(rowNumber, 5).number((sumZone(item, 'level3_total') || 0) - (sumZone(item, 'level3_used') || 0))
        ws.cell(rowNumber, 6).number(sumZone(item, 'level22_total') || 0)
        ws.cell(rowNumber, 7).number(sumZone(item, 'level22_used') || 0)
        ws.cell(rowNumber, 8).number((sumZone(item, 'level22_total') || 0) - (sumZone(item, 'level22_used') || 0))
        ws.cell(rowNumber, 9).number(sumZone(item, 'level21_total') || 0)
        ws.cell(rowNumber, 10).number(sumZone(item, 'level21_used') || 0)
        ws.cell(rowNumber, 11).number((sumZone(item, 'level21_total') || 0) - (sumZone(item, 'level21_used') || 0))
        ws.cell(rowNumber, 12).number(sumZone(item, 'level1_total') || 0)
        ws.cell(rowNumber, 13).number(sumZone(item, 'level1_used') || 0)
        ws.cell(rowNumber, 14).number((sumZone(item, 'level1_total') || 0) - (sumZone(item, 'level1_used') || 0))
        ws.cell(rowNumber, 15).number(sumZone(item, 'level0_total') || 0)
        ws.cell(rowNumber, 16).number(sumZone(item, 'level0_used') || 0)
        ws.cell(rowNumber, 17).number((sumZone(item, 'level0_total') || 0) - (sumZone(item, 'level0_used') || 0))
        ws.cell(rowNumber, 18).number(sumZone(item, 'home_isolation_total') || 0)
        ws.cell(rowNumber, 19).number(sumZone(item, 'home_isolation_used') || 0)
        ws.cell(rowNumber, 20).number((sumZone(item, 'home_isolation_total') || 0) - (sumZone(item, 'home_isolation_used') || 0))
        ws.cell(rowNumber, 21).number(sumZone(item, 'community_isolation_total') || 0)
        ws.cell(rowNumber, 22).number(sumZone(item, 'community_isolation_used') || 0)
        ws.cell(rowNumber, 23).number((sumZone(item, 'community_isolation_total') || 0) - (sumZone(item, 'community_isolation_used') || 0))
        rowNumber++
      }
    })

    // if (countExistingZone(items) >= 12) {
    // console.log(items);
    // console.log(rowNumber);



    ws.cell(rowNumber, 1, rowNumber, 2, true).string('รวม 12 เขต').style(center)
    ws.cell(rowNumber, 3).number(sum12Zone(sum, 'level3_total') || 0)
    ws.cell(rowNumber, 4).number(sum12Zone(sum, 'level3_used') || 0)
    ws.cell(rowNumber, 5).number((sum12Zone(sum, 'level3_total') || 0) - (sum12Zone(sum, 'level3_used') || 0))
    ws.cell(rowNumber, 6).number(sum12Zone(sum, 'level22_total') || 0)
    ws.cell(rowNumber, 7).number(sum12Zone(sum, 'level22_used') || 0)
    ws.cell(rowNumber, 8).number((sum12Zone(sum, 'level22_total') || 0) - (sum12Zone(sum, 'level22_used') || 0))
    ws.cell(rowNumber, 9).number(sum12Zone(sum, 'level21_total') || 0)
    ws.cell(rowNumber, 10).number(sum12Zone(sum, 'level21_used') || 0)
    ws.cell(rowNumber, 11).number((sum12Zone(sum, 'level21_total') || 0) - (sum12Zone(sum, 'level21_used') || 0))
    ws.cell(rowNumber, 12).number(sum12Zone(sum, 'level1_total') || 0)
    ws.cell(rowNumber, 13).number(sum12Zone(sum, 'level1_used') || 0)
    ws.cell(rowNumber, 14).number((sum12Zone(sum, 'level1_total') || 0) - (sum12Zone(sum, 'level1_used') || 0))
    ws.cell(rowNumber, 15).number(sum12Zone(sum, 'level0_total') || 0)
    ws.cell(rowNumber, 16).number(sum12Zone(sum, 'level0_used') || 0)
    ws.cell(rowNumber, 17).number((sum12Zone(sum, 'level0_total') || 0) - (sum12Zone(sum, 'level0_used') || 0))
    ws.cell(rowNumber, 18).number(sum12Zone(sum, 'home_isolation_total') || 0)
    ws.cell(rowNumber, 19).number(sum12Zone(sum, 'home_isolation_used') || 0)
    ws.cell(rowNumber, 20).number((sum12Zone(sum, 'home_isolation_total') || 0) - (sum12Zone(sum, 'home_isolation_used') || 0))
    ws.cell(rowNumber, 21).number(sum12Zone(sum, 'community_isolation_total') || 0)
    ws.cell(rowNumber, 22).number(sum12Zone(sum, 'community_isolation_used') || 0)
    ws.cell(rowNumber, 23).number((sum12Zone(sum, 'community_isolation_total') || 0) - (sum12Zone(sum, 'community_isolation_used') || 0))
    rowNumber++
    // }

    // if (countExistingZone(items) > 12) {
    ws.cell(rowNumber, 1, rowNumber, 2, true).string('ทั่วประเทศ').style(center)
    ws.cell(rowNumber, 3).number(sumAllZone(sum, 'level3_total') || 0)
    ws.cell(rowNumber, 4).number(sumAllZone(sum, 'level3_used') || 0)
    ws.cell(rowNumber, 5).number((sumAllZone(sum, 'level3_total') || 0) - (sumAllZone(sum, 'level3_used') || 0))
    ws.cell(rowNumber, 6).number(sumAllZone(sum, 'level22_total') || 0)
    ws.cell(rowNumber, 7).number(sumAllZone(sum, 'level22_used') || 0)
    ws.cell(rowNumber, 8).number((sumAllZone(sum, 'level22_total') || 0) - (sumAllZone(sum, 'level22_used') || 0))
    ws.cell(rowNumber, 9).number(sumAllZone(sum, 'level21_total') || 0)
    ws.cell(rowNumber, 10).number(sumAllZone(sum, 'level21_used') || 0)
    ws.cell(rowNumber, 11).number((sumAllZone(sum, 'level21_total') || 0) - (sumAllZone(sum, 'level21_used') || 0))
    ws.cell(rowNumber, 12).number(sumAllZone(sum, 'level1_total') || 0)
    ws.cell(rowNumber, 13).number(sumAllZone(sum, 'level1_used') || 0)
    ws.cell(rowNumber, 14).number((sumAllZone(sum, 'level1_total') || 0) - (sumAllZone(sum, 'level1_used') || 0))
    ws.cell(rowNumber, 15).number(sumAllZone(sum, 'level0_total') || 0)
    ws.cell(rowNumber, 16).number(sumAllZone(sum, 'level0_used') || 0)
    ws.cell(rowNumber, 17).number((sumAllZone(sum, 'level0_total') || 0) - (sumAllZone(sum, 'level0_used') || 0))
    ws.cell(rowNumber, 18).number(sumAllZone(sum, 'home_isolation_total') || 0)
    ws.cell(rowNumber, 19).number(sumAllZone(sum, 'home_isolation_used') || 0)
    ws.cell(rowNumber, 20).number((sumAllZone(sum, 'home_isolation_total') || 0) - (sumAllZone(sum, 'home_isolation_used') || 0))
    ws.cell(rowNumber, 21).number(sumAllZone(sum, 'community_isolation_total') || 0)
    ws.cell(rowNumber, 22).number(sumAllZone(sum, 'community_isolation_used') || 0)
    ws.cell(rowNumber, 23).number((sumAllZone(sum, 'community_isolation_total') || 0) - (sumAllZone(sum, 'community_isolation_used') || 0))
    // }

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
    console.log(error)
    res.send({ ok: false, error: error });
  }
})

router.get('/patient-report-by-hospital', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const { zones, provinces, date, sector } = req.query;

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

    const [headers, cases, casesWithMedicals, deathCases, puiCases, atkCases] = await Promise.all([
      model.getPatientsReportHeaders(db),
      model.getPatientsCases(db, moment(date).format('YYYY-MM-DD'), { case: 'COVID', status: 'ADMIT', groupBy: 'h.id', zones, provinces }),
      model.getPatientsCasesGroupByMedicalSupplies(db, moment(date).format('YYYY-MM-DD'), { case: 'COVID', status: 'ADMIT', groupBy: 'h.id', zones, provinces }),
      model.getPatientsCases(db, moment(date).format('YYYY-MM-DD'), { case: 'COVID', status: 'DEATH', groupBy: 'h.id', zones, provinces }),
      model.getPatientsCases(db, moment(date).format('YYYY-MM-DD'), { case: 'IPPUI', status: 'ADMIT', groupBy: 'h.id', zones, provinces }),
      model.getPatientsCases(db, moment(date).format('YYYY-MM-DD'), { case: 'ATK', status: 'ADMIT', groupBy: 'h.id', zones, provinces })
    ])
    const result = mapPatientReportByHospital(cases, casesWithMedicals, deathCases, puiCases, atkCases)

    ws.column(2).setWidth(20)
    ws.column(4).setWidth(40)
    ws.column(17).setWidth(40)

    ws.cell(1, 1).string('เขตสุขภาพ').style(center)
    ws.cell(1, 2).string('จังหวัด').style(center)
    ws.cell(1, 3).string('รหัสพยาบาล').style(center)
    ws.cell(1, 4).string('โรงพยาบาล').style(center)
    ws.cell(1, 5).string('ระดับขีดความสามารถ').style(center)
    ws.cell(1, 6).string('ผู้ป่วยทั้งหมด').style(center)
    ws.cell(1, 7).string('Severe').style(center)
    ws.cell(1, 8).string('Moderate').style(center)
    ws.cell(1, 9).string('Mild').style(center)
    ws.cell(1, 10).string('Asymptomatic').style(center)
    ws.cell(1, 11).string('Invasive Ventilator').style(center)
    ws.cell(1, 12).string('Non-Invasive Ventilator').style(center)
    ws.cell(1, 13).string('High flow').style(center)
    ws.cell(1, 14).string('Dead').style(center)
    ws.cell(1, 15).string('PUI').style(center)
    ws.cell(1, 16).string('ATK').style(center)
    ws.cell(1, 17).string('หน่วยงาน').style(center)

    // console.log(result);

    result.forEach((row, i) => {
      ws.cell(2 + i, 1).string(row.zone_code).style(center)
      ws.cell(2 + i, 2).string(row.province_name).style(center)
      ws.cell(2 + i, 3).string(row.hospcode).style(center)
      ws.cell(2 + i, 4).string(row.hospname).style(center)
      ws.cell(2 + i, 5).string(row.level || '-').style(center)
      ws.cell(2 + i, 6).number(row.total || 0)
      ws.cell(2 + i, 7).number(row.severe || 0)
      ws.cell(2 + i, 8).number(row.moderate || 0)
      ws.cell(2 + i, 9).number(row.mild || 0)
      ws.cell(2 + i, 10).number(row.asymptomatic || 0)
      ws.cell(2 + i, 11).number(row.invasive_ventilator || 0)
      ws.cell(2 + i, 12).number(row.non_invasive_ventilator || 0)
      ws.cell(2 + i, 13).number(row.high_flow || 0)
      ws.cell(2 + i, 14).number(row.dead || 0)
      ws.cell(2 + i, 15).number(row.pui || 0)
      ws.cell(2 + i, 16).number(row.atk || 0)
      ws.cell(2 + i, 17).string(row.sub_ministry_name || '-').style(center)
    })

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
    // const bedHospital: any = await model.getBedHospital(db);
    const rs: any = await model.getBedReportByHospital(db, date, { case: null, status: 'ADMIT', zones, provinces });

    const hospcode = uniqBy(rs, 'hospcode');
    const beds: any = await model.getBed(db);
    // const results = mapBedReports(rs)
    // const items = []

    // results.forEach((result, i) => {
    //   result.forEach((x, j) => {
    //     if (!items.some(item => item.hospcode === x.hospcode)) {
    //       items.push({
    //         zone_code: x.zone_code,
    //         province_code: x.province_code,
    //         province_name: x.province_name,
    //         hospcode: x.hospcode,
    //         hospname: x.hospname,
    //         level: x.level,
    //         sub_ministry_name: x.sub_ministry_name
    //       })
    //     }


    //     const index = items.findIndex(item => item.hospcode === x.hospcode)
    //     if (index > -1) {
    //       if (x.bed_id === 14) {
    //         items[index].level3_total = x.total
    //         items[index].level3_used = x.used
    //       } else if (x.bed_id === 13) {
    //         items[index].level2_2_total = x.total
    //         items[index].level2_2_used = x.used
    //       } else if (x.bed_id === 12) {
    //         items[index].level2_1_total = x.total
    //         items[index].level2_1_used = x.used
    //       } else if (x.bed_id === 11) {
    //         items[index].level1_total = x.total
    //         items[index].level1_used = x.used
    //       } else if (x.bed_id === 10) {
    //         items[index].level0_total = x.total
    //         items[index].level0_used = x.used
    //       } else if (x.bed_id === 8) {
    //         items[index].home_isolation_total = x.total
    //         items[index].home_isolation_used = x.used
    //       } else if (x.bed_id === 9) {
    //         items[index].community_isolation_total = x.total
    //         items[index].community_isolation_used = x.used
    //       }
    //     }
    //   })
    // })

    ws.column(2).setWidth(20)
    ws.column(4).setWidth(40)
    ws.column(27).setWidth(40)

    ws.cell(1, 1, 2, 1, true).string('เขตสุขภาพ').style(center)
    ws.cell(1, 2, 2, 2, true).string('จังหวัด').style(center)
    ws.cell(1, 3, 2, 3, true).string('รหัสโรงพยาบาล').style(center)
    ws.cell(1, 4, 2, 4, true).string('โรงยาบาล').style(center)
    ws.cell(1, 5, 2, 5, true).string('ระดับขีดความสามารถ').style(center)
    ws.cell(1, (beds.length * 3) + 6, 2, (beds.length * 3) + 6, true).string('หน่วยงาน').style(center)
    let col = 6;
    for (const b of beds) {
      ws.cell(1, col, 1, col + 2, true).string(b.name).style(center)
      col += 3;
    }
    // ws.cell(1, 6, 1, 8, true).string('ระดับ 3 ใส่ท่อและเครื่องช่วยหายใจได้').style(center)
    // ws.cell(1, 9, 1, 11, true).string('ระดับ 2.2 Oxygen high flow').style(center)
    // ws.cell(1, 12, 1, 14, true).string('ระดับ 2.1 Oxygen low flow').style(center)
    // ws.cell(1, 15, 1, 17, true).string('ระดับ 1 ไม่ใช้ Oxygen').style(center)
    // ws.cell(1, 18, 1, 20, true).string('ระดับ 0 Home Isolation (stepdown)').style(center)
    // ws.cell(1, 21, 1, 23, true).string('Home Isolation (New case)').style(center)
    // ws.cell(1, 24, 1, 26, true).string('Community Isolation (New case)').style(center)

    let all = 6
    let use = 7
    let left = 8
    for (const b of beds) {
      b.col_all = all;
      b.col_use = use;
      b.col_balance = left;
      ws.cell(2, all).string('ทั้งหมด').style(center)
      ws.cell(2, use).string('ใช้ไป').style(center)
      ws.cell(2, left).string('คงเหลือ').style(center)
      all += 3
      use += 3
      left += 3
    }


    let i = 2;
    // console.log(rs);
    for (const item of hospcode) {
      i++;
      ws.cell(i, 1).string(item.zone_code).style(center)
      ws.cell(i, 2).string(item.province_name).style(center)
      ws.cell(i, 3).string(item.hospcode).style(center)
      ws.cell(i, 4).string(item.hospname).style(center)
      ws.cell(i, 5).string(item.level || '-').style(center)
      ws.cell(i, 6 + (beds.length * 3)).string(item.sub_ministry_name || '-').style(center)
      for (const b of beds) {
        const fil = filter(rs, { hospcode: item.hospcode });
        const idx = findIndex(fil, { bed_id: b.id })

        // const filB = filter(bedHospital, { hospcode: item.hospcode });
        // const idxB = findIndex(filB, { bed_id: b.id })

        if (idx > -1) {
          ws.cell(i, b.col_all).number(+fil[idx].total || 0);
          ws.cell(i, b.col_use).number(+fil[idx].used || 0);
          ws.cell(i, b.col_balance).number((+fil[idx].total || 0) - (+fil[idx].used || 0))
        } else {
          ws.cell(i, b.col_all).number(0);
          ws.cell(i, b.col_use).number(0);
          ws.cell(i, b.col_balance).number(0)
        }
      }
      // ws.cell(i, 6).number(item.level3_total || 0)
      // ws.cell(i, 7).number(item.level3_used || 0)
      // ws.cell(i, 8).number((item.level3_total || 0) - (item.level3_used || 0))
      // ws.cell(i, 9).number(item.level2_2_total || 0)
      // ws.cell(i, 10).number(item.level2_2_used || 0)
      // ws.cell(i, 11).number((item.level2_2_total || 0) - (item.level2_2_used || 0))
      // ws.cell(i, 12).number(item.level2_1_total || 0)
      // ws.cell(i, 13).number(item.level2_1_used || 0)
      // ws.cell(i, 14).number((item.level2_1_total || 0) - (item.level2_1_used || 0))
      // ws.cell(i, 15).number(item.level1_total || 0)
      // ws.cell(i, 16).number(item.level1_used || 0)
      // ws.cell(i, 17).number((item.level1_total || 0) - (item.level1_used || 0))
      // ws.cell(i, 18).number(item.level0_total || 0)
      // ws.cell(i, 19).number(item.level0_used || 0)
      // ws.cell(i, 20).number((item.level0_total || 0) - (item.level0_used || 0))
      // ws.cell(i, 21).number(item.home_isolation_total || 0)
      // ws.cell(i, 22).number(item.home_isolation_used || 0)
      // ws.cell(i, 23).number((item.home_isolation_total || 0) - (item.home_isolation_used || 0))
      // ws.cell(i, 24).number(item.community_isolation_total || 0)
      // ws.cell(i, 25).number(item.community_isolation_used || 0)
      // ws.cell(i, 26).number((item.community_isolation_total || 0) - (item.community_isolation_used || 0))


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
    console.log(error);

    res.send({ ok: false, error: error });
  }
})

router.get('/admit-case', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const date = req.query.date || null;
  const provinceCode = req.decoded?.type === 'STAFF' ? req.decoded.provinceCode : null
  const { case_status } = req.query


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
    // const [cases, genericsPersons, headers] = await Promise.all([
    //   reportModel.admitCase(db, date),
    //   reportModel.getPersonsGenerics(db, date),
    //   reportModel.getGenericNames(db)
    // ])
    // const results = mapPersonsGenerics(genericsPersons, cases)


    const [cases, headers] = await Promise.all([
      reportModel.admitCase(db, date, case_status, provinceCode),
      reportModel.getGenericNames(db)
    ])
    const genericsUsages = await reportModel.getGenericsUsaged(db, cases.map((each) => each.detail_id))
    const results = mapPersonsGenerics(genericsUsages, cases)

    ws.column(2).setWidth(20)
    ws.column(3).setWidth(40)
    ws.column(7).setWidth(20)
    ws.column(8).setWidth(20)
    ws.column(13).setWidth(20)
    ws.column(21).setWidth(40)

    ws.cell(1, 1).string('เขต').style(center)
    ws.cell(1, 2).string('จังหวัด').style(center)
    ws.cell(1, 3).string('โรงพยาบาล').style(center)
    ws.cell(1, 4).string('HN').style(center)
    ws.cell(1, 5).string('AN').style(center)
    ws.cell(1, 6).string('CID').style(center)
    ws.cell(1, 7).string('ชื่อ').style(center)
    ws.cell(1, 8).string('นามสกุล').style(center)
    ws.cell(1, 9).string('เพศ').style(center)
    ws.cell(1, 10).string('อายุ').style(center)
    ws.cell(1, 11).string('วันที่ Admit').style(center)
    ws.cell(1, 12).string('วันที่ บันทึก').style(center)
    ws.cell(1, 13).string('ความรุนแรง').style(center)
    ws.cell(1, 14).string('เตียง').style(center)
    ws.cell(1, 15).string('เครื่องช่วยหายใจ').style(center)
    ws.cell(1, 16).string('วันที่ update อาการล่าสุด').style(center)
    ws.cell(1, 17).string('ไม่ได้บันทึกมา').style(center)
    ws.cell(1, 18).string('Favipiravir').style(center)
    ws.cell(1, 19).string('Casirivimab and imdevimab').style(center)
    ws.cell(1, 20).string('Molnupiravir').style(center)
    ws.cell(1, 21).string('หน่วยงานสังกัด').style(center)
    // console.log(results);

    results.forEach((result, i) => {
      console.log(result);

      ws.cell(2 + i, 1).string(result.zone_code).style(center)
      ws.cell(2 + i, 2).string(result.province_name).style(center)
      ws.cell(2 + i, 3).string(result.hospname).style(center)
      ws.cell(2 + i, 4).string(result.hn).style(center)
      ws.cell(2 + i, 5).string(result.an).style(center)
      ws.cell(2 + i, 6).string(result.cid ? result.cid.toString() : '')
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
      ws.cell(2 + i, 17).number(result.day_not || 0)
      ws.cell(2 + i, 18).string(result.hasOwnProperty('Favipiravir') ? '✔️' : '❌').style(center)
      ws.cell(2 + i, 19).string(result['Casirivimab and imdevimab'] ? '✔️' : '❌').style(center)
      ws.cell(2 + i, 20).string(result['Molnupiravir'] ? '✔️' : '❌').style(center)
      ws.cell(2 + i, 21).string(result.sub_ministry_name || '-').style(center)
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
    console.log(error);

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

    ws.cell(1, 1).string('เขต').style(center)
    ws.cell(1, 2).string('Admit').style(center)

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

router.get('/discharge-case', async (req: Request, res: Response) => {
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
    const rs: any = await reportModel.dischargeCase(db, date, true);

    ws.column(2).setWidth(20)
    ws.column(4).setWidth(40)
    ws.column(7).setWidth(20)
    ws.column(8).setWidth(20)
    ws.column(9).setWidth(20)
    ws.column(16).setWidth(40)
    ws.column(17).setWidth(40)

    ws.cell(1, 1).string('เขต').style(center)
    ws.cell(1, 2).string('จังหวัด').style(center)
    ws.cell(1, 3).string('รหัสโรงพยาบาล').style(center)
    ws.cell(1, 4).string('โรงพยาบาล').style(center)
    ws.cell(1, 5).string('HN').style(center)
    ws.cell(1, 6).string('AN').style(center)
    ws.cell(1, 7).string('CID').style(center)
    ws.cell(1, 8).string('ชื่อ').style(center)
    ws.cell(1, 9).string('นามสกุล').style(center)
    ws.cell(1, 10).string('เพศ').style(center)
    ws.cell(1, 11).string('อายุ').style(center)
    ws.cell(1, 12).string('Status').style(center)
    ws.cell(1, 13).string('Date Admit').style(center)
    ws.cell(1, 14).string('Date Discharge').style(center)
    ws.cell(1, 15).string('Refer Hospital Code').style(center)
    ws.cell(1, 16).string('Refer Hospital Name').style(center)
    ws.cell(1, 17).string('หน่วยงานสังกัด').style(center)

    rs.forEach((row, i) => {
      ws.cell(2 + i, 1).string(row.zone_code).style(center)
      ws.cell(2 + i, 2).string(row.province_name || '-').style(center)
      ws.cell(2 + i, 3).string(row.hospcode).style(center)
      ws.cell(2 + i, 4).string(row.hospname).style(center)
      ws.cell(2 + i, 5).string(row.hn).style(center)
      ws.cell(2 + i, 6).string(row.an || '-').style(center)
      ws.cell(2 + i, 7).string(row.cid || '-').style(center)
      ws.cell(2 + i, 8).string(row.first_name).style(center)
      ws.cell(2 + i, 9).string(row.last_name).style(center)
      ws.cell(2 + i, 10).string(row.gender || '-').style(center)
      ws.cell(2 + i, 11).number(getAge(row.birth_date))
      ws.cell(2 + i, 12).string(row.status).style(center)
      ws.cell(2 + i, 13).string(formatDate(row.date_admit)).style(center)
      ws.cell(2 + i, 14).string(formatDate(row.date_discharge)).style(center)
      ws.cell(2 + i, 15).string(row.refer_hospcode || '-').style(center)
      ws.cell(2 + i, 16).string(row.refer_hospname || '-').style(center)
      ws.cell(2 + i, 17).string(row.sub_ministry_name || '-').style(center)
    })

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = 'discharge-case' + moment().format('x');
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

router.get('/discharge-case-summary', async (req: Request, res: Response) => {
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
    const results = await reportModel.dischargeSummary(db, { start, end })
    const mapped = mapDischargeSummary(results)

    ws.column(1).setWidth(20)

    ws.cell(1, 1).string('เขต').style(center)
    ws.cell(1, 2).string('Discharge').style(center)
    ws.cell(1, 3).string('Negative').style(center)
    ws.cell(1, 4).string('Refer').style(center)
    ws.cell(1, 5).string('Death').style(center)
    ws.cell(1, 6).string('รวม').style(center)

    mapped.forEach((item, i) => {
      if (item.zone_code !== '13') {
        ws.cell(2 + i, 1).string(item.zone_code).style(center)
      } else {
        ws.cell(2 + i, 1).string(' กรุงเทพมหานคร ').style(center)
      }
      ws.cell(2 + i, 2).number(item['DISCHARGE'] || 0)
      ws.cell(2 + i, 3).number(item['NEGATIVE'] || 0)
      ws.cell(2 + i, 4).number(item['REFER'] || 0)
      ws.cell(2 + i, 5).number(item['DEATH'] || 0)
      ws.cell(2 + i, 6).number(sumField(item) || 0)
    })

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = 'discharge-case-summary' + moment().format('x');
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

router.get('/patients-report', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const date = req.query.date;
  const sector = req.query.sector;

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
    const totalResult: any = await model.getPatientsReport(db, date, sector);
    const todayResult: any = await model.getPatientsReportByDate(db, date, sector);
    const result = mapPatientsResult(totalResult, todayResult)

    ws.column(2).setWidth(20)
    ws.column(4).setWidth(40)
    ws.column(21).setWidth(40)

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

    result.forEach((row, i) => {
      ws.cell(3 + i, 1).string(row.zone_code).style(center)
      ws.cell(3 + i, 2).string(row.province_name).style(center)
      ws.cell(3 + i, 3).string(row.hospcode).style(center)
      ws.cell(3 + i, 4).string(row.hospname).style(center)
      ws.cell(3 + i, 5).number(row.admit || 0)
      ws.cell(3 + i, 6).number(row.discharge || 0)
      ws.cell(3 + i, 7).number(row.discharge_hospitel || 0)
      ws.cell(3 + i, 8).number(row.discharge_death || 0)
      ws.cell(3 + i, 9).number(row.pui_admit || 0)
      ws.cell(3 + i, 10).number(row.pui_discharge || 0)
      ws.cell(3 + i, 11).number(row.pui_discharge_hospitel || 0)
      ws.cell(3 + i, 12).number(row.pui_discharge_death || 0)
      ws.cell(3 + i, 13).number(row.today_admit || 0)
      ws.cell(3 + i, 14).number(row.today_discharge || 0)
      ws.cell(3 + i, 15).number(row.today_discharge_hospitel || 0)
      ws.cell(3 + i, 16).number(row.today_discharge_death || 0)
      ws.cell(3 + i, 17).number(row.today_pui_admit || 0)
      ws.cell(3 + i, 18).number(row.today_pui_discharge || 0)
      ws.cell(3 + i, 19).number(row.today_pui_discharge_hospitel || 0)
      ws.cell(3 + i, 20).number(row.today_pui_discharge_death || 0)
      ws.cell(3 + i, 21).string(row.sub_ministry_name || '-').style(center)
    })

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = 'patients-report' + moment().format('x');
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

router.get('/medicals-supplies-report-by-hospital', async (req: Request, res: Response) => {
  const db = req.dbReport;
  const { hospital_ids, date, sector } = req.query;

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
    const rs: any = await model.medicalsSupplyReportByHospital(db, date, sector, hospital_ids);

    ws.column(2).setWidth(20)
    ws.column(4).setWidth(40)
    ws.column(13).setWidth(40)

    ws.cell(1, 1, 2, 1, true).string('เขตสุขภาพ').style(center)
    ws.cell(1, 2, 2, 2, true).string('จังหวัด').style(center)
    ws.cell(1, 3, 2, 3, true).string('รหัสโรงพยาบาล').style(center)
    ws.cell(1, 4, 2, 4, true).string('โรงพยาบาล').style(center)

    ws.cell(1, 5, 1, 6, true).string('Non Invasive').style(center)
    ws.cell(1, 7, 1, 8, true).string('Invasive Ventilator').style(center)
    ws.cell(1, 9, 1, 10, true).string('High Flow').style(center)
    ws.cell(1, 11, 1, 12, true).string('PAPR').style(center)
    ws.cell(1, 13, 2, 13, true).string('หน่วยงาน').style(center)

    let use = 5
    let all = 6

    for (let i = 0; i < 4; i++) {
      ws.cell(2, use).string('ใช้กับผู้ป่วย').style(center)
      ws.cell(2, all).string('ทั้งหมด').style(center)

      use += 2
      all += 2
    }

    rs.forEach((row, i) => {
      ws.cell(3 + i, 1).string(row.zone_code).style(center)
      ws.cell(3 + i, 2).string(row.province_name).style(center)
      ws.cell(3 + i, 3).string(row.hospcode).style(center)
      ws.cell(3 + i, 4).string(row.hospname).style(center)
      ws.cell(3 + i, 5).number(row.non_invasive_usage_qty || 0)
      ws.cell(3 + i, 6).number(row.non_invasive_covid_qty || 0)
      ws.cell(3 + i, 7).number(row.invasive_usage_qty || 0)
      ws.cell(3 + i, 8).number(row.invasive_covid_qty || 0)
      ws.cell(3 + i, 9).number(row.high_flow_usage_qty || 0)
      ws.cell(3 + i, 10).number(row.high_flow_covid_qty || 0)
      ws.cell(3 + i, 11).number(row.papr_usage_qty || 0)
      ws.cell(3 + i, 12).number(row.papr_covid_qty || 0)
      ws.cell(3 + i, 13).string(row.sub_ministry_name || '-').style(center)
    })

    fse.ensureDirSync(process.env.TMP_PATH);

    let filename = 'medicals-supplies-report-by-hospital' + moment().format('x');
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
