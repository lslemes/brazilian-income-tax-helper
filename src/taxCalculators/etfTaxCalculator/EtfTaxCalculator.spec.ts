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
		expect(etfTaxCalculator["getSituation"](year)).toStrictEqual(expectedSituation);
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
		expect(etfTaxCalculator["getSituationReport"](year)).toStrictEqual(expectedReport);
	});
});
