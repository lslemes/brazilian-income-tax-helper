import { AssetType } from "../../asset/Asset";
import { BrazilianBuyTransaction } from "../../transaction/tradeTransaction/buyTransaction/brazilianBuyTransaction/BrazilianBuyTransaction";
import { BrazilianSellTransaction } from "../../transaction/tradeTransaction/sellTransaction/brazilianSellTransaction/BrazilianSellTransaction";
import TaxCalculator, { TaxReport } from "../TaxCalculator";

export default class BrazilianFiiTaxCalculator extends TaxCalculator {
	private static readonly DARF_RATE = 0.2;

	constructor(transactions: (BrazilianBuyTransaction | BrazilianSellTransaction)[]) {
		super(transactions.filter((transaction) => transaction.asset.type === AssetType.BrazilianFii));
	}

	public getTaxReport(year: number): TaxReport {
		return super.getTaxReport(year, BrazilianFiiTaxCalculator.DARF_RATE);
	}
}
