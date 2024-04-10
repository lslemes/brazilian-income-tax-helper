import csv from "csvtojson";
import BrazilianEtfTaxCalculator from "./taxCalculators/brazilianEtfTaxCalculator/BrazilianEtfTaxCalculator";
import BrazilianFiiTaxCalculator from "./taxCalculators/brazilianFiiTaxCalculator/BrazilianFiiTaxCalculator";
import BrazilianStockTaxCalculator from "./taxCalculators/brazilianStockTaxCalculator/BrazilianStockTaxCalculator";
import BrazilianSubscriptionTaxCalculator from "./taxCalculators/brazilianSubscriptionTaxCalculator/BrazilianSubscriptionTaxCalculator";
import processBrazilianCsvTransaction, { BrazilianCsvTransaction } from "./transaction/processBrazilianCsvTransaction";

async function main() {
	const brazilianCsvTransactions: BrazilianCsvTransaction[] = await csv().fromFile("data/brazilianTransactions.csv");
	const brazilianTransactions = brazilianCsvTransactions.map(processBrazilianCsvTransaction);

	const brazilianFiiTaxCalculator = new BrazilianFiiTaxCalculator(brazilianTransactions);
	const brazilianStockTaxCalculator = new BrazilianStockTaxCalculator(brazilianTransactions);
	const brazilianEtfTaxCalculator = new BrazilianEtfTaxCalculator(brazilianTransactions);
	const brazilianSubscriptionTaxCalculator = new BrazilianSubscriptionTaxCalculator(brazilianTransactions);
}
main();
