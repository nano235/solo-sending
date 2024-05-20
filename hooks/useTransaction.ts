import { useCallback, useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import { useAppDispatch, useAppSelector } from "@/store/configureStore";
import { TransactionDetails, TransactionReceipt, TransactionStatus } from "@/interfaces";
import {
	addTransaction,
	setSelectedTxHash,
	updateTransaction,
	updateTransactionByHash,
} from "@/store/slices/transactionSlice";
import {
	Address,
	calculateGasMargin,
	contractUtils,
	serializeError,
} from "@/utils/web3Utils";
import { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { parseGwei } from "viem";

type TransactionAdder = {
	addTransaction: (transaction: TransactionDetails) => void;
	updateTransaction: (transaction: TransactionDetails) => void;
};

export function useTransaction(): TransactionAdder {
	const { address } = useAccount();
	const dispatch = useAppDispatch();

	const _addTransaction = useCallback(
		(transaction: TransactionDetails) => {
			const hash = transaction.hash;
			if (!address) return;
			if (!hash) {
				throw Error("No transaction hash found.");
			}
			dispatch(addTransaction(transaction));
		},
		[dispatch, address]
	);

	const _updateTransaction = useCallback(
		(transaction: TransactionDetails) => {
			const hash = transaction.hash;
			if (!address) return;
			if (!hash) {
				throw Error("No transaction hash found.");
			}
			dispatch(updateTransaction(transaction));
		},
		[dispatch, address]
	);

	return {
		addTransaction: _addTransaction,
		updateTransaction: _updateTransaction,
	};
}

export function useAllTransactions(): TransactionDetails[] {
	const { address } = useAccount();
	const state = useAppSelector(s => s.transaction);

	return useMemo(() => {
		if (!address) return [];
		const txs = Object.values(state.transactions);
		return txs.sort(newTransactionsFirst);
	}, [address, state]);
}

export function useIsTransactionPending(transactionHash?: string): boolean {
	const transactions = useAppSelector(s => s.transaction.transactions);
	if (!transactionHash || !transactions[transactionHash]) return false;
	return transactions[transactionHash]?.status === TransactionStatus.PENDING;
}

export function isTransactionRecent(tx: TransactionDetails): boolean {
	return new Date().getTime() - tx.submittedAt < 86_400_000;
}

function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
	return b.submittedAt - a.submittedAt;
}

export function usePendingTransactions(): {
	hasPendingTransactions: boolean;
	pendingNumber: number;
	pendingTransactions: string[];
} {
	const allTransactions = useAllTransactions();
	const pendingTransactions = allTransactions
		.filter(tx => tx.status === TransactionStatus.PENDING)
		.map(tx => tx.hash);
	const hasPendingTransactions = !!pendingTransactions.length;

	return {
		hasPendingTransactions,
		pendingNumber: pendingTransactions.length,
		pendingTransactions,
	};
}

export function useWatchTransaction() {
	const allTransactions = useAppSelector(s => s.transaction.transactions);
	const { pendingTransactions } = usePendingTransactions();
	const dispatch = useAppDispatch();

	useEffect(() => {
		Promise.all(
			pendingTransactions.map(hash => checkTransactionReceipt(hash, dispatch))
		);
	}, [dispatch, allTransactions, pendingTransactions]);
}

export function useSpeedUpTransaction() {
	const dispatch = useAppDispatch();
	const allTransactions = useAppSelector(s => s.transaction.transactions);
	return useCallback(
		async (hash: string, newGasPrice: bigint) => {
			const tx = allTransactions[hash];
			const newTx = {
				to: tx.to as Address,
				from: tx.from as Address,
				value: BigInt(tx.value),
				nonce: tx.nonce,
				gasLimit: calculateGasMargin(BigInt(tx.gasLimit)),
				maxFeePerGas: newGasPrice,
				maxPriorityFeePerGas: parseGwei("2"),
			};

			try {
				const newHash = await contractUtils.sendTransaction(newTx);
				const { hash: oldHash, ...payload } = tx;
				dispatch(
					updateTransactionByHash({
						oldHash,
						transaction: {
							hash: newHash,
							...payload,
							gasLimit: newTx.gasLimit.toString(),
							maxFeePerGas: newTx.maxFeePerGas.toString(),
							maxPriorityFeePerGas: newTx.maxPriorityFeePerGas.toString(),
						},
					})
				);
				dispatch(setSelectedTxHash(newHash));
			} catch (error) {
				const serializedError = serializeError(error);
				throw serializedError.message;
			}
		},
		[allTransactions, dispatch]
	);
}

async function checkTransactionReceipt(hash: string, dispatch: Dispatch<UnknownAction>) {
	try {
		const receipt = await contractUtils.waitForTransactionReceipt(hash as Address);
		const status =
			receipt.status === "success"
				? TransactionStatus.SUCCESS
				: TransactionStatus.FAILED;
		dispatch(
			updateTransaction({
				hash,
				receipt: deepConvertBigIntToString<TransactionReceipt>(receipt),
				status,
			})
		);
	} catch (error) {
		console.log(error, "error waiting trx");
	}
}

function deepConvertBigIntToString<T>(data: T | T[]) {
	if (data && typeof data === "object" && !Array.isArray(data)) {
		// loop through the object keys recursively and get the types
		Object.keys(data).forEach(t => {
			if (typeof data[t] === "bigint") data[t] = BigInt(data[t]).toString();
			if (typeof data[t] === "object") deepConvertBigIntToString(data[t]);
		});
		return data;
	}

	if (Array.isArray(data)) {
		return data.map(a => deepConvertBigIntToString(a));
	}

	return data;
}
