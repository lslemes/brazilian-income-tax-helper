import Asset from "../../../../asset/Asset";
import { TradeTransaction } from "../../TradeTransaction";

export class BrazilianBuyTransaction extends TradeTransaction {
	constructor(date: Date, asset: Asset, price: number, quantity: number) {
		super(date, asset, price, quantity);
	}
}
