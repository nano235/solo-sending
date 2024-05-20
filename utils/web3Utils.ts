export const isValidEthereumAddress = (address?: string | Address) => {
	if (!address) return false;
	return /^0x[0-9a-fA-F]{40}$/.test(address);
};

import { wagmiConfig } from "@/constants/wagmi";
import { InterfaceAbi } from "ethers";
import { Contract } from "ethers";
import { JsonRpcSigner } from "ethers";
import { Interface } from "ethers";
import { BrowserProvider } from "ethers";
import {
	getContract,
	erc20Abi,
	ReplacementReturnType,
	Chain,
} from "viem";
import { estimateContractGas } from "viem/actions";
import { Config } from "wagmi";
import {
	estimateGas,
	getBalance,
	getClient,
	getConnectorClient,
	getGasPrice,
	getTransaction,
	getTransactionConfirmations,
	getTransactionCount,
	getTransactionReceipt,
	multicall,
	sendTransaction,
	waitForTransactionReceipt,
} from "wagmi/actions";
import { sepolia } from "wagmi/chains";

export type Address = `0x${string}`;

function isTupleType(type) {
	return type.startsWith("tuple");
}

function isArrayType(type) {
	return type.endsWith("[]");
}

export function clientToSigner(client: any) {
	const { account, chain, transport } = client;
	const network = {
		chainId: chain.id,
		name: chain.name,
		ensAddress: chain.contracts?.ensRegistry?.address,
	};
	const provider = new BrowserProvider(transport, network);
	const signer = new JsonRpcSigner(provider, account.address);
	return signer;
}

/** Action to convert a viem Wallet Client to an ethers.js Signer. */
export async function getEthersSigner(
	config: Config,
	{ chainId }: { chainId?: number } = {}
) {
	const client = await getConnectorClient(config, { chainId });
	return clientToSigner(client);
}

export function serializeError(err: any) {
	// Check if err is an object and has the expected properties
	if (typeof err === "object" && err !== null) {
		// Try to get the message from err.cause.data.args or err.shortMessage or err.message
		const message =
			err.cause?.data?.args?.join(",") ||
			err.shortMessage ||
			err.message ||
			err.errorMessage;

		// If message is a non-empty string, return it
		if (typeof message === "string" && message.trim() !== "") {
			let normalizedMessage = message.toLowerCase();

			if (
				normalizedMessage.includes("exceeds the balance of this account") ||
				normalizedMessage.includes("exceeds the balance of the account")
			) {
				return { message: "You don’t have enough ETH to cover gas fees" };
			}

			if (normalizedMessage.includes("insufficient funds")) {
				return { message: "Insufficient funds" };
			}

			if (normalizedMessage.includes("insufficient gas")) {
				return { message: "You don’t have enough ETH to cover gas fees" };
			}

			if (normalizedMessage.includes("insufficient allowance")) {
				return { message: "Please increase your allowance" };
			}

			return { message };
		}
	}

	return { message: err.message };
}

async function checkForWriteErrors(
	e: any,
	{ provider, contract, functionName, account, parameters, simulateParams }
) {
	console.log(e, "error x");

	if (JSON.stringify(e).includes("gas required exceeds allowanc")) {
		throw new Error("Not enough gas to cover gas fee");
	}

	const error = serializeError(e);
	if (error?.message?.includes("Execution reverted for an unknown reason")) {
		try {
			// check eth balance
			const gas = await provider?.estimateContractGas({
				address: contract.address,
				abi: contract.abi,
				functionName,
				account,
				args: parameters[0] || [],
			});

			const gasPrice = await provider.getGasPrice();
			const txFee = (Number(gasPrice) * Number(gas)) / 10 ** 18;
			const balance = await provider.getBalance({
				address: account,
			});
			let value = simulateParams?.[1]?.value
				? simulateParams?.[1]?.value
				: parameters.length === 0
				? simulateParams?.[0]?.value
				: 0;
			value = Number(value) / 10 ** 18;
			const gasFeeDifference = txFee + value - Number(balance) / 10 ** 18;
			if (txFee + value > Number(balance) / 10 ** 18) {
				throw new Error(
					`Not enough ETH to cover gas and keeper fees. You need additional ${gasFeeDifference.toFixed(
						8
					)} ETH`
				);
			}
		} catch (error) {
			if (JSON.stringify(e).includes("gas required exceeds allowanc")) {
				throw new Error("Not enough gas to cover gas fee");
			}
			throw error;
		}
	}

	throw e;
}

export function convertArrayToObject(outputs, array) {
	if (typeof array !== "object") return array;
	if (!Array.isArray(array)) return array;
	const obj = {};
	outputs.forEach((output, index) => {
		if (isArrayType(output.type)) {
			// For arrays (including arrays of tuples), recursively process each array element
			obj[output.name] = array[index].map(arrElement => {
				// Check if the array element should be a tuple or a simple type
				if (isTupleType(output.type) && Array.isArray(arrElement)) {
					return convertArrayToObject(output.components, arrElement);
				}
				return arrElement;
			});
		} else if (isTupleType(output.type)) {
			// For single tuples, recursively process the tuple
			obj[output.name] = convertArrayToObject(output.components, array[index]);
		} else {
			obj[output.name] =
				typeof array[index] != "undefined" ? array[index] : array[output.name];
		}
	});

	return obj;
}

// Add 10%
export function calculateGasMargin(value: bigint, percent: number = 10) {
	return value + (value / BigInt(percent))
}

export type Transaction = {
	to: Address;
} & Partial<{
	from: Address;
	value: bigint;
	nonce: number;
	gasLimit: bigint;
	maxFeePerGas: bigint;
	maxPriorityFeePerGas: bigint;
}>;

class ContractUtils {
	private contracts: any = {};
	private signer: any = null;
	private network: string = "";
	private publicClient: any = null;

	constructor() {
		this.publicClient = getClient(wagmiConfig);
	}

	addSigner(signer: any) {
		this.signer = signer;
		return signer;
	}

	setNetwork(chain: any) {
		if (chain?.unsupported) {
			return;
		}
		if (this.network !== chain.network) {
			this.network = chain.network;
		}
	}

  getSigner(){
    return this.signer
  }

	setDefaultNetwork() {
		this.setNetwork(sepolia);
	}

	async getBalance(address: Address) {
		return (await getBalance(wagmiConfig, { address })).value;
	}

	async estimateGas(txData: Transaction) {
		return await estimateGas(wagmiConfig, txData);
	}

	async getGasPrice() {
		const price = await getGasPrice(wagmiConfig);
		return price;
	}

	async sendTransaction(txData: Transaction) {
		return await sendTransaction(wagmiConfig, txData);
	}

	async getContract(address: Address, abi: any[]) {
		if (!this.network) this.setDefaultNetwork();

		if (!this.contracts.hasOwnProperty(address)) {
			const _contract = getContract({
				address,
				abi,
				client: this.publicClient,
			});

			this.contracts[address] = _contract as typeof _contract;

			// Modifying viem method to make it compatible
			// with ethers code
			// ---------------------------------------------
			this.contracts[address]._read = this.contracts[address].read;
			this.contracts[address]._write = this.contracts[address].write;

			this.contracts[address].readRaw = this.contracts[address]._read;

			const contract = this.contracts[address];

			this.contracts[address].read = new Proxy(
				{},
				{
					get(_, functionName) {
						return async (...parameters: any[]) => {
							const data = await contract._read[functionName](
								...parameters
							);

							const abiItem = abi.find(({ name }) => name === functionName);
							return convertArrayToObject(abiItem.outputs, data);
						};
					},
				}
			);
		}
		return this.contracts[address];
	}

  async getContractWithEthersSigner(address: Address, abi: Interface | InterfaceAbi){
    const signer = await getEthersSigner(wagmiConfig);
    if(!signer) throw Error(
      "Signer not valid. Did you forget to connect wallet? Try refreshing the app and try again"
    );
		this.contracts[address] = new Contract(address, abi, signer) as Contract;
    return this.contracts[address] as Contract
  }

	async getContractWithSigner(address: Address, abi: any[]) {
		if (!this.signer)
			throw Error(
				"Signer not valid. Did you forget to connect wallet? Try refreshing the app and try again"
			);
		this.contracts[address] = getContract({
			address,
			abi,
			client: { public: this.publicClient, wallet: this.signer },
		});

		// Modifying viem method to make it compatible
		// with ethers code
		// ---------------------------------------------
		this.contracts[address]._read = this.contracts[address].read;
		this.contracts[address]._write = this.contracts[address].write;
		const contract = this.contracts[address];
		const provider = this.publicClient;
		const signer = this.signer;

		this.contracts[address].read = new Proxy(
			{},
			{
				get(_, functionName) {
					return async (...parameters: any[]) => {
						const data = await contract._read[functionName](...parameters);
						const abiItem = abi.find(({ name }) => name === functionName);
						return convertArrayToObject(abiItem.outputs, data);
					};
				},
			}
		);

		this.contracts[address].write = new Proxy(
			{},
			{
				get(_, functionName) {
					return async (...parameters) => {
						const from = await signer.account?.address;
						const paramIndex = parameters.length ? 1 : 0;
						parameters[paramIndex] = {
							...parameters[paramIndex],
							account: from,
						};

						let simulateParams = [...parameters];

						try {
							await contract.simulate[functionName](...simulateParams);
						} catch (e) {
							return await checkForWriteErrors(e, {
								provider,
								contract,
								functionName,
								account: from,
								parameters,
								simulateParams,
							});
						}

						let hash: string;
						try {
							hash = await contract._write[functionName](...parameters);
						} catch (e) {
							return await checkForWriteErrors(e, {
								provider,
								contract,
								functionName,
								account: from,
								parameters,
								simulateParams,
							});
						}

						return {
							wait: async () =>
								provider.waitForTransactionReceipt({ hash }),
							hash,
						};
					};
				},
			}
		);
		return this.contracts[address];
	}

	async getErc20Contract(address: Address) {
		return this.getContractWithSigner(address, erc20Abi as any);
	}

	async estimateErc20ContractGas(tx: {
		address: Address;
		functionName: string;
		args: any[];
	}) {
		return await this.estimateContractGas({ ...tx, abi: erc20Abi as any });
	}

	async estimateContractGas(tx: {
		address: Address;
		abi: any[];
		functionName: string;
		args: any[];
	}) {
		if (!this.signer)
			throw Error(
				"Signer not valid. Did you forget to connect wallet? Try refreshing the app and try again"
			);
		const account = await this.signer.account?.address;
		return await estimateContractGas(this.publicClient, {
			...tx,
			account,
		});
	}

	async getTransaction(hash: Address) {
		return getTransaction(wagmiConfig, {
			hash,
		});
	}

	async waitForTransactionReceipt(
		hash: Address,
		onReplaced?: (response: ReplacementReturnType<Chain | undefined>) => void
	) {
		return waitForTransactionReceipt(wagmiConfig, {
			hash,
			onReplaced,
		});
	}

	async getTransactionReceipt(hash: Address) {
		return getTransactionReceipt(wagmiConfig, {
			hash,
		});
	}

	async getTransactionConfirmations(hash: Address) {
		return getTransactionConfirmations(wagmiConfig, {
			hash,
		});
	}

	async getNonce(address: Address) {
		return getTransactionCount(wagmiConfig, {
			address,
		});
	}

	async multicall(
		contracts: {
			address: Address;
			abi: any[];
			functionName: string;
			args: any[];
		}[]
	) {
		const results = (await multicall(wagmiConfig, {
			contracts,
		})) as (
			| {
					error: Error;
					result?: undefined;
					status: "failure";
			  }
			| {
					error?: undefined;
					result: any;
					status: "success";
			  }
		)[];

		results.forEach((result, index) => {
			if (result.status == "success") {
				const abiItem = contracts[index].abi.find(
					({ name }) => name === contracts[index].functionName
				);
				results[index].result = convertArrayToObject(
					abiItem.outputs,
					result.result
				);
			}
		});

		return results;
	}
}

export const contractUtils = new ContractUtils();
