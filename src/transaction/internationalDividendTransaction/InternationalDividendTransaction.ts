import Asset from "../../asset/Asset";
import { Transaction } from "../Transaction";

export class InternationalDividendTransaction extends Transaction {
	constructor(
		date: Date,
		asset: Asset,
		readonly value: number,
	) {
		if (value <= 0) throw new Error(`${InternationalDividendTransaction.name} value ${value} must be positive.`);
		super(date, asset);
	}
}
