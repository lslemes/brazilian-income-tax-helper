import Darf from "../../darf/Darf";
import { getMonetaryValue } from "../../taxMath/taxMathUtils";
import Transaction, { AssetType, TransactionType } from "../../transaction/Transaction";
import { MONTHS } from "../../utils";
import TaxCalculator from "../TaxCalculator";

export default class StockTaxCalculator extends TaxCalculator {
	private static readonly DARF_RATE = 0.15;
	private static readonly MAX_MONTHLY_SALES_VOLUME_EXEMPTION_THRESHOLD = 20000;

	constructor(transactions: Transaction[]) {
		super(transactions.filter((transaction) => transaction.asset.type === AssetType.Stock));
	}

	private getMonthlySalesVolume(year: number): number[] {
		const transactions = this.transactions.filter((transaction) => transaction.date.getFullYear() === year);
		return MONTHS.map((month) =>
			transactions
				.filter(
					(transaction) => transaction.date.getMonth() === month.value && transaction.type === TransactionType.Sell,
				)
				.reduce((totalValue, transaction) => totalValue + transaction.value, 0),
		);
	}

	private getProfitByMonth(year: number, month: number) {
		return this.transactions
			.filter(
				(transaction) =>
					transaction.date.getFullYear() === year &&
					transaction.date.getMonth() === month &&
					transaction.profitLoss !== null &&
					transaction.profitLoss > 0,
			)
			.reduce((totalProfit, transaction) => totalProfit + transaction.profitLoss!, 0);
	}

	private getAnnualExemptProfit(year: number, monthlySalesVolume: number[]): number {
		return MONTHS.filter(
			(month) =>
				monthlySalesVolume[month.value] > 0 &&
				monthlySalesVolume[month.value] <= StockTaxCalculator.MAX_MONTHLY_SALES_VOLUME_EXEMPTION_THRESHOLD,
		)
			.map((month) => this.getProfitByMonth(year, month.value))
			.reduce((totalProfit, profit) => totalProfit + profit, 0);
	}

	protected getDarfs(year: number, monthlyProfitLoss: number[]) {
		const monthlySalesVolume = this.getMonthlySalesVolume(year);
		return MONTHS.filter(
			(month) =>
				monthlySalesVolume[month.value] > StockTaxCalculator.MAX_MONTHLY_SALES_VOLUME_EXEMPTION_THRESHOLD &&
				monthlyProfitLoss[month.value] > 0,
		).map(
			(month) =>
				new Darf(year, month.label, getMonetaryValue(monthlyProfitLoss[month.value] * StockTaxCalculator.DARF_RATE)),
		);
	}

	public getTaxReport(year: number) {
		const monthlySalesVolume = this.getMonthlySalesVolume(year);

		return {
			...super.getTaxReport(year, StockTaxCalculator.DARF_RATE),
			monthlySalesVolume: monthlySalesVolume.map((volume, i) => ({
				month: MONTHS[i].label,
				salesVolume: getMonetaryValue(volume),
			})),
			annualExemptProfit: getMonetaryValue(this.getAnnualExemptProfit(year, monthlySalesVolume)),
		};
	}
}
