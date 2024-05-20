import { Token } from "@/store/slices/tokenSlice";

export const sepoliaEthToken = {
    chainId: 11155111,
	name: "Ethereum",
	symbol: "ETH",
	decimals: 18,
	address: "",
	logoURI: "/svgs/icon-eth.svg",
};

export const nativeTokens: { [chainId: number]: Token } = {
	11155111: sepoliaEthToken,
};
