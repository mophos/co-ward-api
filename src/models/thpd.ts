import * as Knex from 'knex';
const request = require("request");
export class ThpdModel {
	logThpd(db: Knex, data: any) {
		return db('log_thpd')
			.insert(data);
	}

	getPay(db: Knex) {
		return db('wm_pays');
	}
	updatePay(db: Knex, id, data) {
		return db('wm_pays')
			.update(data)
			.where('id', id);
	}

	async getOrder(data) {
		return new Promise((resolve: any, reject: any) => {
			var options = {
				method: 'POST',
				url: 'http://gw.dxplace.com/api/dxgateways/getorder',
				agentOptions: {
					rejectUnauthorized: false
				},
				headers:
				{
					'cache-control': 'no-cache',
					'content-type': 'application/json',
					'app_id': process.env.APP_ID,
					'app_key': process.env.APP_KEY
				},
				body: data,
				json: true
			};

			request(options, async function (error, body) {
				if (error) {
					reject(error);
				} else {
					resolve(body);
				};
			});
		});
	}


}