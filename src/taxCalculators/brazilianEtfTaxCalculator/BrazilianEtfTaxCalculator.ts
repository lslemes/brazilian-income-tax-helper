import Darf from "../../darf/Darf";
import { getMonetaryValue } from "../../taxMath/taxMathUtils";
import Transaction, { AssetType } from "../../transaction/Transaction";
import { MONTHS } from "../../utils";
import TaxCalculator, { TaxReport } from "../TaxCalculator";

export default class BrazilianEtfTaxCalculator extends TaxCalculator {
	private static readonly DARF_RATE = 0.15;

	constructor(transactions: Transaction[]) {
		super(
			transactions.filter(
				(transaction) =>
					transaction.asset.type === AssetType.BrazilianFixedIncomeEtf ||
					transaction.asset.type === AssetType.BrazilianVariableIncomeEtf,
			),
		);
	}

	protected getDarfs(year: number): Darf[] {
		const monthlyVariableIncomeEtfProfitLoss = MONTHS.map((month) =>
			this.transactions
				.filter(
					(transaction) =>
						transaction.date.getFullYear() === year &&
						transaction.date.getMonth() === month.value &&
						transaction.asset.type === AssetType.BrazilianVariableIncomeEtf,
				)
				.reduce((totalProfitLoss, transcation) => totalProfitLoss + (transcation.profitLoss ?? 0), 0),
		);
		const darfs = MONTHS.filter((month) => monthlyVariableIncomeEtfProfitLoss[month.value] > 0).map(
			(month) =>
				new Darf(
					year,
					month.label,
					getMonetaryValue(monthlyVariableIncomeEtfProfitLoss[month.value] * BrazilianEtfTaxCalculator.DARF_RATE),
				),
		);
		return darfs;
	}

	public getTaxReport(year: number): TaxReport {
		return super.getTaxReport(year, BrazilianEtfTaxCalculator.DARF_RATE);
	}
}
