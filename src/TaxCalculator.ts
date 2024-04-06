import Transaction, { TransactionType } from "./Transaction";
import { MONTHS } from "./utils";

export default abstract class TaxCalculator {
	private readonly positionMapByYear = new Map<number, Map<string, number>>();
	private readonly averagePriceMapByYear = new Map<number, Map<string, number>>();
	protected readonly transactions: Transaction[];

	constructor(transactions: Transaction[]) {
		const { averagePriceMapByYear, positionMapByYear, transactionsWithProfit } =
			TaxCalculator.getYearlyTaxData(transactions);
		this.transactions = transactionsWithProfit;
		this.averagePriceMapByYear = averagePriceMapByYear;
		this.positionMapByYear = positionMapByYear;
	}

	private static getUpdatedAveragePrice(
		currentPosition: number,
		currentAveragePrice: number,
		positionIncrement: number,
		valueIncrement: number,
	) {
		if (currentPosition < 0) throw new Error(`Current position ${currentPosition} must not be negative.`);
		if (currentAveragePrice < 0) throw new Error(`Current average price ${currentAveragePrice} must not be negative.`);
		if (positionIncrement <= 0) throw new Error(`Position increment ${positionIncrement} must be positive.`);
		if (valueIncrement < 0) throw new Error(`Value increment ${valueIncrement} must not be negative.`);
		return (currentPosition * currentAveragePrice + valueIncrement) / (currentPosition + positionIncrement);
	}

	protected static getMonetaryValue(value: number) {
		return Number(value.toFixed(2));
	}

	private static getYearlyTaxData(transactions: Transaction[]) {
		const positionByAssetCode = new Map<string, number>();
		const averagePriceByAssetCode = new Map<string, number>();
		const positionMapByYear = new Map<number, typeof positionByAssetCode>();
		const averagePriceMapByYear = new Map<number, typeof averagePriceByAssetCode>();

		let currentYear: number | null = null;
		const transactionsWithProfit = transactions.map((transaction) => {
			const year = transaction.date.getFullYear();
			if (currentYear === null) currentYear = year;
			while (year > currentYear) {
				positionMapByYear.set(currentYear, new Map(positionByAssetCode));
				averagePriceMapByYear.set(currentYear, new Map(averagePriceByAssetCode));
				currentYear++;
			}

			const { quantity, value, type } = transaction;
			const assetCode = transaction.asset.code;
			const position = positionByAssetCode.get(assetCode) ?? 0;
			const averagePrice = averagePriceByAssetCode.get(assetCode) ?? 0;

			switch (type) {
				case TransactionType.Buy:
					positionByAssetCode.set(assetCode, position + quantity);
					averagePriceByAssetCode.set(
						assetCode,
						TaxCalculator.getUpdatedAveragePrice(position, averagePrice, quantity, value),
					);
					break;
				case TransactionType.Sell:
					transaction.profit = value - quantity * averagePrice;
					if (position - quantity <= 0) {
						averagePriceByAssetCode.delete(assetCode);
						positionByAssetCode.delete(assetCode);
					} else {
						positionByAssetCode.set(assetCode, position - quantity);
					}
					break;
			}

			return transaction;
		});
		if (currentYear !== null) {
			positionMapByYear.set(currentYear, new Map(positionByAssetCode));
			averagePriceMapByYear.set(currentYear, new Map(averagePriceByAssetCode));
		}

		return { transactionsWithProfit, positionMapByYear, averagePriceMapByYear };
	}

	getMonthlyProfit() {
		return MONTHS.map((month) => ({
			month: month.label,
			profit: TaxCalculator.getMonetaryValue(
				this.transactions
					.filter((t) => t.profit !== null && t.date.getMonth() === month.value)
					.reduce((totalProfit, t) => totalProfit + (t.profit ?? 0), 0),
			),
		}));
	}

	getSituation(year: number) {
		const situationMap = new Map<string, { position: number; situation: number }>();
		for (const [assetCode, position] of this.positionMapByYear.get(year)!) {
			if (position < 0) throw new Error(`Negative position ${position} ${assetCode}.`);
			const averagePriceMap = this.averagePriceMapByYear.get(year)!;
			situationMap.set(assetCode, { position: position, situation: position * averagePriceMap.get(assetCode)! });
		}
		const sortedSituationMap = new Map([...situationMap].sort());
		return sortedSituationMap;
	}
}
