import { AssetType } from "../../asset/Asset";
import Darf from "../../darf/Darf";
import { getMonetaryValue } from "../../taxMath/taxMathUtils";
import { BrazilianBuyTransaction } from "../../transaction/tradeTransaction/buyTransaction/brazilianBuyTransaction/BrazilianBuyTransaction";
import { BrazilianSellTransaction } from "../../transaction/tradeTransaction/sellTransaction/brazilianSellTransaction/BrazilianSellTransaction";
import { MONTHS, MonthLabel } from "../../utils";
import TaxCalculator, { TaxReport } from "../TaxCalculator";

export default class BrazilianStockTaxCalculator extends TaxCalculator {
	private static readonly DARF_RATE = 0.15;
	private static readonly MAX_MONTHLY_SALES_VOLUME_EXEMPTION_THRESHOLD = 20000;

	constructor(transactions: (BrazilianBuyTransaction | BrazilianSellTransaction)[]) {
		super(transactions.filter((transaction) => transaction.asset.type === AssetType.BrazilianStock));
	}

	private getMonthlySalesVolume(year: number): number[] {
		const transactions = this.transactions.filter(
			(transaction): transaction is BrazilianSellTransaction =>
				transaction.date.getFullYear() === year && transaction instanceof BrazilianSellTransaction,
		);
		return MONTHS.map((month) =>
			transactions
				.filter((transaction) => transaction.date.getMonth() === month.value)
				.reduce((totalValue, transaction) => totalValue + transaction.value, 0),
		);
	}

	private getProfitByMonth(year: number, month: number): number {
		return this.transactions
			.filter(
				(transaction): transaction is BrazilianSellTransaction =>
					transaction.date.getFullYear() === year &&
					transaction.date.getMonth() === month &&
					transaction instanceof BrazilianSellTransaction &&
					transaction.profitLoss !== null &&
					transaction.profitLoss > 0,
			)
			.reduce((totalProfit, transaction) => totalProfit + transaction.profitLoss, 0);
	}

	private getAnnualExemptProfit(year: number, monthlySalesVolume: number[]): number {
		return MONTHS.filter(
			(month) =>
				monthlySalesVolume[month.value] > 0 &&
				monthlySalesVolume[month.value] <= BrazilianStockTaxCalculator.MAX_MONTHLY_SALES_VOLUME_EXEMPTION_THRESHOLD,
		)
			.map((month) => this.getProfitByMonth(year, month.value))
			.reduce((totalProfit, profit) => totalProfit + profit, 0);
	}

	protected getDarfs(year: number, monthlyProfitLoss: number[]): Darf[] {
		const monthlySalesVolume = this.getMonthlySalesVolume(year);
		return MONTHS.filter(
			(month) =>
				monthlySalesVolume[month.value] > BrazilianStockTaxCalculator.MAX_MONTHLY_SALES_VOLUME_EXEMPTION_THRESHOLD &&
				monthlyProfitLoss[month.value] > 0,
		).map(
			(month) =>
				new Darf(
					year,
					month.label,
					getMonetaryValue(monthlyProfitLoss[month.value] * BrazilianStockTaxCalculator.DARF_RATE),
				),
		);
	}

	public getTaxReport(
		year: number,
	): TaxReport & { monthlySalesVolume: { month: MonthLabel; salesVolume: number }[]; annualExemptProfit: number } {
		const monthlySalesVolume = this.getMonthlySalesVolume(year);
		return {
			...super.getTaxReport(year, BrazilianStockTaxCalculator.DARF_RATE),
			monthlySalesVolume: monthlySalesVolume.map((volume, i) => ({
				month: MONTHS[i].label,
				salesVolume: getMonetaryValue(volume),
			})),
			annualExemptProfit: getMonetaryValue(this.getAnnualExemptProfit(year, monthlySalesVolume)),
		};
	}
}
