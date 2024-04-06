/* eslint-disable @typescript-eslint/no-explicit-any */
import csv from "csvtojson";
import TaxCalculator from "./TaxCalculator";
import { TransactionType } from "./Transaction";
import mapCsvTransactionToTransaction, { CsvTransaction } from "./TransactionMapper";
import { FLOATING_POINT_PRECISION } from "./utils";

describe("TaxCalculator", () => {
	describe("getUpdatedAveragePrice", () => {
		const anything: any = undefined;

		test.each([
			[0, 0, 30, 0, 0],
			[0, 0, 30, 30 * 3.26, 3.26],
			[50, 0, 30, 0, 0],
			[50, 0, 30, 30 * 3.26, (30 * 3.26) / (50 + 30)],
			[50, 6.49, 30, 0, (50 * 6.49) / (50 + 30)],
			[50, 6.49, 30, 30 * 3.26, (50 * 6.49 + 30 * 3.26) / (50 + 30)],
			[
				43.64581943,
				12.46182674,
				294.34868425,
				294.34868425 * 30.16524687,
				(43.64581943 * 12.46182674 + 294.34868425 * 30.16524687) / (43.64581943 + 294.34868425),
			],
		])(
			"getUpdatedAveragePrice(%p, %p, %p, %p) = %p",
			(position, averagePrice, positionIncrement, valueIncrement, updatedAveragePrice) => {
				expect(TaxCalculator["getUpdatedAveragePrice"](position, averagePrice, positionIncrement, valueIncrement)).toBe(
					updatedAveragePrice,
				);
			},
		);

		it("should throw an error when current position is negative", () => {
			expect(() => TaxCalculator["getUpdatedAveragePrice"](-1, anything, anything, anything)).toThrow(
				"Current position -1 must not be negative.",
			);
		});

		it("should throw an error when current average price is negative", () => {
			expect(() => TaxCalculator["getUpdatedAveragePrice"](anything, -1, anything, anything)).toThrow(
				"Current average price -1 must not be negative.",
			);
		});

		it("should throw an error when position increment not positive", () => {
			expect(() => TaxCalculator["getUpdatedAveragePrice"](anything, anything, 0, anything)).toThrow(
				"Position increment 0 must be positive.",
			);
			expect(() => TaxCalculator["getUpdatedAveragePrice"](anything, anything, -1, anything)).toThrow(
				"Position increment -1 must be positive.",
			);
		});

		it("should throw an error when value increment is negative", () => {
			expect(() => TaxCalculator["getUpdatedAveragePrice"](anything, anything, anything, -1)).toThrow(
				"Value increment -1 must not be negative.",
			);
		});
	});

	describe("getYearlyTaxData", () => {
		let yearlyTaxData: ReturnType<(typeof TaxCalculator)["getYearlyTaxData"]>;

		beforeAll(async () => {
			const csvTransactions: CsvTransaction[] = await csv().fromFile("data/transactions.csv");
			const transactions = csvTransactions.map(mapCsvTransactionToTransaction);
			yearlyTaxData = TaxCalculator["getYearlyTaxData"](transactions);
		});

		it("should return buy transactions with no profits", async () => {
			const transactions = yearlyTaxData.processedTransactions;
			const buyTransactions = transactions.filter((transaction) => transaction.type === TransactionType.Buy);
			for (const transaction of buyTransactions) expect(transaction.profit).toBeNull();
		});

		it("should return sell transactions with profits", async () => {
			const transactions = yearlyTaxData.processedTransactions;
			const sellTransactions = transactions.filter((transaction) => transaction.type === TransactionType.Sell);
			for (const transaction of sellTransactions) expect(transaction.profit).toEqual(expect.any(Number));
		});

		it("should return a yearly position map", () => {
			const { positionMapByYear } = yearlyTaxData;
			expect(positionMapByYear.get(2019)).toStrictEqual(
				new Map([
					["ABEV3", 37],
					["ALZR11", 7],
					["B3SA3", 13],
					["BIDI3", 10],
					["CIEL3", 22],
					["EGIE3", 14],
					["FLRY3", 24],
					["GGRC11", 6],
					["GRND3", 59],
					["HGBS11", 3],
					["HGLG11", 5],
					["HGRE11", 5],
					["HYPE3", 21],
					["IRBR3", 18],
					["ITUB3", 22],
					["KNRI11", 5],
					["LREN3", 13],
					["MDIA3", 100],
					["MULT3", 22],
					["ODPV3", 44],
					["PSSA3", 11],
					["RADL3", 9],
					["VISC11", 7],
					["VRTA11", 7],
					["WEGE3", 21],
					["XPLG11", 7],
					["XPML11", 7],
				]),
			);
			expect(positionMapByYear.get(2020)).toStrictEqual(
				new Map([
					["ABEV3", 55],
					["ALZR11", 11],
					["CIEL3", 22],
					["EGIE3", 19],
					["FLMA11", 82],
					["FLRY3", 33],
					["GGRC11", 12],
					["GRND3", 87],
					["HGBS11", 7],
					["HGLG11", 18],
					["HGRE11", 8],
					["IRBR3", 25],
					["KNRI11", 19],
					["LREN3", 19],
					["MULT3", 31],
					["ODPV3", 61],
					["VISC11", 11],
					["VRTA11", 11],
					["XPLG11", 22],
					["XPML11", 29],
				]),
			);
			expect(positionMapByYear.get(2021)).toStrictEqual(new Map());
			expect(positionMapByYear.get(2022)).toStrictEqual(new Map());
			expect(positionMapByYear.get(2023)).toStrictEqual(
				new Map([
					["BOVA11", 10],
					["IMAB11", 66],
					["IRFM11", 27],
					["XFIX11", 34],
				]),
			);
			expect(positionMapByYear.get(2024)).toStrictEqual(
				new Map([
					["B5P211", 146],
					["BOVA11", 10],
					["IRFM11", 27],
					["IVVB11", 47],
				]),
			);
		});

		it("should return a yearly average price map", () => {
			const { averagePriceMapByYear } = yearlyTaxData;
			expect(averagePriceMapByYear.get(2019)).toStrictEqual(
				new Map([
					["ABEV3", expect.closeTo(677.47 / 37, FLOATING_POINT_PRECISION)],
					["ALZR11", expect.closeTo(850.08 / 7, FLOATING_POINT_PRECISION)],
					["B3SA3", expect.closeTo(445.79 / 13, FLOATING_POINT_PRECISION)],
					["BIDI3", expect.closeTo(155.41 / 10, FLOATING_POINT_PRECISION)],
					["CIEL3", expect.closeTo(178.16 / 22, FLOATING_POINT_PRECISION)],
					["EGIE3", expect.closeTo(666.37 / 14, FLOATING_POINT_PRECISION)],
					["FLRY3", expect.closeTo(691.44 / 24, FLOATING_POINT_PRECISION)],
					["GGRC11", expect.closeTo(853.08 / 6, FLOATING_POINT_PRECISION)],
					["GRND3", expect.closeTo(685.58 / 59, FLOATING_POINT_PRECISION)],
					["HGBS11", expect.closeTo(855.6 / 3, FLOATING_POINT_PRECISION)],
					["HGLG11", expect.closeTo(933.03 / 5, FLOATING_POINT_PRECISION)],
					["HGRE11", expect.closeTo(839.5 / 5, FLOATING_POINT_PRECISION)],
					["HYPE3", expect.closeTo(675.93 / 21, FLOATING_POINT_PRECISION)],
					["IRBR3", expect.closeTo(667.26 / 18, FLOATING_POINT_PRECISION)],
					["ITUB3", expect.closeTo(683.76 / 22, FLOATING_POINT_PRECISION)],
					["KNRI11", expect.closeTo(899.95 / 5, FLOATING_POINT_PRECISION)],
					["LREN3", expect.closeTo(693.68 / 13, FLOATING_POINT_PRECISION)],
					["MDIA3", expect.closeTo(3947.97 / 100, FLOATING_POINT_PRECISION)],
					["MULT3", expect.closeTo(667.26 / 22, FLOATING_POINT_PRECISION)],
					["ODPV3", expect.closeTo(694.76 / 44, FLOATING_POINT_PRECISION)],
					["PSSA3", expect.closeTo(661.32 / 11, FLOATING_POINT_PRECISION)],
					["RADL3", expect.closeTo(950.37 / 9, FLOATING_POINT_PRECISION)],
					["VISC11", expect.closeTo(942.75 / 7, FLOATING_POINT_PRECISION)],
					["VRTA11", expect.closeTo(904.19 / 7, FLOATING_POINT_PRECISION)],
					["WEGE3", expect.closeTo(686.7 / 21, FLOATING_POINT_PRECISION)],
					["XPLG11", expect.closeTo(923.09 / 7, FLOATING_POINT_PRECISION)],
					["XPML11", expect.closeTo(890.72 / 7, FLOATING_POINT_PRECISION)],
				]),
			);
			expect(averagePriceMapByYear.get(2020)).toStrictEqual(
				new Map([
					["ABEV3", expect.closeTo(1001.91 / 55, FLOATING_POINT_PRECISION)],
					["ALZR11", expect.closeTo(1435.52 / 11, FLOATING_POINT_PRECISION)],
					["CIEL3", expect.closeTo(178.16 / 22, FLOATING_POINT_PRECISION)],
					["EGIE3", expect.closeTo(927.07 / 19, FLOATING_POINT_PRECISION)],
					["FLMA11", expect.closeTo(250.9 / 82, FLOATING_POINT_PRECISION)],
					["FLRY3", expect.closeTo(966.48 / 33, FLOATING_POINT_PRECISION)],
					["GGRC11", expect.closeTo(1751.18 / 12, FLOATING_POINT_PRECISION)],
					["GRND3", expect.closeTo(1026.57 / 87, FLOATING_POINT_PRECISION)],
					["HGBS11", expect.closeTo(2055.37 / 7, FLOATING_POINT_PRECISION)],
					["HGLG11", expect.closeTo(3483.29 / 18, FLOATING_POINT_PRECISION)],
					["HGRE11", expect.closeTo(1481.02 / 8, FLOATING_POINT_PRECISION)],
					["IRBR3", expect.closeTo(940.61 / 25, FLOATING_POINT_PRECISION)],
					["KNRI11", expect.closeTo(3355.47 / 19, FLOATING_POINT_PRECISION)],
					["LREN3", expect.closeTo(1019.67 / 19, FLOATING_POINT_PRECISION)],
					["MULT3", expect.closeTo(968.76 / 31, FLOATING_POINT_PRECISION)],
					["ODPV3", expect.closeTo(983.93 / 61, FLOATING_POINT_PRECISION)],
					["VISC11", expect.closeTo(1522.23 / 11, FLOATING_POINT_PRECISION)],
					["VRTA11", expect.closeTo(1484.03 / 11, FLOATING_POINT_PRECISION)],
					["XPLG11", expect.closeTo(2941.24 / 22, FLOATING_POINT_PRECISION)],
					["XPML11", expect.closeTo(3340.34 / 29, FLOATING_POINT_PRECISION)],
				]),
			);
			expect(averagePriceMapByYear.get(2021)).toStrictEqual(new Map());
			expect(averagePriceMapByYear.get(2022)).toStrictEqual(new Map());
			expect(averagePriceMapByYear.get(2023)).toStrictEqual(
				new Map([
					["BOVA11", expect.closeTo(976.7 / 10, FLOATING_POINT_PRECISION)],
					["IMAB11", expect.closeTo(5936.69 / 66, FLOATING_POINT_PRECISION)],
					["IRFM11", expect.closeTo(1969.11 / 27, FLOATING_POINT_PRECISION)],
					["XFIX11", expect.closeTo(336.6 / 34, FLOATING_POINT_PRECISION)],
				]),
			);
			expect(averagePriceMapByYear.get(2024)).toStrictEqual(
				new Map([
					["B5P211", expect.closeTo((41 * 87.78 + 105 * 88) / (41 + 105), FLOATING_POINT_PRECISION)],
					["BOVA11", expect.closeTo(97.67, FLOATING_POINT_PRECISION)],
					["IRFM11", expect.closeTo(72.93, FLOATING_POINT_PRECISION)],
					["IVVB11", expect.closeTo((12 * 289.4 + 35 * 288.74) / (12 + 35), FLOATING_POINT_PRECISION)],
				]),
			);
		});
	});

	test.each([
		[1 / 3, 0.33],
		[2 / 3, 0.67],
		[0.999, 1],
		[0.991, 0.99],
	])("getMonetaryValue(%p) = %p", (value, monetaryValue) => {
		expect(TaxCalculator["getMonetaryValue"](value)).toBe(monetaryValue);
	});
});
