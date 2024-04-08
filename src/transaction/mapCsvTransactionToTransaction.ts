import Transaction, { AssetType, TransactionType } from "./Transaction";

export interface CsvTransaction {
	data: string;
	operacao: string;
	classe: string;
	ticker: string;
	quantidade: string;
	preco: string;
	corretora: string;
}

export default function mapCsvTransactionToTransaction(csvOperation: CsvTransaction): Transaction {
	return new Transaction(
		new Date(csvOperation.data),
		getTransactionType(csvOperation.operacao),
		{
			code: csvOperation.ticker,
			type: getAssetType(csvOperation.classe),
		},
		Number(csvOperation.quantidade),
		Number(csvOperation.preco),
	);
}

function getTransactionType(value: string): TransactionType {
	switch (value) {
		case "compra":
			return TransactionType.Buy;
		case "venda":
			return TransactionType.Sell;
		default:
			throw new Error(`Unknown operation type ${value}.`);
	}
}

function getAssetType(value: string): AssetType {
	switch (value) {
		case "FII":
			return AssetType.Fii;
		case "ação":
			return AssetType.Stock;
		case "subscricao":
			return AssetType.Subscription;
		case "etfFixa":
			return AssetType.FixedIncomeEtf;
		case "etfVariavel":
			return AssetType.VariableIncomeEtf;
		default:
			throw new Error(`Unkwnown asset type ${value}.`);
	}
}
