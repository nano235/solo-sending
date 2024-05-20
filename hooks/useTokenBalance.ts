import { useAccount, useReadContract } from "wagmi";
import erc20Abi from "@/constants/abi/erc20.json";
import { formatUnits } from "viem";
import { Token } from "@/store/slices/tokenSlice";
import { Address } from "@/utils/web3Utils";

export const useTokenBalance = (token: Token | null) => {
	const { address } = useAccount();
	const {
		data: balance,
		isLoading,
		refetch,
	} = useReadContract({
		address: token ? (token.address as Address) : undefined,
		abi: erc20Abi,
		functionName: "balanceOf",
		args: [address],
	});

	return {
		balance: typeof balance !== 'undefined' && token ? formatUnits(balance as bigint, token.decimals) : "",
		isLoading,
		refetch,
	};
};
