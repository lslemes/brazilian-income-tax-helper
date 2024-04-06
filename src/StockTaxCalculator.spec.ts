import csv from "csvtojson";
import StockTaxCalculator from "./StockTaxCalculator";
import { AssetType } from "./Transaction";
import mapCsvTransactionToTransaction, { CsvTransaction } from "./TransactionMapper";
import { FLOATING_POINT_PRECISION } from "./utils";

describe("StockTaxCalculator", () => {
	let stockTaxCalculator: StockTaxCalculator;

	beforeAll(async () => {
		const csvTransactions: CsvTransaction[] = await csv().fromFile("data/transactions.csv");
		const transactions = csvTransactions.map(mapCsvTransactionToTransaction);
		stockTaxCalculator = new StockTaxCalculator(transactions);
	});

	it("should filter stock transactions", () => {
		for (const transaction of stockTaxCalculator["transactions"]) expect(transaction.asset.type === AssetType.Stock);
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
	])("getMonthlyProfit(%p)", (year, expectedProfits) => {
		expect(stockTaxCalculator["getMonthlyProfit"](year)).toStrictEqual(expectedProfits);
	});

	test.each([
		[
			2019,
			new Map([
				["ABEV3", { position: 37, situation: expect.closeTo(677.47, FLOATING_POINT_PRECISION) }],
				["B3SA3", { position: 13, situation: expect.closeTo(445.79, FLOATING_POINT_PRECISION) }],
				["BIDI3", { position: 10, situation: expect.closeTo(155.41, FLOATING_POINT_PRECISION) }],
				["CIEL3", { position: 22, situation: expect.closeTo(178.16, FLOATING_POINT_PRECISION) }],
				["EGIE3", { position: 14, situation: expect.closeTo(666.37, FLOATING_POINT_PRECISION) }],
				["FLRY3", { position: 24, situation: expect.closeTo(691.44, FLOATING_POINT_PRECISION) }],
				["GRND3", { position: 59, situation: expect.closeTo(685.58, FLOATING_POINT_PRECISION) }],
				["HYPE3", { position: 21, situation: expect.closeTo(675.93, FLOATING_POINT_PRECISION) }],
				["IRBR3", { position: 18, situation: expect.closeTo(667.26, FLOATING_POINT_PRECISION) }],
				["ITUB3", { position: 22, situation: expect.closeTo(683.76, FLOATING_POINT_PRECISION) }],
				["LREN3", { position: 13, situation: expect.closeTo(693.68, FLOATING_POINT_PRECISION) }],
				["MDIA3", { position: 100, situation: expect.closeTo(3947.97, FLOATING_POINT_PRECISION) }],
				["MULT3", { position: 22, situation: expect.closeTo(667.26, FLOATING_POINT_PRECISION) }],
				["ODPV3", { position: 44, situation: expect.closeTo(694.76, FLOATING_POINT_PRECISION) }],
				["PSSA3", { position: 11, situation: expect.closeTo(661.32, FLOATING_POINT_PRECISION) }],
				["RADL3", { position: 9, situation: expect.closeTo(950.37, FLOATING_POINT_PRECISION) }],
				["WEGE3", { position: 21, situation: expect.closeTo(686.7, FLOATING_POINT_PRECISION) }],
			]),
		],
		[
			2020,
			new Map([
				["ABEV3", { position: 55, situation: expect.closeTo(1001.91, FLOATING_POINT_PRECISION) }],
				["CIEL3", { position: 22, situation: expect.closeTo(178.16, FLOATING_POINT_PRECISION) }],
				["EGIE3", { position: 19, situation: expect.closeTo(927.07, FLOATING_POINT_PRECISION) }],
				["FLRY3", { position: 33, situation: expect.closeTo(966.48, FLOATING_POINT_PRECISION) }],
				["GRND3", { position: 87, situation: expect.closeTo(1026.57, FLOATING_POINT_PRECISION) }],
				["IRBR3", { position: 25, situation: expect.closeTo(940.61, FLOATING_POINT_PRECISION) }],
				["LREN3", { position: 19, situation: expect.closeTo(1019.67, FLOATING_POINT_PRECISION) }],
				["MULT3", { position: 31, situation: expect.closeTo(968.76, FLOATING_POINT_PRECISION) }],
				["ODPV3", { position: 61, situation: expect.closeTo(983.93, FLOATING_POINT_PRECISION) }],
			]),
		],
		[2021, new Map()],
		[2022, new Map()],
		[2023, new Map()],
		[2024, new Map()],
	])("getSituation(%p)", (year, expectedSituation) => {
		expect(stockTaxCalculator["getSituation"](year)).toStrictEqual(expectedSituation);
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
		expect(stockTaxCalculator["getMonthlySalesVolume"](year)).toStrictEqual(expectedVolumes);
	});

	test.each([
		[
			2019,
			new Map([
				["BRKM5", expect.closeTo(-103.5, FLOATING_POINT_PRECISION)],
				["CGRA4", expect.closeTo(262.48, FLOATING_POINT_PRECISION)],
				["ECOR3", expect.closeTo(722.62, FLOATING_POINT_PRECISION)],
				["GEPA4", expect.closeTo(236, FLOATING_POINT_PRECISION)],
				["IRBR3", expect.closeTo(-0.2, FLOATING_POINT_PRECISION)],
				["ITSA4", expect.closeTo(655.53, FLOATING_POINT_PRECISION)],
				["KLBN11", expect.closeTo(290.48, FLOATING_POINT_PRECISION)],
				["MRVE3", expect.closeTo(105.33, FLOATING_POINT_PRECISION)],
				["RLOG3", expect.closeTo(290, FLOATING_POINT_PRECISION)],
				["SULA11", expect.closeTo(131.16, FLOATING_POINT_PRECISION)],
				["SUZB3", expect.closeTo(1210.37, FLOATING_POINT_PRECISION)],
				["TIET11", expect.closeTo(477.61, FLOATING_POINT_PRECISION)],
				["UNIP6", expect.closeTo(18.37, FLOATING_POINT_PRECISION)],
			]),
		],
		[
			2020,
			new Map([
				["B3SA3", expect.closeTo(546.98, FLOATING_POINT_PRECISION)],
				["BIDI3", expect.closeTo(11.09, FLOATING_POINT_PRECISION)],
				["HYPE3", expect.closeTo(74.84, FLOATING_POINT_PRECISION)],
				["ITUB3", expect.closeTo(185.01, FLOATING_POINT_PRECISION)],
				["MDIA3", expect.closeTo(83.03, FLOATING_POINT_PRECISION)],
				["PSSA3", expect.closeTo(39.41, FLOATING_POINT_PRECISION)],
				["RADL3", expect.closeTo(129.17, FLOATING_POINT_PRECISION)],
				["RENT3", expect.closeTo(111.18, FLOATING_POINT_PRECISION)],
				["WEGE3", expect.closeTo(1049.84, FLOATING_POINT_PRECISION)],
			]),
		],
		[
			2021,
			new Map([
				["ABEV3", expect.closeTo(-148.86, FLOATING_POINT_PRECISION)],
				["CIEL3", expect.closeTo(-87.3, FLOATING_POINT_PRECISION)],
				["EGIE3", expect.closeTo(-90.31, FLOATING_POINT_PRECISION)],
				["FLRY3", expect.closeTo(-83.07, FLOATING_POINT_PRECISION)],
				["GRND3", expect.closeTo(-339.27, FLOATING_POINT_PRECISION)],
				["IRBR3", expect.closeTo(-758.61, FLOATING_POINT_PRECISION)],
				["LREN3", expect.closeTo(-202.86, FLOATING_POINT_PRECISION)],
				["MULT3", expect.closeTo(-292.96, FLOATING_POINT_PRECISION)],
				["ODPV3", expect.closeTo(-94.55, FLOATING_POINT_PRECISION)],
			]),
		],
		[2022, new Map()],
		[2023, new Map()],
		[2024, new Map()],
	])("getProfitByStock(%p)", (year, expectedProfitByStock) => {
		expect(stockTaxCalculator["getProfitByStock"](year)).toStrictEqual(expectedProfitByStock);
	});
});
