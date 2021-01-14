// / <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
import * as crypto from 'crypto';

import * as moment from "moment"
import { Router, Request, Response } from 'express';
import { BasicModel } from '../../models/basic';
import { PatientModel } from '../../models/patients';
import { findIndex } from "lodash";
import { CovidCaseModel } from '../../models/covid-case';
const basicModel = new BasicModel();
const patientModel = new PatientModel();

const router: Router = Router();
const covidCaseModel = new CovidCaseModel();

router.get('/', async (req: Request, res: Response) => {
    try {
        // const queryPerson: any = req.query.queryPerson || ''
        const hn: any = req.query.queryHn || ''
        const hc: any = req.query.queryHc || ''
        let rs: any = await patientModel.getPersonEq(req.db, hn, hc);
        res.send({ ok: true, rows: { patient: rs }, code: HttpStatus.OK });
    } catch (error) {
        res.send({ ok: false, error: error.message, code: HttpStatus.OK });
    }
});

router.get('/history', async (req: Request, res: Response) => {
    try {
        // const queryPerson: any = req.query.queryPerson || ''
        const hospitalId: any = req.query.hospitalId || ''
        const patientId: any = req.query.patientId || ''
        let rs: any = await patientModel.getCasePresent(req.db, hospitalId, patientId);
        res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } catch (error) {
        res.send({ ok: false, error: error.message, code: HttpStatus.OK });
    }
});

router.put('/edit-info', async (req: Request, res: Response) => {
    try {
        const db = req.db;
        const decoded = req.decoded
        const data: any = req.body.data || ''
        const personId = data.person_id
        const patientId = data.patient_id
        const oldInfo = await patientModel.getPerson(db, personId)
        const oldHn = await patientModel.getPatient(db, patientId)

        const personData: any = {
            gender_id: data.gender_id,
            title_id: data.title_id,
            first_name: data.first_name,
            last_name: data.last_name,
            cid: data.cid
        }
        const patientData: any = {
            hn: data.hn
        }

        if (oldInfo && oldHn) {
            const findEdit = findIndex(oldInfo, v => {
                return v.id === personId &&
                    v.gender_id === personData.gender_id &&
                    v.title_id === personData.title_id &&
                    v.first_name === personData.first_name &&
                    v.last_name === personData.last_name &&
                    v.cid === personData.cid
            })
            let peLogs, paLogs: any = false
            if (findEdit === -1) {
                oldInfo[0].updated_by = decoded.id;
                oldInfo[0].update_date = moment().format('YYYY-MM-DD HH:mm:ss')
                personData.updated_by = decoded.id;
                personData.update_date = moment().format('YYYY-MM-DD HH:mm:ss')
                const rsUpdate = await patientModel.updatePerson(db, personId, personData);
                console.log(rsUpdate);
                if (rsUpdate) {
                    const rs = await patientModel.saveLogsPerson(db, oldInfo[0]);
                    peLogs = rs.length > 0 ? true : false;
                }
            }
            const findHn = findIndex(oldHn, v => v.hn === patientData.hn)
            if (findHn === -1) {
                oldHn[0].updated_by = decoded.id;
                oldHn[0].update_date = moment().format('YYYY-MM-DD HH:mm:ss')
                patientData.updated_by = decoded.id;
                patientData.update_date = moment().format('YYYY-MM-DD HH:mm:ss')
                const rsUpdate = await patientModel.updatePatient(db, patientId, patientData);
                console.log(rsUpdate);
                if (rsUpdate) {
                    const rs = await patientModel.saveLogsPatient(db, oldHn[0]);
                    paLogs = rs.length > 0 ? true : false;
                }
            }
            if (peLogs || paLogs) {
                res.send({ ok: true, code: HttpStatus.OK });
            } else {
                res.send({ ok: false, error: 'edit not found!!', code: HttpStatus.NO_CONTENT });
            }
        } else {
            res.send({ ok: false, error: 'person not found!!', code: HttpStatus.NO_CONTENT });
        }
    } catch (error) {
        let message = ''
        if (error.message.search('p_patients.idx') > -1) {
            message = 'HN ซ้ำ '
        } else if (error.message.search('p_persons.idxcid') > -1) {
            message = 'CID ซ้ำ '
        } else {
            message = error.message
        }
        res.send({ ok: false, error: message, code: HttpStatus.BAD_REQUEST });
    }
});

router.get('/details', async (req: Request, res: Response) => {
    const covidCaseId = req.query.covidCaseId;
    try {
        let rs: any = await covidCaseModel.getDetails(req.db, covidCaseId);
        res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } catch (error) {
        console.log(error);

        res.send({ ok: false, error: error.message, code: HttpStatus.OK });
    }
});

router.delete('/covid-case/:id', async (req: Request, res: Response) => {
    const db = req.db;
    const decoded = req.decoded
    const caseId: any = req.params.id || ''
    // const caseId = data.covid_case_id
    let error = ''
    try {
        let oldCase: any = await patientModel.getCase(db, caseId);
        console.log(oldCase);

        if (oldCase[0]) {
            oldCase[0].updated_by = decoded.id;
            oldCase[0].update_date = moment().format('YYYY-MM-DD HH:mm:ss')
            const rsUpdate = await patientModel.updateCase(db, caseId, { updated_by: decoded.id, update_date: moment().format('YYYY-MM-DD HH:mm:ss'), is_deleted: 'Y' });
            if (rsUpdate) {
                const rsLogs = await patientModel.saveLogsCase(db, oldCase[0]);
                if (!rsLogs) {
                    error += 'update logs case  error. '
                }
            } else {
                error += 'update case  error. '
            }
            if (!error) {
                res.send({ ok: true, code: HttpStatus.OK });
            } else {
                res.send({ ok: false, error: error, code: HttpStatus.NO_CONTENT });
            }
        } else {
            res.send({ ok: false, error: 'case not found!!', code: HttpStatus.NO_CONTENT });
        }
    }
    catch (error) {
        res.send({ ok: false, error: error.message, code: HttpStatus.OK });
    }
})


router.put('/covid-case', async (req: Request, res: Response) => {
    const db = req.db;
    const decoded = req.decoded
    const data: any = req.body.data || ''
    const caseId = data.covid_case_id
    // const oldInfo = await patientModel.getPerson(db, personId)
    // const oldHn = await patientModel.getPatient(db, patientId)

    try {
        let error = ''
        let oldCase: any = await patientModel.getCase(db, caseId);
        console.log(oldCase);

        if (oldCase[0]) {
            const dataCase: any = {
                an: data.an,
                case_status: data.case_status,
                status: data.status
            }
            const findEdit = findIndex(oldCase, v => {
                let d = true
                if (dataCase.status !== 'ADMIT') {
                    dataCase.date_discharge = data.date_discharge
                    d = moment(v.date_discharge).format('YYYY-MM-DD HH:mm:ss') === moment(dataCase.date_discharge).format('YYYY-MM-DD HH:mm:ss')
                }
                return v.id === caseId &&
                    v.an === dataCase.an &&
                    d &&
                    v.case_status === dataCase.case_status &&
                    v.status === dataCase.status
            })
            if (findEdit === -1) {
                oldCase[0].updated_by = decoded.id;
                oldCase[0].update_date = moment().format('YYYY-MM-DD HH:mm:ss')
                dataCase.updated_by = decoded.id;
                dataCase.update_date = moment().format('YYYY-MM-DD HH:mm:ss')
                const rsUpdate = await patientModel.updateCase(db, caseId, dataCase);
                if (rsUpdate) {
                    const rsLogs = await patientModel.saveLogsCase(db, oldCase[0]);
                    if (!rsLogs) {
                        error += 'update logs case  error. '
                    }
                } else {
                    error += 'update case  error. '
                }
            } else {
                error += 'case edit not found. '
            }
            if (!error) {
                res.send({ ok: true, code: HttpStatus.OK });
            } else {
                res.send({ ok: false, error: error, code: HttpStatus.NO_CONTENT });
            }
        } else {
            res.send({ ok: false, error: 'case not found!!', code: HttpStatus.NO_CONTENT });
        }
    } catch (error) {
        res.send({ ok: false, error: error.message, code: HttpStatus.OK });
    }
});

router.delete('/covid-case-detail/:id', async (req: Request, res: Response) => {
    const db = req.db;
    const decoded = req.decoded
    const caseDetailId: any = req.params.id || ''
    let error = ''
    try {
        let caseDetail: any = await patientModel.getCaseDetail(db, caseDetailId);
        console.log(caseDetail);

        if (caseDetail[0]) {
            caseDetail[0].updated_by = decoded.id;
            caseDetail[0].update_date = moment().format('YYYY-MM-DD HH:mm:ss')
            const rsUpdate = await patientModel.deleteCaseDetail(db, caseDetailId);
            if (rsUpdate) {
                const rsLogs = await patientModel.saveLogsCaseDetail(db, caseDetail[0]);
                if (!rsLogs) {
                    error += 'update logs case deteil  error. '
                }
            } else {
                error += 'update case detail error. '
            }
            if (!error) {
                res.send({ ok: true, code: HttpStatus.OK });
            } else {
                res.send({ ok: false, error: error, code: HttpStatus.NO_CONTENT });
            }
        } else {
            res.send({ ok: false, error: 'case detail not found!!', code: HttpStatus.NO_CONTENT });
        }
    }
    catch (error) {
        res.send({ ok: false, error: error.message, code: HttpStatus.OK });
    }
})

router.put('/covid-case-detail', async (req: Request, res: Response) => {
    const db = req.db;
    const decoded = req.decoded
    const data: any = req.body.data || ''
    const caseDetailId = data.id
    // const oldInfo = await patientModel.getPerson(db, personId)
    // const oldHn = await patientModel.getPatient(db, patientId)

    try {
        let error = ''
        let oldCaseDetail: any = await patientModel.getCaseDetail(db, caseDetailId);
        console.log(oldCaseDetail);

        if (oldCaseDetail[0]) {
            const dataCaseDetail: any = {
                status: data.status
            }
            const findEdit = findIndex(oldCaseDetail, v => {
                return v.id === caseDetailId &&
                    v.status === dataCaseDetail.status
            })
            if (findEdit === -1) {
                oldCaseDetail[0].updated_by = decoded.id;
                oldCaseDetail[0].update_date = moment().format('YYYY-MM-DD HH:mm:ss')
                dataCaseDetail.updated_by = decoded.id;
                dataCaseDetail.update_date = moment().format('YYYY-MM-DD HH:mm:ss')
                const rsUpdate = await patientModel.updateCaseDetail(db, caseDetailId, dataCaseDetail);
                if (rsUpdate) {
                    const rsLogs = await patientModel.saveLogsCaseDetail(db, oldCaseDetail[0]);
                    if (!rsLogs) {
                        error += 'update logs case detail error. '
                    }
                } else {
                    error += 'update case detail error. '
                }
            } else {
                error += 'case edit not found. '
            }
            if (!error) {
                res.send({ ok: true, code: HttpStatus.OK });
            } else {
                res.send({ ok: false, error: error, code: HttpStatus.NO_CONTENT });
            }
        } else {
            res.send({ ok: false, error: 'case not found!!', code: HttpStatus.NO_CONTENT });
        }
    } catch (error) {
        res.send({ ok: false, error: error.message, code: HttpStatus.OK });
    }
});

export default router;
