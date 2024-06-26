/* eslint-disable @typescript-eslint/no-explicit-any */
import csv from "csvtojson";
import { AssetType } from "../../asset/Asset";
import Darf from "../../darf/Darf";
import { FLOATING_POINT_PRECISION } from "../../testUtils";
import processBrazilianCsvTransaction, {
	BrazilianCsvTransaction,
} from "../../transaction/processBrazilianCsvTransaction";
import { MONTHS } from "../../utils";
import BrazilianEtfTaxCalculator from "./BrazilianEtfTaxCalculator";

describe(BrazilianEtfTaxCalculator.name, () => {
	let taxCalculator: BrazilianEtfTaxCalculator;

	beforeAll(async () => {
		const csvTransactions: BrazilianCsvTransaction[] = await csv().fromFile("data/brazilianTransactions.csv");
		const transactions = csvTransactions.map(processBrazilianCsvTransaction);
		taxCalculator = new BrazilianEtfTaxCalculator(transactions);
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should filter ETF transactions", () => {
		for (const transaction of taxCalculator["transactions"])
			expect(
				transaction.asset.type === AssetType.BrazilianFixedIncomeEtf ||
					transaction.asset.type === AssetType.BrazilianVariableIncomeEtf,
			);
	});

	test.each([
		[2019, new Array(12).fill(0)],
		[2020, new Array(12).fill(0)],
		[2021, new Array(12).fill(0)],
		[2022, new Array(12).fill(0)],
		[2023, new Array(12).fill(0)],
		[2024, [0, 0, expect.closeTo(621.89, FLOATING_POINT_PRECISION), 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	])("getMonthlyProfitLoss(%p)", (year, expectedProfits) => {
		expect(taxCalculator["getMonthlyProfitLoss"](year)).toStrictEqual(expectedProfits);
	});

	test.each([
		[2019, new Map()],
		[2020, new Map()],
		[2021, new Map()],
		[2022, new Map()],
		[
			2023,
			new Map([
				["BOVA11", { position: 10, value: expect.closeTo(976.7, FLOATING_POINT_PRECISION) }],
				["IMAB11", { position: 66, value: expect.closeTo(5936.69, FLOATING_POINT_PRECISION) }],
				["IRFM11", { position: 27, value: expect.closeTo(1969.11, FLOATING_POINT_PRECISION) }],
				["XFIX11", { position: 34, value: expect.closeTo(336.6, FLOATING_POINT_PRECISION) }],
			]),
		],
		[
			2024,
			new Map([
				["B5P211", { position: 146, value: expect.closeTo(12838.98, FLOATING_POINT_PRECISION) }],
				["BOVA11", { position: 10, value: expect.closeTo(976.7, FLOATING_POINT_PRECISION) }],
				["IRFM11", { position: 27, value: expect.closeTo(1969.11, FLOATING_POINT_PRECISION) }],
				["IVVB11", { position: 47, value: expect.closeTo(13578.7, FLOATING_POINT_PRECISION) }],
			]),
		],
	])("getSituation(%p)", (year, expectedSituation) => {
		expect(taxCalculator["getSituation"](year)).toStrictEqual(expectedSituation);
	});

	test.each([
		[2019, new Map()],
		[2020, new Map()],
		[2021, new Map()],
		[2022, new Map()],
		[
			2023,
			new Map([
				["BOVA11", { position: 10, lastValue: 0, currentValue: expect.closeTo(976.7, FLOATING_POINT_PRECISION) }],
				["IMAB11", { position: 66, lastValue: 0, currentValue: expect.closeTo(5936.69, FLOATING_POINT_PRECISION) }],
				["IRFM11", { position: 27, lastValue: 0, currentValue: expect.closeTo(1969.11, FLOATING_POINT_PRECISION) }],
				["XFIX11", { position: 34, lastValue: 0, currentValue: expect.closeTo(336.6, FLOATING_POINT_PRECISION) }],
			]),
		],
		[
			2024,
			new Map([
				["B5P211", { position: 146, lastValue: 0, currentValue: expect.closeTo(12838.98, FLOATING_POINT_PRECISION) }],
				[
					"BOVA11",
					{
						position: 10,
						lastValue: expect.closeTo(976.7, FLOATING_POINT_PRECISION),
						currentValue: expect.closeTo(976.7, FLOATING_POINT_PRECISION),
					},
				],
				["IMAB11", { position: 0, lastValue: expect.closeTo(5936.69, FLOATING_POINT_PRECISION), currentValue: 0 }],
				[
					"IRFM11",
					{
						position: 27,
						lastValue: expect.closeTo(1969.11, FLOATING_POINT_PRECISION),
						currentValue: expect.closeTo(1969.11, FLOATING_POINT_PRECISION),
					},
				],
				["IVVB11", { position: 47, lastValue: 0, currentValue: expect.closeTo(13578.7, FLOATING_POINT_PRECISION) }],
				["XFIX11", { position: 0, lastValue: expect.closeTo(336.6, FLOATING_POINT_PRECISION), currentValue: 0 }],
			]),
		],
	])("getSituationReport(%p)", (year, expectedReport) => {
		expect(taxCalculator["getSituationReport"](year)).toStrictEqual(expectedReport);
	});

	test.each([
		[2019, []],
		[2020, []],
		[2021, []],
		[2022, []],
		[2023, []],
		[2024, [new Darf(2024, MONTHS[2].label, 10.91)]],
	])("getDarfs(%p)", (year, expectedDarfs) => {
		expect(taxCalculator["getDarfs"](year)).toStrictEqual(expectedDarfs);
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
			BrazilianEtfTaxCalculator["DARF_RATE"],
		);
		expect(getDarfsSpy).toHaveBeenCalledTimes(1);
	});
});
