/* eslint-disable @typescript-eslint/no-explicit-any */
import { TradeTransaction } from "../../TradeTransaction";
import { InternationalSellTransaction } from "./InternationalSellTransaction";

describe(InternationalSellTransaction.name, () => {
	const ANYTHING: any = undefined;

	it("should throw an error when price is negative", () => {
		expect(() => new InternationalSellTransaction(ANYTHING, ANYTHING, -1, ANYTHING)).toThrow(
			`${TradeTransaction.name} price -1 must not be negative.`,
		);
	});

	it("should throw an error when quantity is not positive", () => {
		expect(() => new InternationalSellTransaction(ANYTHING, ANYTHING, ANYTHING, 0)).toThrow(
			`${TradeTransaction.name} quantity 0 must be positive.`,
		);
		expect(() => new InternationalSellTransaction(ANYTHING, ANYTHING, ANYTHING, -1)).toThrow(
			`${TradeTransaction.name} quantity -1 must be positive.`,
		);
	});

	it.each([
		[12, 19.45, 12 * 19.45],
		[64.46587313, 13.64597824, 64.46587313 * 13.64597824],
		[10, 0, 0],
	])("should correctly calculate transaction value (%p * %p = %p)", (quantity, price, expectedValue) => {
		const transaction = new InternationalSellTransaction(ANYTHING, ANYTHING, price, quantity);
		expect(transaction.value).toBe(expectedValue);
	});
});
