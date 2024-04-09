import Transaction, { AssetType } from "../../transaction/Transaction";
import TaxCalculator, { TaxReport } from "../TaxCalculator";

export default class BrazilianSubscriptionTaxCalculator extends TaxCalculator {
	private static readonly DARF_RATE = 0.15;

	constructor(transactions: Transaction[]) {
		super(transactions.filter((transaction) => transaction.asset.type === AssetType.BrazilianSubscription));
	}

	public getTaxReport(year: number): TaxReport {
		return super.getTaxReport(year, BrazilianSubscriptionTaxCalculator.DARF_RATE);
	}
}
