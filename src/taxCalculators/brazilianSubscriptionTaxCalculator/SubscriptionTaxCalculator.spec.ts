/* eslint-disable @typescript-eslint/no-explicit-any */
import csv from "csvtojson";
import { AssetType } from "../../asset/Asset";
import Darf from "../../darf/Darf";
import processBrazilianCsvTransaction, {
	BrazilianCsvTransaction,
} from "../../transaction/processBrazilianCsvTransaction";
import { MONTHS } from "../../utils";
import BrazilianSubscriptionTaxCalculator from "./BrazilianSubscriptionTaxCalculator";

describe(BrazilianSubscriptionTaxCalculator.name, () => {
	let taxCalculator: BrazilianSubscriptionTaxCalculator;

	beforeAll(async () => {
		const csvTransactions: BrazilianCsvTransaction[] = await csv().fromFile("data/brazilianTransactions.csv");
		const transactions = csvTransactions.map(processBrazilianCsvTransaction);
		taxCalculator = new BrazilianSubscriptionTaxCalculator(transactions);
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should filter subscription transactions", () => {
		for (const transaction of taxCalculator["transactions"])
			expect(transaction.asset.type === AssetType.BrazilianSubscription);
	});

	test.each([
		[2019, new Array(12).fill(0)],
		[2020, [0, 0, 0, 0, 0, 0, 9.28, 0, 0, 0, 0, 0]],
		[2021, new Array(12).fill(0)],
		[2022, new Array(12).fill(0)],
		[2023, new Array(12).fill(0)],
		[2024, new Array(12).fill(0)],
	])("getMonthlyProfitLoss(%p)", (year, expectedProfitLoss) => {
		expect(taxCalculator["getMonthlyProfitLoss"](year)).toStrictEqual(expectedProfitLoss);
	});

	test.each([
		[2019, new Map()],
		[2020, new Map()],
		[2021, new Map()],
		[2022, new Map()],
		[2023, new Map()],
		[2024, new Map()],
	])("getSituation(%p)", (year, expectedSituation) => {
		expect(taxCalculator["getSituation"](year)).toStrictEqual(expectedSituation);
	});

	test.each([
		[2019, new Map()],
		[2020, new Map()],
		[2021, new Map()],
		[2022, new Map()],
		[2023, new Map()],
		[2024, new Map()],
	])("getSituationReport(%p)", (year, expectedSituationReport) => {
		expect(taxCalculator["getSituationReport"](year)).toStrictEqual(expectedSituationReport);
	});

	test.each([
		[2019, []],
		[2020, [new Darf(2020, MONTHS[6].label, 1.39)]],
		[2021, []],
		[2022, []],
		[2023, []],
		[2024, []],
	])("getDarfs(%p)", (year, expectedDarfs) => {
		const monthlyProfitLoss = taxCalculator["getMonthlyProfitLoss"](year);
		expect(
			taxCalculator["getDarfs"](year, monthlyProfitLoss, BrazilianSubscriptionTaxCalculator["DARF_RATE"]),
		).toStrictEqual(expectedDarfs);
	});

	test.each([2019, 2020, 2021, 2022, 2023, 2024])("getTaxReport(%p)", (year) => {
		const getSituationReportSpy = jest.spyOn(taxCalculator as any, "getSituationReport");
		const getMonthlyProfitLossSpy = jest.spyOn(taxCalculator as any, "getMonthlyProfitLoss");
		const getDarfsSpy = jest.spyOn(taxCalculator as any, "getDarfs");

		taxCalculator.getTaxReport(year);

		expect(getSituationReportSpy).toHaveBeenCalledWith(year);
		expect(getSituationReportSpy).toHaveBeenCalledTimes(1);
		expect(getMonthlyProfitLossSpy).toHaveBeenCalledWith(year);
		expect(getMonthlyProfitLossSpy).toHaveBeenCalledTimes(1);
		expect(getDarfsSpy).toHaveBeenCalledWith(
			year,
			taxCalculator["getMonthlyProfitLoss"](year),
			BrazilianSubscriptionTaxCalculator["DARF_RATE"],
		);
		expect(getDarfsSpy).toHaveBeenCalledTimes(1);
	});
});
