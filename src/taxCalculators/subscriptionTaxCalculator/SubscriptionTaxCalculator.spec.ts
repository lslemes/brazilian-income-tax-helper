import csv from "csvtojson";
import Darf from "../../darf/Darf";
import { getExpectedTaxReport } from "../../testUtils";
import { AssetType } from "../../transaction/Transaction";
import mapCsvTransactionToTransaction, { CsvTransaction } from "../../transaction/mapCsvTransactionToTransaction";
import { MONTHS } from "../../utils";
import SubscriptionTaxCalculator from "./SubscriptionTaxCalculator";

describe("SubscriptionTaxCalculator", () => {
	let subscriptionTaxCalculator: SubscriptionTaxCalculator;

	beforeAll(async () => {
		const csvTransactions: CsvTransaction[] = await csv().fromFile("data/transactions.csv");
		const transactions = csvTransactions.map(mapCsvTransactionToTransaction);
		subscriptionTaxCalculator = new SubscriptionTaxCalculator(transactions);
	});

	it("should filter subscription transactions", () => {
		for (const transaction of subscriptionTaxCalculator["transactions"])
			expect(transaction.asset.type === AssetType.Subscription);
	});

	test.each([
		[2019, new Array(12).fill(0)],
		[2020, [0, 0, 0, 0, 0, 0, 9.28, 0, 0, 0, 0, 0]],
		[2021, new Array(12).fill(0)],
		[2022, new Array(12).fill(0)],
		[2023, new Array(12).fill(0)],
		[2024, new Array(12).fill(0)],
	])("getMonthlyProfitLoss(%p)", (year, expectedProfitLoss) => {
		expect(subscriptionTaxCalculator["getMonthlyProfitLoss"](year)).toStrictEqual(expectedProfitLoss);
	});

	test.each([
		[2019, new Map()],
		[2020, new Map()],
		[2021, new Map()],
		[2022, new Map()],
		[2023, new Map()],
		[2024, new Map()],
	])("getSituation(%p)", (year, expectedSituation) => {
		expect(subscriptionTaxCalculator["getSituation"](year)).toStrictEqual(expectedSituation);
	});

	test.each([
		[2019, new Map()],
		[2020, new Map()],
		[2021, new Map()],
		[2022, new Map()],
		[2023, new Map()],
		[2024, new Map()],
	])("getSituationReport(%p)", (year, expectedReport) => {
		expect(subscriptionTaxCalculator["getSituationReport"](year)).toStrictEqual(expectedReport);
	});

	test.each([
		[2019, getExpectedTaxReport(new Map(), new Array(12).fill(0), [])],
		[
			2020,
			getExpectedTaxReport(new Map(), [0, 0, 0, 0, 0, 0, 9.28, 0, 0, 0, 0, 0], [new Darf(2020, MONTHS[6].label, 1.39)]),
		],
		[2021, getExpectedTaxReport(new Map(), new Array(12).fill(0), [])],
		[2022, getExpectedTaxReport(new Map(), new Array(12).fill(0), [])],
		[2023, getExpectedTaxReport(new Map(), new Array(12).fill(0), [])],
		[2024, getExpectedTaxReport(new Map(), new Array(12).fill(0), [])],
	])("getTaxReport(%p)", (year, expectedTaxReport) => {
		expect(subscriptionTaxCalculator["getTaxReport"](year)).toStrictEqual(expectedTaxReport);
	});
});
