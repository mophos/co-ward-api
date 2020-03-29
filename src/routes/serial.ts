import { SerialModel } from './../models/serial';
/// <reference path="../../typings.d.ts" />
import { Router, Request, Response } from 'express';


const model = new SerialModel();

const router: Router = Router();

router.get('/check', async (req: Request, res: Response) => {
	const db = req.db;
	const serialNo = req.query.serialNo;
	try {
		const rs = await model.checkDup(db, serialNo);
		if (rs.length) {
			res.send({ ok: true, rows: rs[0] });
		} else {
			res.send({ ok: false });
		}
	} catch (error) {
		console.log(error);

		res.send({ ok: false, error: error })
	}
});



export default router;