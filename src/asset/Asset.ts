export default interface Asset {
	type: AssetType;
	code: string;
}

export enum AssetType {
	BrazilianFii,
	BrazilianStock,
	BrazilianFixedIncomeEtf,
	BrazilianVariableIncomeEtf,
	BrazilianSubscription,
	AmericanAsset,
	Cryptocurrency,
}
