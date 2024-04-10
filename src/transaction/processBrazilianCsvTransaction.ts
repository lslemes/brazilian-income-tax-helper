import { AssetType } from "../asset/Asset";
import { BrazilianBuyTransaction } from "./tradeTransaction/buyTransaction/brazilianBuyTransaction/BrazilianBuyTransaction";
import { BrazilianSellTransaction } from "./tradeTransaction/sellTransaction/brazilianSellTransaction/BrazilianSellTransaction";

export interface BrazilianCsvTransaction {
	data: string;
	operacao: string;
	classe: string;
	ticker: string;
	quantidade: string;
	preco: string;
	corretora: string;
}

export default function processBrazilianCsvTransaction(
	transaction: BrazilianCsvTransaction,
): BrazilianBuyTransaction | BrazilianSellTransaction {
	switch (transaction.operacao) {
		case "compra":
			return getNationalBuyTransaction(transaction);
		case "venda":
			return getNationalSellTransaction(transaction);
		default:
			throw new Error(`Unknown transaction type ${transaction.operacao}.`);
	}
}

function getNationalBuyTransaction(transaction: BrazilianCsvTransaction): BrazilianBuyTransaction {
	return new BrazilianBuyTransaction(
		new Date(transaction.data),
		{
			code: transaction.ticker,
			type: getAssetType(transaction.classe),
		},
		Number(transaction.preco),
		Number(transaction.quantidade),
	);
}

function getNationalSellTransaction(transaction: BrazilianCsvTransaction): BrazilianSellTransaction {
	return new BrazilianSellTransaction(
		new Date(transaction.data),
		{
			code: transaction.ticker,
			type: getAssetType(transaction.classe),
		},
		Number(transaction.preco),
		Number(transaction.quantidade),
	);
}

function getAssetType(value: string): AssetType {
	switch (value) {
		case "FII":
			return AssetType.BrazilianFii;
		case "ação":
			return AssetType.BrazilianStock;
		case "subscricao":
			return AssetType.BrazilianSubscription;
		case "etfFixa":
			return AssetType.BrazilianFixedIncomeEtf;
		case "etfVariavel":
			return AssetType.BrazilianVariableIncomeEtf;
		default:
			throw new Error(`Unkwnown asset type ${value}.`);
	}
}
