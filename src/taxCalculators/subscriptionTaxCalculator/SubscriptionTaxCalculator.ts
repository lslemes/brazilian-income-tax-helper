import Transaction, { AssetType } from "../../transaction/Transaction";
import TaxCalculator from "../TaxCalculator";

export default class SubscriptionTaxCalculator extends TaxCalculator {
	constructor(transactions: Transaction[]) {
		super(transactions.filter((transaction) => transaction.asset.type === AssetType.Subscription));
	}
}
