import csv from "csvtojson";
import Transaction from "./Transaction.js";
import mapCsvTransactionToTransaction, { CsvTransaction } from "./TransactionMapper.js";

async function main() {
	const csvTransactions: CsvTransaction[] = await csv().fromFile("data/transactions.csv");
	const transactions: Transaction[] = csvTransactions.map(mapCsvTransactionToTransaction);
	console.log("transactions :>> ", transactions);
}
main();
