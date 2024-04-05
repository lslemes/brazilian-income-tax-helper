import TaxCalculator from "./TaxCalculator";
import Transaction, { AssetType } from "./Transaction";

export default class FiiTaxCalculator extends TaxCalculator {
	constructor(transactions: Transaction[]) {
		super(transactions.filter((t) => t.asset.type === AssetType.Fii));
	}
}
