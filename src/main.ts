import csv from "csvtojson";
import EtfTaxCalculator from "./taxCalculators/etfTaxCalculator/EtfTaxCalculator";
import FiiTaxCalculator from "./taxCalculators/fiiTaxCalculator/FiiTaxCalculator";
import StockTaxCalculator from "./taxCalculators/stockTaxCalculator/StockTaxCalculator";
import SubscriptionTaxCalculator from "./taxCalculators/subscriptionTaxCalculator/SubscriptionTaxCalculator";
import Transaction from "./transaction/Transaction";
import mapCsvTransactionToTransaction, { CsvTransaction } from "./transaction/mapCsvTransactionToTransaction";

async function main() {
	const csvTransactions: CsvTransaction[] = await csv().fromFile("data/transactions.csv");
	const transactions: Transaction[] = csvTransactions.map(mapCsvTransactionToTransaction);

	const fiiTaxCalculator = new FiiTaxCalculator(transactions);
	const stockTaxCalculator = new StockTaxCalculator(transactions);
	const etfTaxCalculator = new EtfTaxCalculator(transactions);
	const subscriptionTaxCalculator = new SubscriptionTaxCalculator(transactions);
	// console.log(stockTaxCalculator.getTaxReport(2024));
}
main();
