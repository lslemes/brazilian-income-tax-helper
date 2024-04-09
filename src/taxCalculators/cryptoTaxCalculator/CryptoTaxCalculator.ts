import TaxCalculator from "../TaxCalculator";

export default class CryptoTaxCalculator extends TaxCalculator {
	private static readonly DARF_RATE = 0.15;
	private static readonly MAX_MONTHLY_SALES_VOLUME_EXEMPTION_THRESHOLD = 35000;
}
