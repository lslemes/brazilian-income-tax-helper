import Asset from "../../../../asset/Asset";
import { SellTransaction } from "../SellTransaction";

export class InternationalSellTransaction extends SellTransaction {
	constructor(date: Date, asset: Asset, price: number, quantity: number) {
		super(date, asset, price, quantity);
	}
}
