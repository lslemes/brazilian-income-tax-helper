import Transaction, { AssetType } from "../../transaction/Transaction";
import TaxCalculator from "../TaxCalculator";

export default class EtfTaxCalculator extends TaxCalculator {
	constructor(transactions: Transaction[]) {
		super(transactions.filter((transaction) => transaction.asset.type === AssetType.Etf));
	}
}
