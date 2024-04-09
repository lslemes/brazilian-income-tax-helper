import Transaction, { AssetType } from "../../transaction/Transaction";
import TaxCalculator, { TaxReport } from "../TaxCalculator";

export default class BrazilianFiiTaxCalculator extends TaxCalculator {
	private static readonly DARF_RATE = 0.2;

	constructor(transactions: Transaction[]) {
		super(transactions.filter((transaction) => transaction.asset.type === AssetType.BrazilianFii));
	}

	public getTaxReport(year: number): TaxReport {
		return super.getTaxReport(year, BrazilianFiiTaxCalculator.DARF_RATE);
	}
}
