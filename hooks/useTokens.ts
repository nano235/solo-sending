import { nativeTokens } from "@/constants";
import { CHAIND_ID } from "@/constants/blockchain";
import { useAppSelector } from "@/store/configureStore";
import { Token, getTokens } from "@/store/slices/tokenSlice";
import {
	Address,
	contractUtils,
	isValidEthereumAddress,
} from "@/utils/web3Utils";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import erc20Abi from "@/constants/abi/erc20.json";
import { useAccount, useChainId } from "wagmi";
import { formatNum } from "@/utils";
import { formatUnits } from "viem";

export type TokenWithBalance = Token & { balance: string };

export const useTokens = () => {
	const dispatch = useDispatch();
	const chainId = useChainId();
	const tokenState = useAppSelector(state => state.tokens);
	const { tokens, loaded, isFetchingList } = useMemo(
		() => tokenState.list,
		[tokenState]
	);

	useEffect(() => {
		if (!loaded) {
			dispatch(getTokens(tokenState));
		}
	}, [dispatch, loaded]);

	const nativeCurrency = useMemo(() => nativeTokens[chainId ?? CHAIND_ID], [chainId]);

	return {
		tokens,
		nativeCurrency,
		isLoading: !loaded || isFetchingList,
	};
};

export const useImportToken = (tokenAddress: string) => {
	const [token, setToken] = useState<Token | null>(null);
	const [balance, setBalance] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { address } = useAccount();
	const chainId = useChainId();

	useEffect(() => {
		const fetchToken = async () => {
			try {
				setIsLoading(true);
				if (!isValidEthereumAddress(tokenAddress)) return;
				const [name, symbol, decimals, _balance] = await contractUtils.multicall(
					getTokenMulticallArgs(tokenAddress as Address, address)
				);

				if (
					name.status === "success" &&
					symbol.status === "success" &&
					decimals.status === "success"
				) {
					setToken({
						address: tokenAddress,
						chainId,
						name: name.result!,
						symbol: symbol.result!,
						decimals: decimals.result!,
						logoURI: "",
					});

					if (_balance && decimals.result) {
						setBalance(
							_balance.status === "success"
								? formatNum(
										formatUnits(_balance.result, decimals.result),
										true,
										6
								  ).toString()
								: ""
						);
					}
				}
			} catch (error) {
			} finally {
				setIsLoading(false);
			}
		};

		fetchToken();
	}, [tokenAddress]);

	return {
		token,
		balance,
        isLoading
	};
};

function getTokenMulticallArgs(tokenAddress: Address, account?: Address) {
	const prepareArgs = [
		{ functionName: "name", args: [] },
		{ functionName: "symbol", args: [] },
		{ functionName: "decimals", args: [] },
		account ? { functionName: "balanceOf", args: [account] } : undefined,
	].filter(a => typeof a !== "undefined") as any[];

	return prepareArgs.map(({ functionName, args }) => ({
		address: tokenAddress,
		abi: erc20Abi,
		functionName,
		args: args,
	})) as {
		abi: any;
		address: `0x${string}`;
		functionName: string;
		args: any[];
	}[];
}
