import Knex = require('knex');
import request = require("request");

export class smhModel {

  getToken(db: Knex) {
    return db('sys_token_shm').where('is_actived', 'Y');
  }

  getZipcode(db: Knex, id: any) {
    return db('b_subdistrict')
      .where('id', id);
  }
  getProvince(db: Knex, id: any) {
    return db('b_subdistrict')
      .where('id', id);
  }
  getDistrict(db: Knex, id: any) {
    return db('b_district')
      .where('id', id);
  }
  getSubdistrict(db: Knex, id: any) {
    return db('b_province')
      .where('id', id);
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
}