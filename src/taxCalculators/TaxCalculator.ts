import Darf from "../darf/Darf";
import Transaction, { TransactionType } from "../transaction/Transaction";
import { MONTHS } from "../utils";

export default abstract class TaxCalculator {
	protected readonly transactions: Transaction[];
	private readonly positionMapByYear = new Map<number, Map<string, number>>();
	private readonly averagePriceMapByYear = new Map<number, Map<string, number>>();

	constructor(transactions: Transaction[]) {
		const { averagePriceMapByYear, positionMapByYear, processedTransactions } =
			TaxCalculator.getYearlyTaxData(transactions);
		this.transactions = processedTransactions;
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

	private static getYearlyTaxData(transactions: Transaction[]) {
		const positionByAssetCode = new Map<string, number>();
		const averagePriceByAssetCode = new Map<string, number>();
		const positionMapByYear = new Map<number, typeof positionByAssetCode>();
		const averagePriceMapByYear = new Map<number, typeof averagePriceByAssetCode>();

		let currentYear: number | null = null;
		const processedTransactions = transactions
			.toSorted((a, b) => a.date.getTime() - b.date.getTime())
			.map((transaction) => {
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

		return { processedTransactions, positionMapByYear, averagePriceMapByYear };
	}

	protected static getMonetaryValue(value: number) {
		return Number(value.toFixed(2));
	}

	protected getMonthlyProfit(year: number) {
		const transactions = this.transactions.filter((transaction) => transaction.date.getFullYear() === year);
		return MONTHS.map((month) =>
			transactions
				.filter(
					(transaction) => transaction.type === TransactionType.Sell && transaction.date.getMonth() === month.value,
				)
				.reduce((totalProfit, transaction) => totalProfit + (transaction.profit ?? 0), 0),
		);
	}

	private getSituation(year: number) {
		const situationMap = new Map<string, { position: number; value: number }>();
		const positionMap = this.positionMapByYear.get(year);
		if (!positionMap) return situationMap;
		for (const [assetCode, position] of positionMap) {
			const averagePrice = this.averagePriceMapByYear.get(year)!.get(assetCode)!;
			situationMap.set(assetCode, { position, value: position * averagePrice });
		}
		return situationMap;
	}

	protected getSituationReport(year: number) {
		const lastSituation = this.getSituation(year - 1);
		const currentSituation = this.getSituation(year);
		const situationReport = new Map<string, { position: number; lastValue: number; currentValue: number }>();

		for (const [ticker, situation] of currentSituation) {
			const lastValue = lastSituation.get(ticker)?.value ?? 0;
			situationReport.set(ticker, {
				position: situation.position,
				lastValue: TaxCalculator.getMonetaryValue(lastValue),
				currentValue: TaxCalculator.getMonetaryValue(situation.value),
			});
		}
		for (const [ticker, situation] of lastSituation) {
			if (situationReport.has(ticker)) continue;
			situationReport.set(ticker, {
				position: 0,
				lastValue: TaxCalculator.getMonetaryValue(situation.value),
				currentValue: 0,
			});
		}

		const sortedSituationReport = new Map([...situationReport].sort());
		return sortedSituationReport;
	}

	protected getTaxReport(year: number, darfRate: number) {
		const situationReport = this.getSituationReport(year);
		const monthlyProfit = this.getMonthlyProfit(year).map((profit, i) => ({
			month: MONTHS[i].label,
			profit,
		}));
		const darfs = monthlyProfit
			.filter(({ profit }) => profit > 0)
			.map(({ month, profit }) => new Darf(year, month, TaxCalculator.getMonetaryValue(profit * darfRate)));
		return {
			situationReport,
			monthlyProfit: monthlyProfit.map(({ month, profit }) => ({
				month,
				profit: TaxCalculator.getMonetaryValue(profit),
			})),
			darfs,
		};
	}
}
