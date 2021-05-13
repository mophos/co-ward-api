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

        const oldInfo: any = await patientModel.getPerson(db, personId)
        const oldHn = await patientModel.getPatient(db, patientId)
        console.log(data.birth_date);

        const personData: any = {
            gender_id: data.gender_id,
            title_id: data.title_id,
            first_name: data.first_name,
            last_name: data.last_name,
            telephone: data.telephone,
            birth_date: data.birth_date,
            cid: data.cid,
            house_no: data.house_no,
            room_no: data.room_no,
            village_name: data.village_name,
            road: data.road,
            tambon_code: data.tambon_code,
            tambon_name: data.tambon_name,
            ampur_code: data.ampur_code,
            ampur_name: data.ampur_name,
            province_code: data.province_code,
            province_name: data.province_name,
            zipcode: data.zipcode
        }
        const patientData: any = {
            hn: data.hn
        }

        if (oldInfo && oldHn) {
            const findEdit = findIndex(oldInfo, (v: any) => {
                return v.id === personId &&
                    v.gender_id === personData.gender_id &&
                    v.title_id === personData.title_id &&
                    v.first_name === personData.first_name &&
                    v.last_name === personData.last_name &&
                    v.telephone === personData.telephone &&
                    v.birth_date === personData.birth_date &&
                    v.cid === personData.cid &&
                    v.house_no === personData.house_no &&
                    v.room_no === personData.room_no &&
                    v.village_name === personData.village_name &&
                    v.road === personData.road &&
                    v.tambon_code === personData.tambon_code &&
                    v.tambon_name === personData.tambon_name &&
                    v.ampur_code === personData.ampur_code &&
                    v.ampur_name === personData.ampur_name &&
                    v.province_code === personData.province_code &&
                    v.province_name === personData.province_name &&
                    v.zipcode === personData.zipcode
            })
            let peLogs, paLogs: any = false

            if (findEdit === -1) {
                oldInfo[0].updated_by = decoded.id;
                oldInfo[0].update_date = moment().format('YYYY-MM-DD HH:mm:ss')
                personData.updated_by = decoded.id;
                personData.update_date = moment().format('YYYY-MM-DD HH:mm:ss')
                const rsUpdate = await patientModel.updatePerson(db, personId, personData);
                console.log(rsUpdate, 'update');
                if (rsUpdate) {
                    const rs = await patientModel.saveLogsPerson(db, oldInfo[0]);
                    peLogs = rs.length > 0 ? true : false;
                }
            }
            const findHn = findIndex(oldHn, (v: any) => v.hn === patientData.hn)
            if (findHn === -1) {
                oldHn[0].updated_by = decoded.id;
                oldHn[0].update_date = moment().format('YYYY-MM-DD HH:mm:ss')
                patientData.updated_by = decoded.id;
                patientData.update_date = moment().format('YYYY-MM-DD HH:mm:ss')
                const rsUpdate = await patientModel.updatePatient(db, patientId, patientData);
                if (rsUpdate) {
                    const rs = await patientModel.saveLogsPatient(db, oldHn[0]);
                    console.log(rs, 'patients');
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
        for (const v of rs) {
            v.s_entry_date = moment(v.entry_date).format('YYYY-MM-D');
            v.date_discharge = moment(v.date_discharge).format('YYYY-MM-D');
        }
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
            const findEdit = findIndex(oldCase, (v: any) => {
                let d = true;
                let cd = true;
                let ad = true;

                dataCase.date_admit = data.date_admit;
                ad = moment(v.date_admit).format('YYYY-MM-DD HH:mm:ss') === moment(dataCase.date_admit).format('YYYY-MM-DD HH:mm:ss');

                if (dataCase.status !== 'ADMIT') {
                    dataCase.date_discharge = data.date_discharge;
                    d = moment(v.date_discharge).format('YYYY-MM-DD HH:mm:ss') === moment(dataCase.date_discharge).format('YYYY-MM-DD HH:mm:ss');
                } else {
                    dataCase.date_discharge = null;
                    d = false;
                }
                console.log(data.confirm_date);

                if (dataCase.status == 'IPPUI') {
                    dataCase.confirm_date = null;
                    cd = false;
                } else {
                    if (data.confirm_date) {
                        dataCase.confirm_date = moment(data.confirm_date).format('YYYY-MM-DD');
                        cd = moment(v.confirm_date).format('YYYY-MM-DD') === moment(dataCase.confirm_date).format('YYYY-MM-DD');
                    } else {
                        dataCase.confirm_date = null;
                    }
                }
                return v.id === caseId &&
                    v.an === dataCase.an &&
                    d &&
                    cd &&
                    ad &&
                    v.case_status === dataCase.case_status &&
                    v.confirm_date === dataCase.confirm_date &&
                    v.date_discharge === dataCase.date_discharge &&
                    v.status === dataCase.status
            })
            if (findEdit === -1) {
                oldCase[0].updated_by = decoded.id;
                oldCase[0].update_date = moment().format('YYYY-MM-DD HH:mm:ss')
                dataCase.updated_by = decoded.id;
                dataCase.update_date = moment().format('YYYY-MM-DD HH:mm:ss')
                console.log(dataCase);

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
                status: data.status,
                gcs_id: data.gcs_id,
                medical_supplie_id: data.medical_supplie_id,
                bed_id: data.bed_id
            }
            const findEdit = findIndex(oldCaseDetail, (v: any) => {
                return v.id === caseDetailId &&
                    v.status === dataCaseDetail.status &&
                    v.gcs_id === dataCaseDetail.gcs_id &&
                    v.bed_id === dataCaseDetail.bed_id &&
                    v.medical_supplie_id === dataCaseDetail.medical_supplie_id
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

router.post('/covid-case-detail', async (req: Request, res: Response) => {
    const db = req.db;
    const data: any = req.body.data;
    const caseId: any = req.query.caseId;
    let error = ''
    try {
        let caseDetail: any = await patientModel.getCaseDetailByCaseId(db, caseId);
        let caseDetailId: any = [];
        if (caseDetail.length > 0) {
            for (const v of caseDetail) {
                v.updated_by = req.decoded.id;
                v.update_date = moment().format('YYYY-MM-DD HH:mm:ss');
                caseDetailId.push(v.id);
            }
            const rsLogs = await patientModel.saveLogsCaseDetail(db, caseDetail);

            if (!rsLogs) {
                error += 'update logs case deteil  error. '
            }

            for (const v of data) {
                v.covid_case_id = +caseId
            }

            await patientModel.deleteCaseDetailByCaseId(db, caseDetailId);
            const rsi = await patientModel.insertCaseDetail(db, data);
            if (rsi) {
            } else {
                error += 'insert case detail error. '
            }
            if (!error) {
                res.send({ ok: true, code: HttpStatus.OK });
            } else {
                res.send({ ok: false, error: error, code: HttpStatus.NO_CONTENT });
            }
        } else {
            res.send({ ok: false, error: 'case detail not found!!', code: HttpStatus.NO_CONTENT });
        }
    } catch (error) {
        console.log(error);
        res.send({ ok: false, message: error });
    }
});

export default router;
