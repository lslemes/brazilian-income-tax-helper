import Darf from "../../darf/Darf";
import { getMonetaryValue } from "../../taxMath/taxMathUtils";
import Transaction, { AssetType } from "../../transaction/Transaction";
import { MONTHS } from "../../utils";
import TaxCalculator, { TaxReport } from "../TaxCalculator";

export default class EtfTaxCalculator extends TaxCalculator {
	private static readonly DARF_RATE = 0.15;

	constructor(transactions: Transaction[]) {
		super(
			transactions.filter(
				(transaction) =>
					transaction.asset.type === AssetType.FixedIncomeEtf || transaction.asset.type === AssetType.VariableIncomeEtf,
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
						transaction.asset.type === AssetType.VariableIncomeEtf,
				)
				.reduce((totalProfitLoss, transcation) => totalProfitLoss + (transcation.profitLoss ?? 0), 0),
		);
		const darfs = MONTHS.filter((month) => monthlyVariableIncomeEtfProfitLoss[month.value] > 0).map(
			(month) =>
				new Darf(
					year,
					month.label,
					getMonetaryValue(monthlyVariableIncomeEtfProfitLoss[month.value] * EtfTaxCalculator.DARF_RATE),
				),
		);
		return darfs;
	}

	public getTaxReport(year: number): TaxReport {
		return super.getTaxReport(year, EtfTaxCalculator.DARF_RATE);
	}
}
