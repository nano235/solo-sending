import { parseGwei } from "viem";
import store from "@/store/configureStore";

export const GAS_PRICE_GWEI = {
	slow: parseGwei("10").toString(),
	fast: parseGwei("20").toString(),
	instant: parseGwei("40").toString(),
	market: "market",
};

export const estimateTransactionTime = (gasFee: string) => {
	try {
		const state = store?.getState();
		const gasLevels = state?.settings.gasLevels;
		const gasPrice = Number(gasFee);

		let time = 30;

		if (gasLevels) {
			if (gasPrice >= Number(gasLevels["instant"])) {
				time = 15; // Typically 1 block time for fast transactions
			}
		}

		return time;
	} catch (error) {
		return 30;
	}
};
