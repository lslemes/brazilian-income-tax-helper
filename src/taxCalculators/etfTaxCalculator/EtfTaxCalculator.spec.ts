import csv from "csvtojson";
import { AssetType } from "../../transaction/Transaction";
import mapCsvTransactionToTransaction, { CsvTransaction } from "../../transaction/mapCsvTransactionToTransaction";
import { FLOATING_POINT_PRECISION } from "../../utils";
import EtfTaxCalculator from "./EtfTaxCalculator";

describe("EtfTaxCalculator", () => {
	let etfTaxCalculator: EtfTaxCalculator;

	beforeAll(async () => {
		const csvTransactions: CsvTransaction[] = await csv().fromFile("data/transactions.csv");
		const transactions = csvTransactions.map(mapCsvTransactionToTransaction);
		etfTaxCalculator = new EtfTaxCalculator(transactions);
	});

	it("should filter ETF transactions", () => {
		for (const transaction of etfTaxCalculator["transactions"]) expect(transaction.asset.type === AssetType.Etf);
	});

	test.each([
		[2019, new Array(12).fill(0)],
		[2020, new Array(12).fill(0)],
		[2021, new Array(12).fill(0)],
		[2022, new Array(12).fill(0)],
		[2023, new Array(12).fill(0)],
		[2024, [0, 0, expect.closeTo(621.89, FLOATING_POINT_PRECISION), 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	])("getMonthlyProfit(%p)", (year, expectedProfits) => {
		expect(etfTaxCalculator["getMonthlyProfit"](year)).toStrictEqual(expectedProfits);
	});
});
