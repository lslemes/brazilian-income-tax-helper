import Darf from "../darf/Darf";
import Transaction, { TransactionType } from "../transaction/Transaction";
import { MONTHS } from "../utils";

interface Situation {
	position: number;
	value: number;
}

interface SituationReport {
	position: number;
	lastValue: number;
	currentValue: number;
}

type SituationByAssetCode = Map<string, Situation>;
type SituationReportByAssetCode = Map<string, SituationReport>;

type PositionByAssetCode = Map<string, number>;
type PositionMapByYear = Map<number, PositionByAssetCode>;

type AveragePriceByAssetCode = Map<string, number>;
type AveragePriceMapByYear = Map<number, AveragePriceByAssetCode>;

export interface YearlyTaxData {
	transactionsWithProfitLoss: Transaction[];
	positionMapByYear: PositionMapByYear;
	averagePriceMapByYear: AveragePriceMapByYear;
}

export default abstract class TaxCalculator {
	protected readonly transactions: Transaction[];
	private readonly positionMapByYear: PositionMapByYear;
	private readonly averagePriceMapByYear: AveragePriceMapByYear;

	constructor(transactions: Transaction[]) {
		const { averagePriceMapByYear, positionMapByYear, transactionsWithProfitLoss } =
			TaxCalculator.getYearlyTaxData(transactions);
		this.transactions = transactionsWithProfitLoss;
		this.averagePriceMapByYear = averagePriceMapByYear;
		this.positionMapByYear = positionMapByYear;
	}

	private static getUpdatedAveragePrice(
		currentPosition: number,
		currentAveragePrice: number,
		positionIncrement: number,
		valueIncrement: number,
	): number {
		if (currentPosition < 0) throw new Error(`Current position ${currentPosition} must not be negative.`);
		if (currentAveragePrice < 0) throw new Error(`Current average price ${currentAveragePrice} must not be negative.`);
		if (positionIncrement <= 0) throw new Error(`Position increment ${positionIncrement} must be positive.`);
		if (valueIncrement < 0) throw new Error(`Value increment ${valueIncrement} must not be negative.`);
		return (currentPosition * currentAveragePrice + valueIncrement) / (currentPosition + positionIncrement);
	}

	private static getYearlyTaxData(transactions: Transaction[]): YearlyTaxData {
		const positionByAssetCode: PositionByAssetCode = new Map();
		const positionMapByYear: PositionMapByYear = new Map();
		const averagePriceByAssetCode: AveragePriceByAssetCode = new Map();
		const averagePriceMapByYear: AveragePriceMapByYear = new Map();

		let currentYear: number | null = null;
		const transactionsWithProfitLoss = transactions
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
						transaction.profitLoss = value - quantity * averagePrice;
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

		return { transactionsWithProfitLoss, positionMapByYear, averagePriceMapByYear };
	}

	protected static getMonetaryValue(value: number): number {
		return Number(value.toFixed(2));
	}

	protected getMonthlyProfitLoss(year: number): number[] {
		const transactions = this.transactions.filter((transaction) => transaction.date.getFullYear() === year);
		return MONTHS.map((month) =>
			transactions
				.filter(
					(transaction) => transaction.type === TransactionType.Sell && transaction.date.getMonth() === month.value,
				)
				.reduce((totalProfitLoss, transaction) => totalProfitLoss + (transaction.profitLoss ?? 0), 0),
		);
	}

	private getSituation(year: number): SituationByAssetCode {
		const situationByAssetCode: SituationByAssetCode = new Map();
		const positionMap = this.positionMapByYear.get(year);
		if (!positionMap) return situationByAssetCode;
		for (const [assetCode, position] of positionMap) {
			const averagePrice = this.averagePriceMapByYear.get(year)!.get(assetCode)!;
			situationByAssetCode.set(assetCode, { position, value: position * averagePrice });
		}
		return situationByAssetCode;
	}

	protected getSituationReport(year: number): SituationReportByAssetCode {
		const lastSituation = this.getSituation(year - 1);
		const currentSituation = this.getSituation(year);
		const situationReport: SituationReportByAssetCode = new Map();

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

	// tipar retorno?
	protected getTaxReport(year: number, darfRate: number) {
		const situationReport = this.getSituationReport(year);
		const monthlyProfit = this.getMonthlyProfitLoss(year).map((profit, i) => ({
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
