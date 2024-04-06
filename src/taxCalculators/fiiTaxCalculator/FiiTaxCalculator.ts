import Transaction, { AssetType } from "../../transaction/Transaction";
import TaxCalculator from "../TaxCalculator";

export default class FiiTaxCalculator extends TaxCalculator {
	private static readonly darfRate = 0.2;

	constructor(transactions: Transaction[]) {
		super(transactions.filter((transaction) => transaction.asset.type === AssetType.Fii));
	}

	public getTaxReport(year: number) {
		return super.getTaxReport(year, FiiTaxCalculator.darfRate);
	}
}
