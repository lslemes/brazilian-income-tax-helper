import Darf from "../darf/Darf";
import { getMonetaryValue, getUpdatedAveragePrice } from "../taxMath/taxMathUtils";
import { Transaction } from "../transaction/Transaction";
import { BrazilianBuyTransaction } from "../transaction/tradeTransaction/buyTransaction/brazilianBuyTransaction/BrazilianBuyTransaction";
import { SellTransaction } from "../transaction/tradeTransaction/sellTransaction/SellTransaction";
import { BrazilianSellTransaction } from "../transaction/tradeTransaction/sellTransaction/brazilianSellTransaction/BrazilianSellTransaction";
import { MONTHS, MonthLabel } from "../utils";

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

export interface TaxReport {
	situationReportByAssetCode: SituationReportByAssetCode;
	monthlyProfitLoss: { month: MonthLabel; profitLoss: number }[];
	darfs: Darf[];
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

				const assetCode = transaction.asset.code;
				const position = positionByAssetCode.get(assetCode) ?? 0;
				const averagePrice = averagePriceByAssetCode.get(assetCode) ?? 0;

				if (transaction instanceof BrazilianBuyTransaction) {
					const { quantity, value } = transaction;
					positionByAssetCode.set(assetCode, position + quantity);
					averagePriceByAssetCode.set(assetCode, getUpdatedAveragePrice(position, averagePrice, quantity, value));
				} else if (transaction instanceof BrazilianSellTransaction) {
					const { quantity, value } = transaction;
					transaction.profitLoss = value - quantity * averagePrice;
					if (position - quantity <= 0) {
						averagePriceByAssetCode.delete(assetCode);
						positionByAssetCode.delete(assetCode);
					} else {
						positionByAssetCode.set(assetCode, position - quantity);
					}
				}

				return transaction;
			});
		if (currentYear !== null) {
			positionMapByYear.set(currentYear, new Map(positionByAssetCode));
			averagePriceMapByYear.set(currentYear, new Map(averagePriceByAssetCode));
		}

		return { transactionsWithProfitLoss, positionMapByYear, averagePriceMapByYear };
	}

	protected getMonthlyProfitLoss(year: number): number[] {
		const transactions = this.transactions.filter(
			(transaction): transaction is SellTransaction =>
				transaction.date.getFullYear() === year && transaction instanceof SellTransaction,
		);
		return MONTHS.map((month) =>
			transactions
				.filter((transaction) => transaction.date.getMonth() === month.value)
				.reduce((totalProfitLoss, transaction) => totalProfitLoss + transaction.profitLoss, 0),
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
				lastValue: getMonetaryValue(lastValue),
				currentValue: getMonetaryValue(situation.value),
			});
		}
		for (const [ticker, situation] of lastSituation) {
			if (situationReport.has(ticker)) continue;
			situationReport.set(ticker, {
				position: 0,
				lastValue: getMonetaryValue(situation.value),
				currentValue: 0,
			});
		}

		const sortedSituationReport = new Map([...situationReport].sort());
		return sortedSituationReport;
	}

	protected getDarfs(year: number, monthlyProfitLoss: number[], darfRate: number): Darf[] {
		return MONTHS.filter((month) => monthlyProfitLoss[month.value] > 0).map(
			(month) => new Darf(year, month.label, getMonetaryValue(monthlyProfitLoss[month.value] * darfRate)),
		);
	}

	protected getTaxReport(year: number, darfRate: number): TaxReport {
		const situationReportByAssetCode = this.getSituationReport(year);
		const monthlyProfitLoss = this.getMonthlyProfitLoss(year);
		const darfs = this.getDarfs(year, monthlyProfitLoss, darfRate);
		return {
			situationReportByAssetCode,
			monthlyProfitLoss: monthlyProfitLoss.map((profitLoss, i) => ({
				month: MONTHS[i].label,
				profitLoss: getMonetaryValue(profitLoss),
			})),
			darfs,
		};
	}
}
