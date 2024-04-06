import TaxCalculator from "./TaxCalculator";
import Transaction, { AssetType } from "./Transaction";

export default class FiiTaxCalculator extends TaxCalculator {
	constructor(transactions: Transaction[]) {
		super(transactions.filter((transaction) => transaction.asset.type === AssetType.Fii));
	}
}
