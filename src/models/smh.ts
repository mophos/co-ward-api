import Knex = require('knex');
import request = require("request");
import { eventNames } from 'cluster';

export class smhModel {

  getToken(db: Knex) {
    return db('sys_token_shm').where('is_actived', 'Y');
  }

  getPerson(db: Knex, keys) {
    return db('p_persons as p')
      .select('p.*', 't.full_name as title_name')
      .join('um_titles as t', 't.id', 'p.title_id')
      .where((v) => {
        v.where('p.cid', 'like', '%' + keys + '%')
        v.orWhere('p.passport', 'like', '%' + keys + '%')
        v.orWhere('p.first_name', 'like', '%' + keys + '%')
        v.orWhere('p.last_name', 'like', '%' + keys + '%')
      });
  }

  getZipcode(db: Knex, id: any) {
    return db('b_subdistrict')
      .where('id', id);
  }

  getAddress(db: Knex, tCode, aCode, pCode) {
    return db('view_address')
      .where('tambon_code', tCode)
      .where('ampur_code', aCode)
      .where('province_code', pCode)
  }

  getProvince(db: Knex, code) {
    return db('b_province').where('code', code);
  }

  getDistrict(db: Knex, code) {
    return db('b_district').where('ampur_code_full', code);
  }

  getSubDistrict(db: Knex, code) {
    return db('b_subdistrict').where('id', code);
  }


  removeLabPositiveTmp(db: Knex) {
    return db('lab_positive_tmp').delete();
  }
  saveLabPositiveTmp(db: Knex, data) {
    return db('lab_positive_tmp').insert(data);
  }
  triggerLabPositive(db: Knex) {
    return db.raw('call lab_positive()');
  }

  getSmarthealth(cid, token) {
    return new Promise((resolve: any, reject: any) => {
      var options = {
        method: 'GET',
        url: `https://smarthealth.service.moph.go.th/phps/api/person/v2/findby/cid?cid=${cid}`,
        agentOptions: {
          rejectUnauthorized: false
        },
        headers:
        {
          'content-type': 'application/json',
          'jwt-token': token
        },
        json: true
      };

      request(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  }

  apiLogin() {
    return new Promise((resolve: any, reject: any) => {
      var options = {
        method: 'POST',
        url: `https://indev.moph.go.th/ncov-2019-api/login`,
        agentOptions: {
          rejectUnauthorized: false
        },
        headers:
        {
          'content-type': 'application/json',
        },
        body: {
          "username": `${process.env.API_INDEV_USERNAME}`,
          "password": `${process.env.API_INDEV_PASSWORD}`
        },
        json: true
      };

      request(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  }

  getLabCovidCid(keys, token) {
    keys = encodeURIComponent(keys);
    return new Promise((resolve: any, reject: any) => {
      var options = {
        method: 'GET',
        url: `https://indev.moph.go.th/ncov-2019-api/patient/getPatientByCID/${keys}`,
        agentOptions: {
          rejectUnauthorized: false
        },
        headers: {
          authorization: `Bearer ${token}`
        },
        json: true
      };
      request(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  }

  getLabCovidPassport(keys, token) {
    keys = encodeURIComponent(keys);
    return new Promise((resolve: any, reject: any) => {
      var options = {
        method: 'GET',
        url: `https://indev.moph.go.th/ncov-2019-api/patient/getPatientByPassport/${keys}`,
        agentOptions: {
          rejectUnauthorized: false
        },
        headers: {
          authorization: `Bearer ${token}`
        },
        json: true
      };
      request(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  }

  getLabPositive(token) {
    return new Promise((resolve: any, reject: any) => {
      var options = {
        method: 'GET',
        url: `https://indev.moph.go.th/ncov-2019-api/patient/getResultsPositive`,
        agentOptions: {
          rejectUnauthorized: false
        },
        headers: {
          authorization: `Bearer ${token}`
        },
        json: true
      };
      request(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  }

  getSmarthealthAddress(cid, token) {
    return new Promise((resolve: any, reject: any) => {
      var options = {
        method: 'GET',
        url: `https://smarthealth.service.moph.go.th/phps/api/address/v1/find_by_cid?cid=${cid}`,
        agentOptions: {
          rejectUnauthorized: false
        },
        headers:
        {
          'content-type': 'application/json',
          'jwt-token': token
        },
        json: true
      };

      request(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  }

  infoCid(cid, token) {
    return new Promise((resolve, reject) => {
      var options = {
        method: 'POST',
        url: 'https://smarthealth.service.moph.go.th/phps/api/00023/001/01',
        agentOptions: {
          rejectUnauthorized: false
        },
        headers: {
          'jwt-token': token,
          'content-type': 'application/json'
        },
        body: cid
      };

      request(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(JSON.parse(body));
        }
      });
    });
  }

  infoCidAddress(cid, token) {
    return new Promise((resolve, reject) => {
      var options = {
        method: 'POST',
        url: 'https://smarthealth.service.moph.go.th/phps/api/00023/008/01',
        agentOptions: {
          rejectUnauthorized: false
        },
        headers: {
          'jwt-token': token,
          'content-type': 'application/json'
        },
        body: cid
      };

      request(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(JSON.parse(body));
        }
      });
    });
  }

  checklaser(token, cid, firstName, lastName, birthDay, laser) {
    return new Promise((resolve: any, reject: any) => {
      var options = {
        method: 'POST',
        url: `https://smarthealth.service.moph.go.th/phps/public/api/card/bylaser`,
        agentOptions: {
          rejectUnauthorized: false
        },
        headers:
        {
          'content-type': 'application/json',
          'jwt-token': token
        },
        body: {
          cid,
          firstName,
          lastName,
          birthDay,
          laser
        },
        json: true
      };

      request(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  }

}