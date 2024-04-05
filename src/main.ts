import csv from "csvtojson";
import StockTaxCalculator from "./StockTaxCalculator.js";
import Transaction from "./Transaction.js";
import mapCsvTransactionToTransaction, { CsvTransaction } from "./TransactionMapper.js";

const csvTransactions: CsvTransaction[] = await csv().fromFile("data/transactions.csv");
const transactions: Transaction[] = csvTransactions.map(mapCsvTransactionToTransaction);

const stockTax = new StockTaxCalculator(transactions);
console.log(stockTax.getSituation(2021));
