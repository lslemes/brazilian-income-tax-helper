/* eslint-disable @typescript-eslint/no-explicit-any */
import Transaction from "./Transaction";

describe("Transaction", () => {
	const anything: any = undefined;

	it.each([
		[12, 19.45, 12 * 19.45],
		[64.46587313, 13.64597824, 64.46587313 * 13.64597824],
		[10, 0, 0],
	])("should correctly calculate transaction value (%p * %p = %p)", (quantity, price, value) => {
		const transaction = new Transaction(anything, anything, anything, quantity, price);
		expect(transaction.value).toBe(value);
	});

	it("should throw an error when transaction quantity is not positive", () => {
		expect(() => new Transaction(anything, anything, anything, 0, anything)).toThrow(
			"Transaction must have a postive quantity 0.",
		);
		expect(() => new Transaction(anything, anything, anything, -1, anything)).toThrow(
			"Transaction must have a postive quantity -1.",
		);
	});

	it("should throw an error when transaction price is negative", () => {
		expect(() => new Transaction(anything, anything, anything, anything, -1)).toThrow(
			"Transaction must not have negative price -1.",
		);
	});
});
