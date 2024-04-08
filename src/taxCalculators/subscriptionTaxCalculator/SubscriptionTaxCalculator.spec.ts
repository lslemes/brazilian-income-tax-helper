/* eslint-disable @typescript-eslint/no-explicit-any */
import csv from "csvtojson";
import Darf from "../../darf/Darf";
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

	beforeEach(() => {
		jest.clearAllMocks();
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
	])("getSituationReport(%p)", (year, expectedSituationReport) => {
		expect(subscriptionTaxCalculator["getSituationReport"](year)).toStrictEqual(expectedSituationReport);
	});

	test.each([
		[2019, []],
		[2020, [new Darf(2020, MONTHS[6].label, 1.39)]],
		[2021, []],
		[2022, []],
		[2023, []],
		[2024, []],
	])("getDarfs(%p)", (year, expectedDarfs) => {
		const monthlyProfitLoss = subscriptionTaxCalculator["getMonthlyProfitLoss"](year);
		expect(
			subscriptionTaxCalculator["getDarfs"](year, monthlyProfitLoss, SubscriptionTaxCalculator["DARF_RATE"]),
		).toStrictEqual(expectedDarfs);
	});

	test.each([2019, 2020, 2021, 2022, 2023, 2024])("getTaxReport(%p)", (year) => {
		const getSituationReportSpy = jest.spyOn(subscriptionTaxCalculator as any, "getSituationReport");
		const getMonthlyProfitLossSpy = jest.spyOn(subscriptionTaxCalculator as any, "getMonthlyProfitLoss");
		const getDarfsSpy = jest.spyOn(subscriptionTaxCalculator as any, "getDarfs");

		subscriptionTaxCalculator.getTaxReport(year);

		expect(getSituationReportSpy).toHaveBeenCalledWith(year);
		expect(getSituationReportSpy).toHaveBeenCalledTimes(1);
		expect(getMonthlyProfitLossSpy).toHaveBeenCalledWith(year);
		expect(getMonthlyProfitLossSpy).toHaveBeenCalledTimes(1);
		expect(getDarfsSpy).toHaveBeenCalledWith(
			year,
			subscriptionTaxCalculator["getMonthlyProfitLoss"](year),
			SubscriptionTaxCalculator["DARF_RATE"],
		);
		expect(getDarfsSpy).toHaveBeenCalledTimes(1);
	});
});
