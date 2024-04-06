import Transaction, { AssetType, TransactionType } from "../../transaction/Transaction";
import { MONTHS } from "../../utils";
import TaxCalculator from "../TaxCalculator";

export default class EtfTaxCalculator extends TaxCalculator {
	private static readonly darfRate = 0.15;

	constructor(transactions: Transaction[]) {
		super(transactions.filter((transaction) => transaction.asset.type === AssetType.Etf));
	}

	// include new asset types for fixed income etf
	protected getMonthlyProfit(year: number) {
		const transactions = this.transactions.filter(
			(transaction) =>
				transaction.date.getFullYear() === year && !["IRFM11", "IMAB11", "B5P211"].includes(transaction.asset.code),
		);
		return MONTHS.map((month) =>
			transactions
				.filter(
					(transaction) => transaction.type === TransactionType.Sell && transaction.date.getMonth() === month.value,
				)
				.reduce((totalProfit, transaction) => totalProfit + (transaction.profit ?? 0), 0),
		);
	}

	public getTaxReport(year: number) {
		return super.getTaxReport(year, EtfTaxCalculator.darfRate);
	}
}
