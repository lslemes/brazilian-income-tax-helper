import Asset from "../asset/Asset";

export abstract class Transaction {
	constructor(
		readonly date: Date,
		readonly asset: Asset,
	) {}
}
