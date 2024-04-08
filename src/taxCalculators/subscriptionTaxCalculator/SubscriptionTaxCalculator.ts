import Transaction, { AssetType } from "../../transaction/Transaction";
import TaxCalculator from "../TaxCalculator";

export default class SubscriptionTaxCalculator extends TaxCalculator {
	private static readonly DARF_RATE = 0.15;

	constructor(transactions: Transaction[]) {
		super(transactions.filter((transaction) => transaction.asset.type === AssetType.Subscription));
	}

	public getTaxReport(year: number) {
		return super.getTaxReport(year, SubscriptionTaxCalculator.DARF_RATE);
	}
}
