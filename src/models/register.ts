import * as Knex from 'knex';
var request = require("request");
import * as crypto from 'crypto';

export class Register {

    getHospCode(db: Knex, hospcode) {
        return db('l_hospitals')
            .where('hospcode', hospcode)
    }

    autocompleteHospital(db: Knex, query) {
        const _q = `%${query}%`;
        return db('l_hospitals')
            .orWhere('hospname', 'like', _q)
            .orderBy('hospname')
    }

    insertUser(db: Knex, data = {}) {
        return db('um_users')
            .insert(data, 'id');
    }

    getTitles(db: Knex) {
        return db('um_titles')
            .where('is_deleted', 'N')
    }

    getPositions(db: Knex) {
        return db('um_positions')
            .where('is_deleted', 'N')
    }

    getRights(db: Knex, rights) {
        return db('um_rights')
            .whereIn('name', rights)
    }

    insertUserRights(db: Knex, data = {}) {
        return db('um_user_rights')
            .insert(data);
    }

    reqOTP(tel) {
        return new Promise((resolve, reject) => {
            var options = {
                method: 'POST',
                url: 'https://covid19.moph.go.th/authentication/register',
                headers: { 'content-type': 'application/json' },
                body: { tel: tel, appId: '76503a47-cea5-482f-ae27-e151ca5a2722' },
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
    verifyOTP(refCode, otp) {
        return new Promise((resolve, reject) => {
            var options = {
                method: 'POST',
                url: 'https://covid19.moph.go.th/authentication/verify',
                headers: { 'content-type': 'application/json' },
                body: {
                    refCode: refCode,
                    otp: otp,
                    appId: '76503a47-cea5-482f-ae27-e151ca5a2722'
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

    getNodeDrugs(db: Knex, id = '') {
        return db('h_node_drugs')
            .where('hospital_id', id)
    }
    getNodeSupplies(db: Knex, id = '') {
        return db('h_node_supplies')
            .where('hospital_id', id)
    }

    getGroupRight(db: Knex, groupName: any) {
        return db('um_group_right AS ug')
            .select('ur.name')
            .join('um_group_rights_details as ugrd', 'ugrd.group_id', 'ug.id')
            .join('um_rights as ur', 'ur.id', 'ugrd.right_id')
            .where('ug.name', groupName)
            .whereNot('ur.name', 'STAFF_SETTING_USERS')
    }

    sendMS(data) {
        console.log(data);
        return new Promise((resolve, reject) => {
            var options = {
                method: 'POST',
                url: 'https://test-api-menagement.azure-api.net/regisapi/med-covid-moph/moph/v1/register.action',
                headers: {
                    'ocp-apim-subscription-key': 'fcce9158dc0f43f2bc48ae1cda642761',
                    'content-type': 'application/json'
                }, body: {
                    hospital: data.hospitalId,
                    hospcodeConfirm: data.hospcode,
                    cid: data.cid,
                    position: data.positionId,
                    title: data.titleId,
                    firstName: data.fname,
                    lastName: data.lname,
                    username: data.username,
                    password: crypto.createHash('md5').update(data.password).digest('hex'),
                    email: data.email,
                    phoneNumber: data.telephone
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


    sendMS2(data) {
        console.log(data);

        return new Promise((resolve, reject) => {
            var options = {
                method: 'POST',
                url: 'https://test-api-menagement.azure-api.net/regisapi/med-covid-moph/moph/v1/register.action',
                headers: {
                    'ocp-apim-subscription-key': 'fcce9158dc0f43f2bc48ae1cda642761',
                    'content-type': 'application/json'
                }, body: {
                    hospital: data.hospital_id,
                    hospcodeConfirm: data.hospcode,
                    cid: data.cid,
                    position: data.position_id,
                    title: data.title_id,
                    firstName: data.fname,
                    lastName: data.lname,
                    username: data.username,
                    password: data.password,
                    email: data.email,
                    phoneNumber: data.telephone
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

    getUserMedicine(db: Knex) {
        return db('um_users as u')
            .select('u.*', 'h.hospname', 'h.id as hospital_id')
            .join('b_hospitals as h', 'h.hospcode', 'u.hospcode')
            .whereIn('u.position_id', ['5','8','74', '75','76','77','79'])
            // .whereIn('u.position_id', ['5', '8'])
            // .whereIn('u.id', [ '3341'])
        // .offset(1);
    }
}