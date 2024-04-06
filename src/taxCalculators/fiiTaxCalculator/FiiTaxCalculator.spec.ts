import csv from "csvtojson";
import { AssetType } from "../../transaction/Transaction";
import mapCsvTransactionToTransaction, { CsvTransaction } from "../../transaction/TransactionMapper";
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
				["ALZR11", { position: 7, situation: expect.closeTo(850.08, FLOATING_POINT_PRECISION) }],
				["GGRC11", { position: 6, situation: expect.closeTo(853.08, FLOATING_POINT_PRECISION) }],
				["HGBS11", { position: 3, situation: expect.closeTo(855.6, FLOATING_POINT_PRECISION) }],
				["HGLG11", { position: 5, situation: expect.closeTo(933.03, FLOATING_POINT_PRECISION) }],
				["HGRE11", { position: 5, situation: expect.closeTo(839.5, FLOATING_POINT_PRECISION) }],
				["KNRI11", { position: 5, situation: expect.closeTo(899.95, FLOATING_POINT_PRECISION) }],
				["VISC11", { position: 7, situation: expect.closeTo(942.75, FLOATING_POINT_PRECISION) }],
				["VRTA11", { position: 7, situation: expect.closeTo(904.19, FLOATING_POINT_PRECISION) }],
				["XPLG11", { position: 7, situation: expect.closeTo(923.09, FLOATING_POINT_PRECISION) }],
				["XPML11", { position: 7, situation: expect.closeTo(890.72, FLOATING_POINT_PRECISION) }],
			]),
		],
		[
			2020,
			new Map([
				["ALZR11", { position: 11, situation: expect.closeTo(1435.52, FLOATING_POINT_PRECISION) }],
				["FLMA11", { position: 82, situation: expect.closeTo(250.9, FLOATING_POINT_PRECISION) }],
				["GGRC11", { position: 12, situation: expect.closeTo(1751.18, FLOATING_POINT_PRECISION) }],
				["HGBS11", { position: 7, situation: expect.closeTo(2055.37, FLOATING_POINT_PRECISION) }],
				["HGLG11", { position: 18, situation: expect.closeTo(3483.29, FLOATING_POINT_PRECISION) }],
				["HGRE11", { position: 8, situation: expect.closeTo(1481.02, FLOATING_POINT_PRECISION) }],
				["KNRI11", { position: 19, situation: expect.closeTo(3355.47, FLOATING_POINT_PRECISION) }],
				["VISC11", { position: 11, situation: expect.closeTo(1522.23, FLOATING_POINT_PRECISION) }],
				["VRTA11", { position: 11, situation: expect.closeTo(1484.03, FLOATING_POINT_PRECISION) }],
				["XPLG11", { position: 22, situation: expect.closeTo(2941.24, FLOATING_POINT_PRECISION) }],
				["XPML11", { position: 29, situation: expect.closeTo(3340.34, FLOATING_POINT_PRECISION) }],
			]),
		],
		[2021, new Map()],
		[2022, new Map()],
		[2023, new Map()],
		[2024, new Map()],
	])("getSituation(%p)", (year, expectedSituation) => {
		expect(fiiTaxCalculator["getSituation"](year)).toStrictEqual(expectedSituation);
	});
});
