import { useAppSelector } from "@/store/configureStore";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import erc20Abi from "@/constants/abi/erc20.json";
import { multicall } from "wagmi/actions";
import { wagmiConfig } from "@/constants/wagmi";
import { formatUnits } from "viem";
import { contractUtils } from "@/utils/web3Utils";

export type TokenWithBalance = Map<string, string>

export const useTokenBalances = () => {
	const chainId = useChainId();
	const { address } = useAccount();
	const tokenState = useAppSelector(state => state.tokens);
	const [tokenWithBalances, setTokenWithBalances] = useState<TokenWithBalance>();
	const [isLoading, setIsLoading] = useState(false);

	const { tokens, loaded } = useMemo(() => tokenState.list, [tokenState]);

	useEffect(() => {
		const fetchUserBalances = async () => {
			try {
				setIsLoading(true);
				const tokenBalanceResult = await contractUtils.multicall(multicallArgs);
				const balances = new Map<string, string>()

				filteredTokensByChainId.forEach((token, index) => {
					balances.set(token.address, typeof tokenBalanceResult[index].result !== 'undefined'
					? formatUnits(
							tokenBalanceResult[index].result as bigint,
							token.decimals
					  )
					: "-")
				});

				setTokenWithBalances(balances);
			} catch (error) {
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		};

		if (tokens.length > 0 && loaded) {
			fetchUserBalances();
		}
	}, [tokens, loaded, chainId, address]);

	const filteredTokensByChainId = useMemo(
		() => tokens.filter(t => t.chainId === chainId),
		[tokens, chainId]
	);

	const multicallArgs = useMemo(
		() =>
			filteredTokensByChainId.map(t => ({
				abi: erc20Abi,
				address: t.address,
				functionName: "balanceOf",
				args: [address],
			})),
		[filteredTokensByChainId, address]
	) as {
		abi: any;
		address: `0x${string}`;
		functionName: string;
		args: any[];
	}[];

	return {
        balances: tokenWithBalances,
		isLoading,
	};
};
