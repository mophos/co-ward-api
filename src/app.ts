/// <reference path="../typings.d.ts" />

require('dotenv').config();

import * as path from 'path';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as ejs from 'ejs';
import * as HttpStatus from 'http-status-codes';
import * as express from 'express';
import * as cors from 'cors';

import Knex = require('knex');
import { MySqlConnectionConfig } from 'knex';
import { Request, Response, NextFunction } from 'express';
import { Jwt } from './models/jwt';

import indexRoute from './routes/index';
import loginRoute from './routes/login';
import registerRoute from './routes/register';

import suppliesAdminRoute from './routes/admin/supplies';
import userAdminRoute from './routes/admin/user';
import userMinMaxAdminRoute from './routes/admin/supplies_min_max';
import hospitalAdminRoute from './routes/admin/hospital';
import restockAdminRoute from './routes/admin/restock';
import restockCollectionAdminRoute from './routes/admin/restock-collection';
import drugAdminRoute from './routes/admin/drug';
import fulfillRoute from './routes/admin/fulfill';

import suppliesStaffRoute from './routes/staff/supplies';
import balanceStaffRoute from './routes/staff/balance';
import smhRoute from './routes/staff/smh';
import payStaffRoute from './routes/staff/pay';
import bedStaffRoute from './routes/staff/bed';
import requisitionStaffRoute from './routes/staff/requisition';
import settingStaffRoute from './routes/staff/setting';
import requisitionSuppliesRoute from './routes/staff/requisition-supplies';
import drugStaffRoute from './routes/staff/drug';
import covidCaseRoute from './routes/staff/covid-case';
import userRoute from './routes/staff/user';
import reportRoute from './routes/staff/report';

import reportManagerRoute from './routes/report';
import basicRoute from './routes/basic';
import basicAuthRoute from './routes/basicAuth';
import servicesRoute from './routes/manager/services';
import eocRoute from './routes/eoc';
import approveDrugsRoute from './routes/staff/approve-drugs';
import approveSuppliesRoute from './routes/staff/approve-supplies';


// Assign router to the express.Router() instance
const app: express.Application = express();

const jwt = new Jwt();
const api = express.Router();
const admin = express.Router();
const staff = express.Router();
const manager = express.Router();


//view engine setup
app.set('views', path.join(__dirname, '../views'));
app.engine('.ejs', ejs.renderFile);
app.set('view engine', 'ejs');

//uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname,'../public','favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use(cors());

let connection: MySqlConnectionConfig = {
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  multipleStatements: true,
  // debug: true
}

let connectionEOC: MySqlConnectionConfig = {
  host: process.env.EOC_DB_HOST,
  port: +process.env.EOC_DB_PORT,
  database: process.env.EOC_DB_NAME,
  user: process.env.EOC_DB_USER,
  password: process.env.EOC_DB_PASSWORD,
  multipleStatements: true,
  // debug: true
}

let db = Knex({
  client: 'mysql',
  connection: connection,
  pool: {
    min: 0,
    max: 100,
    afterCreate: (conn, done) => {
      conn.query('SET NAMES utf8', (err) => {
        done(err, conn);
      });
    }
  },
});

let dbEOC = Knex({
  client: 'mysql',
  connection: connectionEOC,
  pool: {
    min: 0,
    max: 100,
    afterCreate: (conn, done) => {
      conn.query('SET NAMES utf8', (err) => {
        done(err, conn);
      });
    }
  },
});

app.use((req: Request, res: Response, next: NextFunction) => {
  req.db = db;
  req.dbEOC = dbEOC;
  next();
});

let checkAuth = (req: Request, res: Response, next: NextFunction) => {
  let token: string = null;

  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  } else {
    token = req.body.token;
  }

  jwt.verify(token)
    .then((decoded: any) => {
      req.decoded = decoded;
      next();
    }, err => {
      return res.send({
        ok: false,
        error: HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED),
        code: HttpStatus.UNAUTHORIZED
      });
    });
}

let adminAuth = (req, res, next) => {
  const decoded = req.decoded;

  try {
    if (decoded) {
      if (decoded.type === 'ADMIN') {
        next();
      } else {
        res.send({ ok: false, error: 'No permission found!' });
      }
    } else {
      res.send({ ok: false, error: 'No permission found!' });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message });
  }
}

let staffAuth = (req, res, next) => {
  const decoded = req.decoded;
  try {
    if (decoded) {
      if (decoded.type === 'STAFF') {
        next();
      } else {
        res.send({ ok: false, error: 'No permission found!' });
      }
    } else {
      res.send({ ok: false, error: 'No permission found!' });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message });
  }
}

let managerAuth = (req, res, next) => {
  const decoded = req.decoded;
  try {
    if (decoded) {
      if (decoded.type === 'MANAGER') {
        next();
      } else {
        res.send({ ok: false, error: 'No permission found!' });
      }
    } else {
      res.send({ ok: false, error: 'No permission found!' });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message });
  }
}

app.use('/v1', api);
api.use('/login', loginRoute);
api.use('/register', registerRoute);
api.use('/basic', basicRoute);
api.use('/report', checkAuth, reportManagerRoute)
api.use('/basic-auth', checkAuth, basicAuthRoute);

//admin
api.use('/admin', checkAuth, adminAuth, admin)
admin.use('/supplies', suppliesAdminRoute)
admin.use('/user', userAdminRoute)
admin.use('/supplies-min-max', userMinMaxAdminRoute)
admin.use('/hospital', hospitalAdminRoute)
admin.use('/restock', restockAdminRoute)
admin.use('/restock-collection', restockCollectionAdminRoute)
admin.use('/drugs', drugAdminRoute)
admin.use('/fulfill', fulfillRoute)

//manager
api.use('/manager', checkAuth, managerAuth, manager)
manager.use('/services', servicesRoute)
manager.use('/eoc', eocRoute)

//staff
api.use('/staff', checkAuth, staffAuth, staff)
staff.use('/supplies', suppliesStaffRoute)
staff.use('/users', userRoute)
staff.use('/smh', smhRoute)
staff.use('/balance', balanceStaffRoute)
staff.use('/pay', payStaffRoute)
staff.use('/report', reportRoute)
staff.use('/bed', bedStaffRoute)
staff.use('/requisition', requisitionStaffRoute)
staff.use('/requisition-supplies', requisitionSuppliesRoute)
staff.use('/setting', settingStaffRoute)
staff.use('/drugs', drugStaffRoute)
staff.use('/covid-case', covidCaseRoute)
staff.use('/approve-drugs', approveDrugsRoute)
staff.use('/approve-supplies', approveSuppliesRoute)

//index
app.use('/', indexRoute);

//error handlers

if (process.env.NODE_ENV === 'development') {
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.log(err.stack);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        ok: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        error: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR)
      }
    });
  });
}

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(HttpStatus.NOT_FOUND).json({
    error: {
      ok: false,
      code: HttpStatus.NOT_FOUND,
      error: HttpStatus.getStatusText(HttpStatus.NOT_FOUND)
    }
  });
});

export default app;
