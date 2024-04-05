export default class Transaction {
	profit: number | null = null;

	constructor(
		readonly date: Date,
		readonly type: TransactionType,
		readonly asset: Asset,
		readonly quantity: number,
		readonly price: number,
	) {}

	get value(): number {
		return this.price * this.quantity;
	}
}

export enum TransactionType {
	Buy,
	Sell,
}

interface Asset {
	type: AssetType;
	code: string;
}

export enum AssetType {
	Fii,
	Stock,
	Etf,
	Subscription,
}
