import csv from "csvtojson";
import BrazilianEtfTaxCalculator from "./taxCalculators/brazilianEtfTaxCalculator/BrazilianEtfTaxCalculator";
import BrazilianFiiTaxCalculator from "./taxCalculators/brazilianFiiTaxCalculator/BrazilianFiiTaxCalculator";
import BrazilianStockTaxCalculator from "./taxCalculators/brazilianStockTaxCalculator/BrazilianStockTaxCalculator";
import BrazilianSubscriptionTaxCalculator from "./taxCalculators/brazilianSubscriptionTaxCalculator/BrazilianSubscriptionTaxCalculator";
import Transaction from "./transaction/Transaction";
import mapCsvTransactionToTransaction, { CsvTransaction } from "./transaction/mapCsvTransactionToTransaction";

async function main() {
	const csvTransactions: CsvTransaction[] = await csv().fromFile("data/brazilianTransactions.csv");
	const transactions: Transaction[] = csvTransactions.map(mapCsvTransactionToTransaction);

	const brazilianFiiTaxCalculator = new BrazilianFiiTaxCalculator(transactions);
	const brazilianStockTaxCalculator = new BrazilianStockTaxCalculator(transactions);
	const brazilianEtfTaxCalculator = new BrazilianEtfTaxCalculator(transactions);
	const brazilianSubscriptionTaxCalculator = new BrazilianSubscriptionTaxCalculator(transactions);
}
main();
