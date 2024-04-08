import Darf from "../../darf/Darf";
import Transaction, { AssetType, TransactionType } from "../../transaction/Transaction";
import { MONTHS, MonthValue } from "../../utils";
import TaxCalculator from "../TaxCalculator";

export default class StockTaxCalculator extends TaxCalculator {
	private static readonly DARF_RATE = 0.15;
	private static readonly MAX_SALES_VOLUME_EXEMPTION_THRESHOLD = 20000;

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

	// private getProfitByStock(year: number) {
	// 	const profitByStock = new Map<string, number>();
	// 	const transactions = this.transactions.filter((transaction) => transaction.date.getFullYear() === year);
	// 	for (const transaction of transactions) {
	// 		const assetCode = transaction.asset.code;
	// 		if (transaction.profit !== null)
	// 			profitByStock.set(assetCode, (profitByStock.get(assetCode) ?? 0) + transaction.profit);
	// 	}
	// 	return profitByStock;
	// }

	private getProfitByMonth(year: number, month: MonthValue) {
		// remove this one
		return this.transactions
			.filter((transaction) => transaction.date.getFullYear() === year && transaction.date.getMonth() === month)
			.reduce((totalProfit, transaction) => totalProfit + (transaction.profit ?? 0), 0);
	}

	private getPositiveProfitByMonth(year: number, month: MonthValue) {
		return this.transactions
			.filter(
				(transaction) =>
					transaction.date.getFullYear() === year &&
					transaction.date.getMonth() === month &&
					transaction.profit !== null &&
					transaction.profit > 0,
			)
			.reduce((totalProfit, transaction) => totalProfit + (transaction.profit ?? 0), 0);
	}

	private getDarfs(year: number, monthlySalesVolume: number[]) {
		return MONTHS.map((month) => ({ month, salesVolume: monthlySalesVolume[month.value] }))
			.filter((x) => x.salesVolume > StockTaxCalculator.MAX_SALES_VOLUME_EXEMPTION_THRESHOLD)
			.map(
				(x) => new Darf(year, x.month.label, this.getProfitByMonth(year, x.month.value) * StockTaxCalculator.DARF_RATE),
			);
	}

	public getTaxReport(year: number) {
		const situationReport = this.getSituationReport(year);
		const monthlyProfit = this.getMonthlyProfit(year).map((profit, i) => ({
			month: MONTHS[i].label,
			profit,
		}));
		const monthlySalesVolume = this.getMonthlySalesVolume(year);

		const annualExemptProfit = MONTHS.map((month) => ({ month, salesVolume: monthlySalesVolume[month.value] }))
			.filter((x) => x.salesVolume > 0 && x.salesVolume <= StockTaxCalculator.MAX_SALES_VOLUME_EXEMPTION_THRESHOLD)
			.map((x) => this.getPositiveProfitByMonth(year, x.month.value))
			.reduce((totalProfit, profit) => totalProfit + profit, 0);

		const darfs = this.getDarfs(year, monthlySalesVolume);

		return {
			situationReport,
			monthlyProfit: monthlyProfit.map(({ month, profit }) => ({
				month,
				profit: TaxCalculator.getMonetaryValue(profit),
			})),
			monthlySalesVolume: MONTHS.map((month) => ({
				month: month.label,
				volume: TaxCalculator.getMonetaryValue(monthlySalesVolume[month.value]),
			})),
			darfs,
			annualExemptProfit: TaxCalculator.getMonetaryValue(annualExemptProfit),
		};
	}
}
