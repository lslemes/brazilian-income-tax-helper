import csv from "csvtojson";
import { AssetType } from "../../transaction/Transaction";
import mapCsvTransactionToTransaction, { CsvTransaction } from "../../transaction/mapCsvTransactionToTransaction";
import { FLOATING_POINT_PRECISION } from "../../utils";
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
		[2020, [0, 0, 0, 0, 0, 0, expect.closeTo(9.28, FLOATING_POINT_PRECISION), 0, 0, 0, 0, 0]],
		[2021, new Array(12).fill(0)],
		[2022, new Array(12).fill(0)],
		[2023, new Array(12).fill(0)],
		[2024, new Array(12).fill(0)],
	])("getMonthlyProfit(%p)", (year, expectedProfits) => {
		expect(subscriptionTaxCalculator["getMonthlyProfit"](year)).toStrictEqual(expectedProfits);
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
});
