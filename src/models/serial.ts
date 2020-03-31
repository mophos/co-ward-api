import Knex = require('knex');
import * as moment from 'moment';

export class SerialModel {

	getInfoSerial(knex: Knex, srType: any) {
		return knex('sys_serials')
			.where('type', srType)
			.limit(1);
	}

	async getSerial(knex: Knex, srType: any) {
		const serialInfo = await this.getInfoSerial(knex, srType);
		if (serialInfo.length) {
			const currentNo = serialInfo[0].serial_no;
			const serialPrefix = serialInfo[0].prefix || 'DO';
			const serialDate = moment().format('YYMMDD');
			const newSerialNo = this.paddingNumber(currentNo, 5);
			const serialCode = serialInfo[0].format;
			const warehoseCode = '00000';
			let sr: any = null;
			sr = serialCode.replace('PREFIX', serialPrefix).replace('WW', warehoseCode).replace('YYMMDD', serialDate).replace('##', newSerialNo);

			// update serial
			await this.updateSerial(knex, srType);
			return sr;
		} else {
			return 'ติดต่อผู้ดูแลระบบ';
		}
	}


	paddingNumber(currentNo: number, serialLength: number) {
		if (currentNo.toString().length > serialLength) {
			serialLength = currentNo.toString().length;
		}
		var pad_char = '0';
		var pad = new Array(1 + serialLength).join(pad_char);
		return (pad + currentNo).slice(-pad.length);
	}

	updateSerial(knex: Knex, srType) {
		return knex('sys_serials')
			.increment('serial_no', 1)
			.where('type', srType);
	}

	hashSerial(serial) {
		let sum = 0;
		serial = serial.toString();
		for (let i = 0; i < serial.length; i++) {
			sum += +serial[i] * (9 - i);
		}
		const mod = sum % 7;
		const hash = `${serial}${(7 - mod)}`;
		return hash;
	}

}