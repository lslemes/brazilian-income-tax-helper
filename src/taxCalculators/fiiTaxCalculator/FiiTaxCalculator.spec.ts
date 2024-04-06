import csv from "csvtojson";
import { AssetType } from "../../transaction/Transaction";
import mapCsvTransactionToTransaction, { CsvTransaction } from "../../transaction/mapCsvTransactionToTransaction";
import { FLOATING_POINT_PRECISION } from "../../utils";
import FiiTaxCalculator from "./FiiTaxCalculator";

describe("FiiTaxCalculator", () => {
	let fiiTaxCalculator: FiiTaxCalculator;

	beforeAll(async () => {
		const csvTransactions: CsvTransaction[] = await csv().fromFile("data/transactions.csv");
		const transactions = csvTransactions.map(mapCsvTransactionToTransaction);
		fiiTaxCalculator = new FiiTaxCalculator(transactions);
	});

	it("should filter FII transactions", () => {
		for (const transaction of fiiTaxCalculator["transactions"]) expect(transaction.asset.type === AssetType.Fii);
	});

	test.each([
		[2019, [0, 0, 0, 0, 0, expect.closeTo(-96.54, FLOATING_POINT_PRECISION), 0, 0, 0, 0, 0, 0]],
		[2020, new Array(12).fill(0)],
		[2021, [expect.closeTo(-2121.71), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
		[2022, new Array(12).fill(0)],
		[2023, new Array(12).fill(0)],
		[2024, new Array(12).fill(0)],
	])("getMonthlyProfit(%p)", (year, expectedProfits) => {
		expect(fiiTaxCalculator["getMonthlyProfit"](year)).toStrictEqual(expectedProfits);
	});

	test.each([
		[
			2019,
			new Map([
				["ALZR11", { position: 7, value: expect.closeTo(850.08, FLOATING_POINT_PRECISION) }],
				["GGRC11", { position: 6, value: expect.closeTo(853.08, FLOATING_POINT_PRECISION) }],
				["HGBS11", { position: 3, value: expect.closeTo(855.6, FLOATING_POINT_PRECISION) }],
				["HGLG11", { position: 5, value: expect.closeTo(933.03, FLOATING_POINT_PRECISION) }],
				["HGRE11", { position: 5, value: expect.closeTo(839.5, FLOATING_POINT_PRECISION) }],
				["KNRI11", { position: 5, value: expect.closeTo(899.95, FLOATING_POINT_PRECISION) }],
				["VISC11", { position: 7, value: expect.closeTo(942.75, FLOATING_POINT_PRECISION) }],
				["VRTA11", { position: 7, value: expect.closeTo(904.19, FLOATING_POINT_PRECISION) }],
				["XPLG11", { position: 7, value: expect.closeTo(923.09, FLOATING_POINT_PRECISION) }],
				["XPML11", { position: 7, value: expect.closeTo(890.72, FLOATING_POINT_PRECISION) }],
			]),
		],
		[
			2020,
			new Map([
				["ALZR11", { position: 11, value: expect.closeTo(1435.52, FLOATING_POINT_PRECISION) }],
				["FLMA11", { position: 82, value: expect.closeTo(250.9, FLOATING_POINT_PRECISION) }],
				["GGRC11", { position: 12, value: expect.closeTo(1751.18, FLOATING_POINT_PRECISION) }],
				["HGBS11", { position: 7, value: expect.closeTo(2055.37, FLOATING_POINT_PRECISION) }],
				["HGLG11", { position: 18, value: expect.closeTo(3483.29, FLOATING_POINT_PRECISION) }],
				["HGRE11", { position: 8, value: expect.closeTo(1481.02, FLOATING_POINT_PRECISION) }],
				["KNRI11", { position: 19, value: expect.closeTo(3355.47, FLOATING_POINT_PRECISION) }],
				["VISC11", { position: 11, value: expect.closeTo(1522.23, FLOATING_POINT_PRECISION) }],
				["VRTA11", { position: 11, value: expect.closeTo(1484.03, FLOATING_POINT_PRECISION) }],
				["XPLG11", { position: 22, value: expect.closeTo(2941.24, FLOATING_POINT_PRECISION) }],
				["XPML11", { position: 29, value: expect.closeTo(3340.34, FLOATING_POINT_PRECISION) }],
			]),
		],
		[2021, new Map()],
		[2022, new Map()],
		[2023, new Map()],
		[2024, new Map()],
	])("getSituation(%p)", (year, expectedSituation) => {
		expect(fiiTaxCalculator["getSituation"](year)).toStrictEqual(expectedSituation);
	});

	test.each([
		[
			2019,
			new Map([
				["ALZR11", { position: 7, lastValue: 0, currentValue: expect.closeTo(850.08, FLOATING_POINT_PRECISION) }],
				["GGRC11", { position: 6, lastValue: 0, currentValue: expect.closeTo(853.08, FLOATING_POINT_PRECISION) }],
				["HGBS11", { position: 3, lastValue: 0, currentValue: expect.closeTo(855.6, FLOATING_POINT_PRECISION) }],
				["HGLG11", { position: 5, lastValue: 0, currentValue: expect.closeTo(933.03, FLOATING_POINT_PRECISION) }],
				["HGRE11", { position: 5, lastValue: 0, currentValue: expect.closeTo(839.5, FLOATING_POINT_PRECISION) }],
				["KNRI11", { position: 5, lastValue: 0, currentValue: expect.closeTo(899.95, FLOATING_POINT_PRECISION) }],
				["VISC11", { position: 7, lastValue: 0, currentValue: expect.closeTo(942.75, FLOATING_POINT_PRECISION) }],
				["VRTA11", { position: 7, lastValue: 0, currentValue: expect.closeTo(904.19, FLOATING_POINT_PRECISION) }],
				["XPLG11", { position: 7, lastValue: 0, currentValue: expect.closeTo(923.09, FLOATING_POINT_PRECISION) }],
				["XPML11", { position: 7, lastValue: 0, currentValue: expect.closeTo(890.72, FLOATING_POINT_PRECISION) }],
			]),
		],
		[
			2020,
			new Map([
				[
					"ALZR11",
					{
						position: 11,
						lastValue: expect.closeTo(850.08, FLOATING_POINT_PRECISION),
						currentValue: expect.closeTo(1435.52, FLOATING_POINT_PRECISION),
					},
				],
				["FLMA11", { position: 82, lastValue: 0, currentValue: expect.closeTo(250.9, FLOATING_POINT_PRECISION) }],
				[
					"GGRC11",
					{
						position: 12,
						lastValue: expect.closeTo(853.08, FLOATING_POINT_PRECISION),
						currentValue: expect.closeTo(1751.18, FLOATING_POINT_PRECISION),
					},
				],
				[
					"HGBS11",
					{
						position: 7,
						lastValue: expect.closeTo(855.6, FLOATING_POINT_PRECISION),
						currentValue: expect.closeTo(2055.37, FLOATING_POINT_PRECISION),
					},
				],
				[
					"HGLG11",
					{
						position: 18,
						lastValue: expect.closeTo(933.03, FLOATING_POINT_PRECISION),
						currentValue: expect.closeTo(3483.29, FLOATING_POINT_PRECISION),
					},
				],
				[
					"HGRE11",
					{
						position: 8,
						lastValue: expect.closeTo(839.5, FLOATING_POINT_PRECISION),
						currentValue: expect.closeTo(1481.02, FLOATING_POINT_PRECISION),
					},
				],
				[
					"KNRI11",
					{
						position: 19,
						lastValue: expect.closeTo(899.95, FLOATING_POINT_PRECISION),
						currentValue: expect.closeTo(3355.47, FLOATING_POINT_PRECISION),
					},
				],
				[
					"VISC11",
					{
						position: 11,
						lastValue: expect.closeTo(942.75, FLOATING_POINT_PRECISION),
						currentValue: expect.closeTo(1522.23, FLOATING_POINT_PRECISION),
					},
				],
				[
					"VRTA11",
					{
						position: 11,
						lastValue: expect.closeTo(904.19, FLOATING_POINT_PRECISION),
						currentValue: expect.closeTo(1484.03, FLOATING_POINT_PRECISION),
					},
				],
				[
					"XPLG11",
					{
						position: 22,
						lastValue: expect.closeTo(923.09, FLOATING_POINT_PRECISION),
						currentValue: expect.closeTo(2941.24, FLOATING_POINT_PRECISION),
					},
				],
				[
					"XPML11",
					{
						position: 29,
						lastValue: expect.closeTo(890.72, FLOATING_POINT_PRECISION),
						currentValue: expect.closeTo(3340.34, FLOATING_POINT_PRECISION),
					},
				],
			]),
		],
		[
			2021,
			new Map([
				["ALZR11", { position: 0, lastValue: expect.closeTo(1435.52, FLOATING_POINT_PRECISION), currentValue: 0 }],
				["FLMA11", { position: 0, lastValue: expect.closeTo(250.9, FLOATING_POINT_PRECISION), currentValue: 0 }],
				["GGRC11", { position: 0, lastValue: expect.closeTo(1751.18, FLOATING_POINT_PRECISION), currentValue: 0 }],
				["HGBS11", { position: 0, lastValue: expect.closeTo(2055.37, FLOATING_POINT_PRECISION), currentValue: 0 }],
				["HGLG11", { position: 0, lastValue: expect.closeTo(3483.29, FLOATING_POINT_PRECISION), currentValue: 0 }],
				["HGRE11", { position: 0, lastValue: expect.closeTo(1481.02, FLOATING_POINT_PRECISION), currentValue: 0 }],
				["KNRI11", { position: 0, lastValue: expect.closeTo(3355.47, FLOATING_POINT_PRECISION), currentValue: 0 }],
				["VISC11", { position: 0, lastValue: expect.closeTo(1522.23, FLOATING_POINT_PRECISION), currentValue: 0 }],
				["VRTA11", { position: 0, lastValue: expect.closeTo(1484.03, FLOATING_POINT_PRECISION), currentValue: 0 }],
				["XPLG11", { position: 0, lastValue: expect.closeTo(2941.24, FLOATING_POINT_PRECISION), currentValue: 0 }],
				["XPML11", { position: 0, lastValue: expect.closeTo(3340.34, FLOATING_POINT_PRECISION), currentValue: 0 }],
			]),
		],
		[2022, new Map()],
		[2023, new Map()],
		[2024, new Map()],
	])("getSituationReport(%p)", (year, expectedReport) => {
		expect(fiiTaxCalculator["getSituationReport"](year)).toStrictEqual(expectedReport);
	});
});
