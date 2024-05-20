import { Token } from "@/store/slices/tokenSlice";
import { Address, contractUtils, serializeError } from "@/utils/web3Utils";
import { erc20Abi, parseGwei, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useTransaction } from "./useTransaction";
import { TransactionStatus } from "@/interfaces";
import useGasPrice from "./useGasPrice";
import { estimateTransactionTime } from "@/utils/gasPrice";

export default function useTokenTransfer() {
	const { address } = useAccount();
	const { addTransaction } = useTransaction();
	const { userGasPrice } = useGasPrice();

	const transferEth = async (to: Address, value: bigint, nonce: number) => {
		try {
			const tx = {
				to,
				value,
			};
			const balance = await contractUtils.getBalance(address!);
			const gasLimit = await contractUtils.estimateGas(tx);
			const maxFeePerGas = BigInt(userGasPrice);
			const maxPriorityFeePerGas = parseGwei("1");

			const totalFee = gasLimit * maxFeePerGas + maxPriorityFeePerGas + value;
			if (balance < totalFee) throw "Insufficient funds";

			const hash = await contractUtils.sendTransaction({
				...tx,
				gasLimit,
				maxFeePerGas,
				maxPriorityFeePerGas,
			});
			return {
				to,
				hash,
				nonce,
				value: tx.value.toString(),
				gasLimit: gasLimit.toString(),
				maxFeePerGas: maxFeePerGas.toString(),
				maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
			};
		} catch (error) {
			throw error;
		}
	};

	async function transferERC20(
		address: Address,
		from: Address,
		to: Address,
		value: bigint,
		nonce?: number
	) {
		try {
			const contract = await contractUtils.getContractWithEthersSigner(
				address,
				erc20Abi
			);

			const balance = await contractUtils.getBalance(from);
			const tokenBalance = await contract.balanceOf(from);

			const gasLimit = await contract.transfer.estimateGas(to, value, { from });
			const maxFeePerGas = BigInt(userGasPrice);
			const maxPriorityFeePerGas = parseGwei("1");

			const totalCost = gasLimit * maxFeePerGas + maxPriorityFeePerGas;

			if (balance < totalCost) throw "Insufficient funds for gas fee";
			if (BigInt(tokenBalance) < value)
				throw "ERC20 token balance is not enough for transfer";

			const tx = {
				to: address,
				nonce,
				data: contract.interface.encodeFunctionData("transfer", [to, value]),
				gasLimit,
				maxFeePerGas,
				maxPriorityFeePerGas: parseGwei("1"),
			};

			// Send the transaction
			const hash = await contractUtils.sendTransaction(tx);

			return {
				hash,
				to,
				nonce,
				gasLimit: gasLimit.toString(),
				maxFeePerGas: tx.maxFeePerGas.toString(),
				maxPriorityFeePerGas: tx.maxPriorityFeePerGas.toString(),
				value: "0",
			};
		} catch (error) {
			throw error;
		}
	}

	const transfer = async ({
		token,
		amount,
		to,
	}: {
		token: Token;
		amount: string;
		to: Address;
	}) => {
		try {
			if (!address) throw "Account not found! Are you connected to your wallet?";
			const isNative = token.address === "";
			const value = parseUnits(amount, token.decimals);
			let tx: {
				to: Address;
				hash: Address;
				value: string;
				gasLimit: string;
				maxFeePerGas: string;
				maxPriorityFeePerGas: string;
			};
			const nonce = await contractUtils.getNonce(address);
			if (isNative) {
				tx = await transferEth(to, value, nonce);
			} else {
				tx = await transferERC20(
					token.address as Address,
					address,
					to,
					value,
					nonce
				);
			}

			addTransaction({
				...tx,
				tokenAmount: !isNative ? value.toString() : "",
				from: address,
				nonce,
				token,
				status: TransactionStatus.PENDING,
				submittedAt: Date.now(),
                estimatedTime: estimateTransactionTime(userGasPrice)
			});
			return tx.hash;
		} catch (error) {
			throw serializeError(error).message;
		}
	};

	return { transfer };
}
