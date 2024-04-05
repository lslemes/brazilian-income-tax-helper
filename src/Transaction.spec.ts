/* eslint-disable @typescript-eslint/no-explicit-any */
import Transaction from "./Transaction";

describe("Transaction", () => {
	it.each([
		[12, 19.45, 12 * 19.45],
		[0, 10, 0],
		[10, 0, 0],
		[0, 0, 0],
		[6486, 13.14, 6486 * 13.14],
	])("should correctly calculate transaction value", (quantity, price, value) => {
		const anything: any = undefined;
		const transaction = new Transaction(anything, anything, anything, quantity, price);
		expect(transaction.value).toBe(value);
	});
});
