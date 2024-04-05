import TaxCalculator from "./TaxCalculator.js";
import Transaction, { AssetType } from "./Transaction.js";

export default class FiiTaxCalculator extends TaxCalculator {
	constructor(transactions: Transaction[]) {
		super(transactions.filter((t) => t.asset.type === AssetType.Fii));
	}
}
