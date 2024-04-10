/* eslint-disable @typescript-eslint/no-explicit-any */
import csv from "csvtojson";
import { AssetType } from "../../asset/Asset";
import { FLOATING_POINT_PRECISION } from "../../testUtils";
import processBrazilianCsvTransaction, {
	BrazilianCsvTransaction,
} from "../../transaction/processBrazilianCsvTransaction";
import BrazilianStockTaxCalculator from "./BrazilianStockTaxCalculator";

describe(BrazilianStockTaxCalculator.name, () => {
	let taxCalculator: BrazilianStockTaxCalculator;

	beforeAll(async () => {
		const csvTransactions: BrazilianCsvTransaction[] = await csv().fromFile("data/brazilianTransactions.csv");
		const transactions = csvTransactions.map(processBrazilianCsvTransaction);
		taxCalculator = new BrazilianStockTaxCalculator(transactions);
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should filter stock transactions", () => {
		for (const transaction of taxCalculator["transactions"])
			expect(transaction.asset.type === AssetType.BrazilianStock);
	});

	test.each([
		[
			2019,
			[
				0,
				0,
				0,
				0,
				0,
				20,
				expect.closeTo(477.61, FLOATING_POINT_PRECISION),
				0,
				0,
				0,
				expect.closeTo(2879, FLOATING_POINT_PRECISION),
				expect.closeTo(919.64, FLOATING_POINT_PRECISION),
			],
		],
		[
			2020,
			[
				expect.closeTo(11.09, FLOATING_POINT_PRECISION),
				0,
				0,
				0,
				0,
				0,
				expect.closeTo(2180.05, FLOATING_POINT_PRECISION),
				expect.closeTo(39.41, FLOATING_POINT_PRECISION),
				0,
				0,
				0,
				0,
			],
		],
		[2021, [expect.closeTo(-2097.79, FLOATING_POINT_PRECISION), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
		[2022, new Array(12).fill(0)],
		[2023, new Array(12).fill(0)],
		[2024, new Array(12).fill(0)],
	])("getMonthlyProfitLoss(%p)", (year, expectedProfits) => {
		expect(taxCalculator["getMonthlyProfitLoss"](year)).toStrictEqual(expectedProfits);
	});

	test.each([
		[
			2019,
			new Map([
				["ABEV3", { position: 37, value: expect.closeTo(677.47, FLOATING_POINT_PRECISION) }],
				["B3SA3", { position: 13, value: expect.closeTo(445.79, FLOATING_POINT_PRECISION) }],
				["BIDI3", { position: 10, value: expect.closeTo(155.41, FLOATING_POINT_PRECISION) }],
				["CIEL3", { position: 22, value: expect.closeTo(178.16, FLOATING_POINT_PRECISION) }],
				["EGIE3", { position: 14, value: expect.closeTo(666.37, FLOATING_POINT_PRECISION) }],
				["FLRY3", { position: 24, value: expect.closeTo(691.44, FLOATING_POINT_PRECISION) }],
				["GRND3", { position: 59, value: expect.closeTo(685.58, FLOATING_POINT_PRECISION) }],
				["HYPE3", { position: 21, value: expect.closeTo(675.93, FLOATING_POINT_PRECISION) }],
				["IRBR3", { position: 18, value: expect.closeTo(667.26, FLOATING_POINT_PRECISION) }],
				["ITUB3", { position: 22, value: expect.closeTo(683.76, FLOATING_POINT_PRECISION) }],
				["LREN3", { position: 13, value: expect.closeTo(693.68, FLOATING_POINT_PRECISION) }],
				["MDIA3", { position: 100, value: expect.closeTo(3947.97, FLOATING_POINT_PRECISION) }],
				["MULT3", { position: 22, value: expect.closeTo(667.26, FLOATING_POINT_PRECISION) }],
				["ODPV3", { position: 44, value: expect.closeTo(694.76, FLOATING_POINT_PRECISION) }],
				["PSSA3", { position: 11, value: expect.closeTo(661.32, FLOATING_POINT_PRECISION) }],
				["RADL3", { position: 9, value: expect.closeTo(950.37, FLOATING_POINT_PRECISION) }],
				["WEGE3", { position: 21, value: expect.closeTo(686.7, FLOATING_POINT_PRECISION) }],
			]),
		],
		[
			2020,
			new Map([
				["ABEV3", { position: 55, value: expect.closeTo(1001.91, FLOATING_POINT_PRECISION) }],
				["CIEL3", { position: 22, value: expect.closeTo(178.16, FLOATING_POINT_PRECISION) }],
				["EGIE3", { position: 19, value: expect.closeTo(927.07, FLOATING_POINT_PRECISION) }],
				["FLRY3", { position: 33, value: expect.closeTo(966.48, FLOATING_POINT_PRECISION) }],
				["GRND3", { position: 87, value: expect.closeTo(1026.57, FLOATING_POINT_PRECISION) }],
				["IRBR3", { position: 25, value: expect.closeTo(940.61, FLOATING_POINT_PRECISION) }],
				["LREN3", { position: 19, value: expect.closeTo(1019.67, FLOATING_POINT_PRECISION) }],
				["MULT3", { position: 31, value: expect.closeTo(968.76, FLOATING_POINT_PRECISION) }],
				["ODPV3", { position: 61, value: expect.closeTo(983.93, FLOATING_POINT_PRECISION) }],
			]),
		],
		[2021, new Map()],
		[2022, new Map()],
		[2023, new Map()],
		[2024, new Map()],
	])("getSituation(%p)", (year, expectedSituation) => {
		expect(taxCalculator["getSituation"](year)).toStrictEqual(expectedSituation);
	});

	test.each([
		[
			2019,
			new Map([
				["ABEV3", { position: 37, lastValue: 0, currentValue: expect.closeTo(677.47, FLOATING_POINT_PRECISION) }],
				["B3SA3", { position: 13, lastValue: 0, currentValue: expect.closeTo(445.79, FLOATING_POINT_PRECISION) }],
				["BIDI3", { position: 10, lastValue: 0, currentValue: expect.closeTo(155.41, FLOATING_POINT_PRECISION) }],
				["CIEL3", { position: 22, lastValue: 0, currentValue: expect.closeTo(178.16, FLOATING_POINT_PRECISION) }],
				["EGIE3", { position: 14, lastValue: 0, currentValue: expect.closeTo(666.37, FLOATING_POINT_PRECISION) }],
				["FLRY3", { position: 24, lastValue: 0, currentValue: expect.closeTo(691.44, FLOATING_POINT_PRECISION) }],
				["GRND3", { position: 59, lastValue: 0, currentValue: expect.closeTo(685.58, FLOATING_POINT_PRECISION) }],
				["HYPE3", { position: 21, lastValue: 0, currentValue: expect.closeTo(675.93, FLOATING_POINT_PRECISION) }],
				["IRBR3", { position: 18, lastValue: 0, currentValue: expect.closeTo(667.26, FLOATING_POINT_PRECISION) }],
				["ITUB3", { position: 22, lastValue: 0, currentValue: expect.closeTo(683.76, FLOATING_POINT_PRECISION) }],
				["LREN3", { position: 13, lastValue: 0, currentValue: expect.closeTo(693.68, FLOATING_POINT_PRECISION) }],
				["MDIA3", { position: 100, lastValue: 0, currentValue: expect.closeTo(3947.97, FLOATING_POINT_PRECISION) }],
				["MULT3", { position: 22, lastValue: 0, currentValue: expect.closeTo(667.26, FLOATING_POINT_PRECISION) }],
				["ODPV3", { position: 44, lastValue: 0, currentValue: expect.closeTo(694.76, FLOATING_POINT_PRECISION) }],
				["PSSA3", { position: 11, lastValue: 0, currentValue: expect.closeTo(661.32, FLOATING_POINT_PRECISION) }],
				["RADL3", { position: 9, lastValue: 0, currentValue: expect.closeTo(950.37, FLOATING_POINT_PRECISION) }],
				["WEGE3", { position: 21, lastValue: 0, currentValue: expect.closeTo(686.7, FLOATING_POINT_PRECISION) }],
			]),
		],
		[
			2020,
			new Map([
				[
					"ABEV3",
					{
						position: 55,
						lastValue: expect.closeTo(677.47, FLOATING_POINT_PRECISION),
						currentValue: expect.closeTo(1001.91, FLOATING_POINT_PRECISION),
					},
				],
				["B3SA3", { position: 0, lastValue: expect.closeTo(445.79, FLOATING_POINT_PRECISION), currentValue: 0 }],
				["BIDI3", { position: 0, lastValue: expect.closeTo(155.41, FLOATING_POINT_PRECISION), currentValue: 0 }],
				[
					"CIEL3",
					{
						position: 22,
						lastValue: expect.closeTo(178.16, FLOATING_POINT_PRECISION),
						currentValue: expect.closeTo(178.16, FLOATING_POINT_PRECISION),
					},
				],
				[
					"EGIE3",
					{
						position: 19,
						lastValue: expect.closeTo(666.37, FLOATING_POINT_PRECISION),
						currentValue: expect.closeTo(927.07, FLOATING_POINT_PRECISION),
					},
				],
				[
					"FLRY3",
					{
						position: 33,
						lastValue: expect.closeTo(691.44, FLOATING_POINT_PRECISION),
						currentValue: expect.closeTo(966.48, FLOATING_POINT_PRECISION),
					},
				],
				[
					"GRND3",
					{
						position: 87,
						lastValue: expect.closeTo(685.58, FLOATING_POINT_PRECISION),
						currentValue: expect.closeTo(1026.57, FLOATING_POINT_PRECISION),
					},
				],
				["HYPE3", { position: 0, lastValue: expect.closeTo(675.93, FLOATING_POINT_PRECISION), currentValue: 0 }],
				[
					"IRBR3",
					{
						position: 25,
						lastValue: expect.closeTo(667.26, FLOATING_POINT_PRECISION),
						currentValue: expect.closeTo(940.61, FLOATING_POINT_PRECISION),
					},
				],
				["ITUB3", { position: 0, lastValue: expect.closeTo(683.76, FLOATING_POINT_PRECISION), currentValue: 0 }],
				[
					"LREN3",
					{
						position: 19,
						lastValue: expect.closeTo(693.68, FLOATING_POINT_PRECISION),
						currentValue: expect.closeTo(1019.67, FLOATING_POINT_PRECISION),
					},
				],
				["MDIA3", { position: 0, lastValue: expect.closeTo(3947.97, FLOATING_POINT_PRECISION), currentValue: 0 }],
				[
					"MULT3",
					{
						position: 31,
						lastValue: expect.closeTo(667.26, FLOATING_POINT_PRECISION),
						currentValue: expect.closeTo(968.76, FLOATING_POINT_PRECISION),
					},
				],
				[
					"ODPV3",
					{
						position: 61,
						lastValue: expect.closeTo(694.76, FLOATING_POINT_PRECISION),
						currentValue: expect.closeTo(983.93, FLOATING_POINT_PRECISION),
					},
				],
				["PSSA3", { position: 0, lastValue: expect.closeTo(661.32, FLOATING_POINT_PRECISION), currentValue: 0 }],
				["RADL3", { position: 0, lastValue: expect.closeTo(950.37, FLOATING_POINT_PRECISION), currentValue: 0 }],
				["WEGE3", { position: 0, lastValue: expect.closeTo(686.7, FLOATING_POINT_PRECISION), currentValue: 0 }],
			]),
		],
		[
			2021,
			new Map([
				["ABEV3", { position: 0, lastValue: expect.closeTo(1001.91, FLOATING_POINT_PRECISION), currentValue: 0 }],
				["CIEL3", { position: 0, lastValue: expect.closeTo(178.16, FLOATING_POINT_PRECISION), currentValue: 0 }],
				["EGIE3", { position: 0, lastValue: expect.closeTo(927.07, FLOATING_POINT_PRECISION), currentValue: 0 }],
				["FLRY3", { position: 0, lastValue: expect.closeTo(966.48, FLOATING_POINT_PRECISION), currentValue: 0 }],
				["GRND3", { position: 0, lastValue: expect.closeTo(1026.57, FLOATING_POINT_PRECISION), currentValue: 0 }],
				["IRBR3", { position: 0, lastValue: expect.closeTo(940.61, FLOATING_POINT_PRECISION), currentValue: 0 }],
				["LREN3", { position: 0, lastValue: expect.closeTo(1019.67, FLOATING_POINT_PRECISION), currentValue: 0 }],
				["MULT3", { position: 0, lastValue: expect.closeTo(968.76, FLOATING_POINT_PRECISION), currentValue: 0 }],
				["ODPV3", { position: 0, lastValue: expect.closeTo(983.93, FLOATING_POINT_PRECISION), currentValue: 0 }],
			]),
		],
		[2022, new Map()],
		[2023, new Map()],
		[2024, new Map()],
	])("getSituationReport(%p)", (year, expectedReport) => {
		expect(taxCalculator["getSituationReport"](year)).toStrictEqual(expectedReport);
	});

	test.each([
		[
			2019,
			[
				0,
				0,
				0,
				0,
				0,
				expect.closeTo(1677, FLOATING_POINT_PRECISION),
				expect.closeTo(4285.01, FLOATING_POINT_PRECISION),
				0,
				0,
				0,
				expect.closeTo(18706.2, FLOATING_POINT_PRECISION),
				expect.closeTo(10974.62, FLOATING_POINT_PRECISION),
			],
		],
		[
			2020,
			[
				expect.closeTo(166.5, FLOATING_POINT_PRECISION),
				0,
				0,
				0,
				0,
				0,
				expect.closeTo(15148.86, FLOATING_POINT_PRECISION),
				expect.closeTo(1374.25, FLOATING_POINT_PRECISION),
				0,
				0,
				0,
				0,
			],
		],
		[2021, [expect.closeTo(5915.37, FLOATING_POINT_PRECISION), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
		[2022, new Array(12).fill(0)],
		[2023, new Array(12).fill(0)],
		[2024, new Array(12).fill(0)],
	])("getMonthlySalesVolume(%p)", (year, expectedVolumes) => {
		expect(taxCalculator["getMonthlySalesVolume"](year)).toStrictEqual(expectedVolumes);
	});

	test.each([
		[2019, 0, 0],
		[2019, 1, 0],
		[2019, 2, 0],
		[2019, 3, 0],
		[2019, 0, 0],
		[2019, 5, 123.7],
		[2019, 6, 477.61],
		[2019, 7, 0],
		[2019, 8, 0],
		[2019, 9, 0],
		[2019, 10, 2879],
		[2019, 11, 919.64],
		[2020, 0, 11.09],
		[2020, 1, 0],
		[2020, 2, 0],
		[2020, 3, 0],
		[2020, 4, 0],
		[2020, 5, 0],
		[2020, 6, 2180.05],
		[2020, 7, 39.41],
		[2020, 8, 0],
		[2020, 9, 0],
		[2020, 10, 0],
		[2020, 11, 0],
		[2021, 0, 0],
		[2021, 1, 0],
		[2021, 2, 0],
		[2021, 3, 0],
		[2021, 4, 0],
		[2021, 5, 0],
		[2021, 6, 0],
		[2021, 7, 0],
		[2021, 8, 0],
		[2021, 9, 0],
		[2021, 10, 0],
		[2021, 11, 0],
		[2022, 0, 0],
		[2022, 1, 0],
		[2022, 2, 0],
		[2022, 3, 0],
		[2022, 4, 0],
		[2022, 5, 0],
		[2022, 6, 0],
		[2022, 7, 0],
		[2022, 8, 0],
		[2022, 9, 0],
		[2022, 10, 0],
		[2022, 11, 0],
		[2023, 0, 0],
		[2023, 1, 0],
		[2023, 2, 0],
		[2023, 3, 0],
		[2023, 4, 0],
		[2023, 5, 0],
		[2023, 6, 0],
		[2023, 7, 0],
		[2023, 8, 0],
		[2023, 9, 0],
		[2023, 10, 0],
		[2023, 11, 0],
		[2024, 0, 0],
		[2024, 1, 0],
		[2024, 2, 0],
		[2024, 3, 0],
		[2024, 4, 0],
		[2024, 5, 0],
		[2024, 6, 0],
		[2024, 7, 0],
		[2024, 8, 0],
		[2024, 9, 0],
		[2024, 10, 0],
		[2024, 11, 0],
	])("getProfitByMonth(%p, %p)", (year, month, expectedProfit) => {
		expect(taxCalculator["getProfitByMonth"](year, month)).toBeCloseTo(expectedProfit, FLOATING_POINT_PRECISION);
	});

	test.each([
		[2019, 4399.95],
		[2020, 2230.55],
		[2021, 0],
		[2022, 0],
		[2023, 0],
		[2024, 0],
	])("getAnnualExemptProfit(%p, %p)", (year, expectedAnnualExemptProfit) => {
		const monthlySalesVolume = taxCalculator["getMonthlySalesVolume"](year);
		expect(taxCalculator["getAnnualExemptProfit"](year, monthlySalesVolume)).toBeCloseTo(
			expectedAnnualExemptProfit,
			FLOATING_POINT_PRECISION,
		);
	});

	test.each([2019, 2020, 2021, 2022, 2023, 2024])("getDarfs(%p)", (year) => {
		const monthlyProfitloss = taxCalculator["getMonthlyProfitLoss"](year);
		expect(taxCalculator["getDarfs"](year, monthlyProfitloss)).toStrictEqual([]);
	});

	test.each([2019, 2020, 2021, 2022, 2023, 2024])("getTaxReport(%p)", (year) => {
		const getSituationReportSpy = jest.spyOn(taxCalculator as any, "getSituationReport");
		const getMonthlyProfitLossSpy = jest.spyOn(taxCalculator as any, "getMonthlyProfitLoss");
		const getDarfsSpy = jest.spyOn(taxCalculator as any, "getDarfs");
		const getMonthlySalesVolumeSpy = jest.spyOn(taxCalculator as any, "getMonthlySalesVolume");
		const getAnnualExemptProfitSpy = jest.spyOn(taxCalculator as any, "getAnnualExemptProfit");

		taxCalculator.getTaxReport(year);

		expect(getMonthlySalesVolumeSpy).toHaveBeenNthCalledWith(1, year);
		expect(getMonthlySalesVolumeSpy).toHaveBeenCalledTimes(2);
		expect(getSituationReportSpy).toHaveBeenCalledWith(year);
		expect(getSituationReportSpy).toHaveBeenCalledTimes(1);
		expect(getMonthlyProfitLossSpy).toHaveBeenCalledWith(year);
		expect(getMonthlyProfitLossSpy).toHaveBeenCalledTimes(1);
		expect(getDarfsSpy).toHaveBeenCalledWith(
			year,
			taxCalculator["getMonthlyProfitLoss"](year),
			BrazilianStockTaxCalculator["DARF_RATE"],
		);
		expect(getDarfsSpy).toHaveBeenCalledTimes(1);
		expect(getAnnualExemptProfitSpy).toHaveBeenCalledWith(year, taxCalculator["getMonthlySalesVolume"](year));
		expect(getAnnualExemptProfitSpy).toHaveBeenCalledTimes(1);
	});
});
