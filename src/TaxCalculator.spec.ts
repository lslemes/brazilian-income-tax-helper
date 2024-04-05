/* eslint-disable @typescript-eslint/no-explicit-any */
import TaxCalculator from "./TaxCalculator";

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

	test.each([
		[1 / 3, 0.33],
		[2 / 3, 0.67],
		[0.999, 1],
		[0.991, 0.99],
	])("getMonetaryValue(%p) = %p", (value, monetaryValue) => {
		expect(TaxCalculator["getMonetaryValue"](value)).toBe(monetaryValue);
	});
});
