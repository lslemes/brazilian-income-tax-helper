import TaxCalculator from "./TaxCalculator.js";
import Transaction, { AssetType, TransactionType } from "./Transaction.js";
import { MONTHS } from "./utils.js";

export default class StockTaxCalculator extends TaxCalculator {
	constructor(transactions: Transaction[]) {
		super(transactions.filter((t) => t.asset.type === AssetType.Stock));
	}

	getMonthlySoldValue() {
		return MONTHS.map((month) => ({
			month: month.label,
			amount: StockTaxCalculator.getMonetaryValue(
				this.transactions
					.filter((t) => t.date.getMonth() === month.value && t.type === TransactionType.Sell)
					.reduce((total, t) => total + t.value, 0),
			),
		}));
	}

	getProfitByStock() {
		const profitMap = new Map<string, number>();

		for (const t of this.transactions) {
			const assetCode = t.asset.code;
			if (t.profit) profitMap.set(assetCode, (profitMap.get(assetCode) ?? 0) + t.profit);
		}

		for (const [key, value] of profitMap) profitMap.set(key, StockTaxCalculator.getMonetaryValue(value));

		const sortedProfitMap = new Map([...profitMap.entries()].sort());
		return sortedProfitMap;
	}
}
