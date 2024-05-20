import { Token } from "@/store/slices/tokenSlice";
import { Address } from "@/utils/web3Utils";

export interface NavLink {
	label: string;
	href: string;
}

export interface Wallet {
	label: string;
	icon: string;
	connectorName: string;
}

export enum TransactionStatus {
	IDLE = "idle",
	PENDING = "pending",
	SUCCESS = "success",
	FAILED = "failed",
	SPEED = "speed",
}

export interface TransactionDetails {
	hash: string;
	value: string;
	tokenAmount?: string;
	to: string;
	from: string;
	gasLimit: string;
	maxFeePerGas: string;
	maxPriorityFeePerGas: string;
	status: TransactionStatus;
	description?: string;
	token: Token;
	receipt?: TransactionReceipt;
	lastCheckedBlockNumber?: number;
	submittedAt: number;
	confirmedTime?: number;
	nonce?: number;
	estimatedTime?: number;
	oldHash?: string
}

export interface TransactionReceipt {
	blockHash: string;
	blockNumber: bigint;
	chainId: number;
	contractAddress?: Address | null;
	cumulativeGasUsed: bigint;
	effectiveGasPrice: bigint;
	from: Address;
	gasUsed: bigint;
	logs: any[];
	logsBloom: string;
	status: "success" | "reverted";
	to: Address | null;
	transactionHash: string;
	transactionIndex: number;
	type: string;
}

export interface GlobalContext {
	isPageLoading: boolean;
	setIsPageLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
