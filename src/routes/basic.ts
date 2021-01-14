import { BasicModel } from '../models/basic';
/// <reference path="../../typings.d.ts" />
import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import { SerialModel } from '../models/serial';
import { map } from 'lodash';
const fse = require('fs-extra');
const fs = require('fs');

const path = require('path')
import moment = require('moment');
const model = new BasicModel();


const router: Router = Router();

router.get('/title', async (req: Request, res: Response) => {
  try {
    let rs: any = await model.getTitles(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/hospital', async (req: Request, res: Response) => {
  try {
    let rs: any = await model.getHospitalReq(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/position', async (req: Request, res: Response) => {
  try {
    let rs: any = await model.getPositions(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/generics', async (req: Request, res: Response) => {
  try {
    let rs: any = await model.getGenerics(req.db);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/autocomplete/tambon', async (req: Request, res: Response) => {
  const db = req.db;
  const query = req.query.q;
  const length = req.query.length || 2;
  try {
    if (query.length >= length) {
      const rs = await model.autocompleteTambon(db, query);
      if (rs[0].length) {
        res.send(rs[0]);
      } else {
        res.send([]);
      }
    }
  } catch (error) {
    res.send([]);
  }

});

router.get('/autocomplete/ampur', async (req: Request, res: Response) => {
  const db = req.db;
  const query = req.query.q;
  const length = req.query.length || 2;
  try {
    if (query.length >= length) {
      const rs = await model.autocompleteAmpur(db, query);
      if (rs[0].length) {
        res.send(rs[0]);
      } else {
        res.send([]);
      }
    }
  } catch (error) {
    res.send([]);
  }

});

router.get('/autocomplete/province', async (req: Request, res: Response) => {
  const db = req.db;
  const query = req.query.q;
  const length = req.query.length || 2;
  try {
    if (query.length >= length) {
      const rs = await model.autocompleteProvince(db, query);
      if (rs.length) {
        res.send(rs);
      } else {
        res.send([]);
      }
    }
  } catch (error) {
    res.send([]);
  }

});

router.get('/autocomplete/zipcode', async (req: Request, res: Response) => {
  const db = req.db;
  const query = req.query.q;
  const length = req.query.length || 3;
  try {
    if (query.length >= length) {
      const rs = await model.autocompleteZipcode(db, query);
      if (rs.length) {
        res.send(rs);
      } else {
        res.send([]);
      }
    }
  } catch (error) {
    res.send([]);
  }

});

router.get('/hospcode/autocomplete/search', async (req: Request, res: Response) => {
  const db = req.db;
  const query = req.query.q;
  const length = req.query.length || 2;
  try {
    if (query.length >= length) {
      const rs = await model.autocompleteHospital(db, query);
      if (rs.length) {
        res.send(rs);
      } else {
        res.send([]);
      }
    } else {
      res.send([]);
    }
  } catch (error) {
    res.send([]);
  }
});

router.get('/countries/autocomplete/search', async (req: Request, res: Response) => {
  const db = req.db;
  const query = req.query.q;
  const length = req.query.length || 2;
  try {
    if (query.length >= length) {
      const rs = await model.autocompleteCountry(db, query);
      if (rs.length) {
        res.send(rs);
      } else {
        res.send([]);
      }
    } else {
      res.send([]);
    }
  } catch (error) {
    res.send([]);
  }
});

router.get('/systems', async (req: Request, res: Response) => {
  try {
    let rs: any = await model.getSystems(req.db);
    if (rs.length) {
      res.send({ ok: true, rows: rs[0].status, code: HttpStatus.OK });
    } else {
      res.send({ ok: true, rows: 'OPEN', code: HttpStatus.OK });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/getAddCode', async (req: Request, res: Response) => {
  try {
    const tambon = req.query.t
    const ampur = req.query.a
    const province = req.query.p
    const zipcode = req.query.z
    console.log( tambon, ampur, province, zipcode);
    
    let rs: any = await model.getAdd(req.db, tambon, ampur, province, zipcode);
    console.log(1,rs);
    
    if (rs[0].length) {
      res.send({ ok: true, rows: rs[0], code: HttpStatus.OK });
    } else {
      res.send({ ok: false, code: HttpStatus.NOT_FOUND });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/gender', async (req: Request, res: Response) => {
  try {
    let rs: any = await model.getGender(req.db);
    if (rs) {
      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, code: HttpStatus.NOT_FOUND });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});



// router.post('/manageData', async (req: Request, res: Response) => {
//   let db = req.db
//   const query: any = req.body.query
//   const typeQ: any = req.body.typeQ
//   const typeS: any = req.body.typeS
//   const typeD: any = req.body.typeD
//   const deleted: any = req.body.deleted
//   try {
//     let persons: any
//     let personId: any
//     let patients: any
//     let patientId: any
//     let coCases: any
//     let coCaseId: any
//     let coCaseDtails: any
//     let coCaseDtailId: any
//     let reqDrugs: any
//     let reqDrugId: any
//     let reqDrugDetails: any
//     let reqDrugDetailId: any
//     let reqSupplies: any
//     let reqSupplieId: any
//     let reqSupplieDetails: any
//     let reqSupplieDetailId: any
//     let data: any
//     if (typeS > 0) {
//       console.log(query, typeQ)
//       persons = await model.getPerson(db, query, typeQ);
//       personId = map(persons, 'id')
//       patients = await model.getPatient(db, personId)
//       patientId = map(patients, 'id')
//       console.log(persons);
//       if (typeS > 1) {
//         coCases = await model.getCoCase(db, patientId)
//         coCaseId = map(coCases, 'id')
//         coCaseDtails = await model.getCoCaseDetail(db, coCaseId)
//         coCaseDtailId = map(coCaseDtails, 'id')
//       }

//       if (typeS > 2) {
//         reqSupplies = await model.getReqSupplies(db, coCaseDtailId)
//         reqSupplieId = map(reqSupplies, 'id')
//         reqSupplieDetails = await model.getReqDetail(db, reqSupplieId)
//         reqSupplieDetailId = map(reqSupplieDetails, 'id')
//       }
//       if (typeS > 3) {
//         reqDrugs = await model.getReqDrug(db, coCaseDtailId)
//         reqDrugId = map(reqDrugs, 'id')
//         reqDrugDetails = await model.getReqDetail(db, reqDrugId)
//         reqDrugDetailId = map(reqDrugDetails, 'id')
//       }

//       fse.ensureDirSync(process.env.TMP_PATH);
//       if (persons.length) {
//         let filename = `manageData` + persons[0].cid + moment().format('YYYY-MM-DD HH:m:s:ms');
//         let filenamePath = path.join(process.env.TMP_PATH, filename + '.json');

//         data = {
//           persons: persons,
//           personId: personId,
//           patients: patients,
//           patientId: patientId,
//           coCases: coCases,
//           coCaseId: coCaseId,
//           coCaseDtails: coCaseDtails,
//           coCaseDtailId: coCaseDtailId,
//           reqDrugs: reqDrugs,
//           reqDrugId: reqDrugId,
//           reqDrugDetails: reqDrugDetails,
//           reqDrugDetailId: reqDrugDetailId,
//           reqSupplies: reqSupplies,
//           reqSupplieId: reqSupplieId,
//           reqSupplieDetails: reqSupplieDetails,
//           reqSupplieDetailId: reqSupplieDetailId

//         }

//         if (deleted == 1) {
//           fs.writeFile(filenamePath, JSON.stringify(data), async (err) => {
//             if (typeD > 0) {
//               await model.deletedReq(db, reqSupplieId)
//               await model.deletedReqDetail(db, reqSupplieDetailId)
//             }
//             if (typeD > 1) {
//               await model.deletedReq(db, reqDrugId)
//               await model.deletedReqDetail(db, reqDrugDetailId)
//             }
//             if (typeD > 2) {
//               await model.deletedCoCase(db, coCaseId)
//               await model.deletedCoCaseDatail(db, coCaseDtailId)
//             }
//             if (typeD > 3) {
//               await model.deletedPatient(db, patientId)
//               await model.deletedPerson(db, personId)
//             }
//             // In case of a error throw err. 
//             if (err) throw err;
//           })
//         }
//       }

//     }
//     res.send({
//       ok: true, data: data, code: HttpStatus.OK
//     });
//   } catch (error) {
//     res.send({ ok: false, error: error.message, code: HttpStatus.OK });
//   }
// });

export default router;