import Transaction, { TransactionType } from "./Transaction";
import { MONTHS } from "./utils";

export default abstract class TaxCalculator {
	private readonly positionMaps = new Map<number, Map<string, number>>();
	private readonly averagePriceMaps = new Map<number, Map<string, number>>();

	constructor(protected readonly transactions: Transaction[]) {
		const positionMap = new Map<string, number>();
		const averagePriceMap = new Map<string, number>();

		let currentYear: number | null = null;
		for (const transaction of this.transactions) {
			const year = transaction.date.getFullYear();
			if (currentYear === null) currentYear = year;
			if (year !== currentYear) {
				this.positionMaps.set(currentYear, new Map(positionMap));
				this.averagePriceMaps.set(currentYear, new Map(averagePriceMap));
				currentYear = year;
			}

			const { quantity, value, type } = transaction;
			const ticker = transaction.asset.code;
			const position = positionMap.get(ticker) ?? 0;
			const averagePrice = averagePriceMap.get(ticker) ?? 0;

			switch (type) {
				case TransactionType.Buy:
					positionMap.set(ticker, position + quantity);
					averagePriceMap.set(ticker, TaxCalculator.getUpdatedAveragePrice(position, averagePrice, quantity, value));
					break;
				case TransactionType.Sell:
					transaction.profit = value - quantity * averagePrice;
					if (position - quantity <= 0) averagePriceMap.delete(ticker);
					positionMap.set(ticker, position - quantity);
					break;
			}
		}
		if (currentYear !== null) {
			this.positionMaps.set(currentYear, new Map(positionMap));
			this.averagePriceMaps.set(currentYear, new Map(averagePriceMap));
		}
	}

	private static getUpdatedAveragePrice(
		position: number,
		averagePrice: number,
		positionIncrement: number,
		valueIncrement: number,
	) {
		return (position * averagePrice + valueIncrement) / (position + positionIncrement);
	}

	protected static getMonetaryValue(value: number) {
		return Number(value.toFixed(2));
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
		for (const [assetCode, position] of this.positionMaps.get(year)!) {
			if (position < 0) throw new Error(`Negative position ${position} ${assetCode}.`);
			const averagePriceMap = this.averagePriceMaps.get(year)!;
			situationMap.set(assetCode, { position: position, situation: position * averagePriceMap.get(assetCode)! });
		}
		const sortedSituationMap = new Map([...situationMap].sort());
		return sortedSituationMap;
	}
}
