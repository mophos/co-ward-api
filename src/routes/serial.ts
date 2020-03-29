import { SerialModel } from './../models/serial';
/// <reference path="../../typings.d.ts" />
import { Router, Request, Response } from 'express';


const model = new SerialModel();

const router: Router = Router();


export default router;