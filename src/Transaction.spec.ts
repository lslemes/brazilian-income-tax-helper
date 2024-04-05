/* eslint-disable @typescript-eslint/no-explicit-any */
import Transaction from "./Transaction";

describe("Transaction", () => {
	it("should correctly calculate transaction value", () => {
		const anything: any = undefined;
		const transaction = new Transaction(anything, anything, anything, 263, 64.17);
		expect(transaction.value).toBe(263 * 64.17);
	});
});
