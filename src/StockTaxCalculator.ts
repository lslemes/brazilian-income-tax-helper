import TaxCalculator from "./TaxCalculator";
import Transaction, { AssetType, TransactionType } from "./Transaction";
import { MONTHS } from "./utils";

export default class StockTaxCalculator extends TaxCalculator {
	constructor(transactions: Transaction[]) {
		super(transactions.filter((transaction) => transaction.asset.type === AssetType.Stock));
	}

	private getMonthlySalesVolume(year: number) {
		const transactions = this.transactions.filter((transaction) => transaction.date.getFullYear() === year);
		return MONTHS.map((month) =>
			transactions
				.filter(
					(transaction) => transaction.date.getMonth() === month.value && transaction.type === TransactionType.Sell,
				)
				.reduce((totalValue, transaction) => totalValue + transaction.value, 0),
		);
	}

	private getProfitByStock(year: number) {
		const profitByStock = new Map<string, number>();
		const transactions = this.transactions.filter((transaction) => transaction.date.getFullYear() === year);
		for (const transaction of transactions) {
			const assetCode = transaction.asset.code;
			if (transaction.profit !== null)
				profitByStock.set(assetCode, (profitByStock.get(assetCode) ?? 0) + transaction.profit);
		}
		return profitByStock;
	}
}
