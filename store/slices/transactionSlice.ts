import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TransactionDetails } from "@/interfaces";

export interface TransactionState {
	transactions: { [txHash: string]: TransactionDetails };
	selectedTxHash: string;
}

export const initialState: TransactionState = {
	transactions: {},
	selectedTxHash: "",
};

type UpdateTransaction = {
	oldHash: string;
	transaction: Partial<TransactionDetails>;
};

const transactionSlice = createSlice({
	name: "transaction",
	initialState,
	reducers: {
		addTransaction: (state, action: PayloadAction<TransactionDetails>) => {
			const txs = Object.assign(
				{},
				{ [action.payload.hash]: action.payload, ...state.transactions }
			);
			state.transactions = txs;
		},
		setSelectedTxHash: (
			state,
			action: PayloadAction<TransactionState["selectedTxHash"]>
		) => {
			state.selectedTxHash = action.payload;
		},
		updateTransaction: (
			state,
			action: PayloadAction<Partial<TransactionDetails>>
		) => {
			const txHash = action.payload.hash!;
			if (!state.transactions[txHash]) {
				const transaction = Object.values(state.transactions).find(
					transaction => transaction.oldHash === action.payload.hash
				);
				if (transaction) {
					const newHash = action.payload.hash!;
					const oldHash = transaction.hash!;
					const tx = state.transactions[oldHash];
					state.transactions[newHash] = {
						...tx,
						...transaction,
						oldHash,
					};
					const newTxState = state.transactions;
					delete newTxState[oldHash];
				}
			} else {
				state.transactions[txHash] = {
					...state.transactions[txHash],
					...action.payload,
				};
			}
		},
		updateTransactionByHash: (state, action: PayloadAction<UpdateTransaction>) => {
			const transaction = action.payload.transaction;
			const oldHash = action.payload.oldHash;
			const newHash = transaction.hash!;
			if (oldHash && state.transactions.hasOwnProperty(oldHash)) {
				const tx = state.transactions[oldHash];

				state.transactions[newHash] = {
					...tx,
					...transaction,
					oldHash,
				};
				const newTxState = state.transactions;
				delete newTxState[oldHash];
				state.transactions = newTxState;
			} else {
				state.transactions[newHash] = {
					...state.transactions[newHash],
					...action.payload,
				};
			}
		},
		clearTransaction: state => {
			state = initialState;
		},
	},
});

export default transactionSlice.reducer;
export const {
	addTransaction,
	setSelectedTxHash,
	updateTransaction,
	updateTransactionByHash,
	clearTransaction,
} = transactionSlice.actions;
