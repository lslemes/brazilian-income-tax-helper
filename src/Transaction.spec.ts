import Transaction, { AssetType, TransactionType } from "./Transaction";

describe("Transaction", () => {
	it("should correctly calculate transaction value", () => {
		const a = new Transaction(new Date(), TransactionType.Buy, { code: "", type: AssetType.Etf }, 400, 300);
	});
});
