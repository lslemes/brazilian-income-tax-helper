import Asset from "../../asset/Asset";
import { Transaction } from "../Transaction";

export abstract class TradeTransaction extends Transaction {
	constructor(
		date: Date,
		asset: Asset,
		readonly price: number,
		readonly quantity: number,
	) {
		const className = TradeTransaction.name;
		if (price < 0) throw new Error(`${className} price ${price} must not be negative.`);
		if (quantity <= 0) throw new Error(`${className} quantity ${quantity} must be positive.`);
		super(date, asset);
	}

	get value(): number {
		return this.price * this.quantity;
	}
}
