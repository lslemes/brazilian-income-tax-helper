import Asset from "../../../asset/Asset";
import { TradeTransaction } from "../TradeTransaction";

export abstract class SellTransaction extends TradeTransaction {
	constructor(
		date: Date,
		asset: Asset,
		price: number,
		quantity: number,
		public profitLoss: number = 0,
	) {
		super(date, asset, price, quantity);
	}
}
