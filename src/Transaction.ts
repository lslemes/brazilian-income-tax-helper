export default class Transaction {
	profit: number | null = null;

	constructor(
		readonly date: Date,
		readonly type: TransactionType,
		readonly asset: Asset,
		readonly quantity: number,
		readonly price: number,
	) {
		if (quantity <= 0) throw new Error(`Transaction must have a postive quantity ${quantity}.`);
		if (price < 0) throw new Error(`Transaction must not have negative price ${price}.`);
	}

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
