import { useAppSelector } from "@/store/configureStore";
import { useMemo } from "react";

export default function useGasPrice() {
	const settingsState = useAppSelector(s => s.settings);
	const gasPrice = settingsState.gasPrice

	return useMemo(
		() => ({
			userGasPrice: settingsState.gasPrice === "market" ? settingsState.marketGasPrice : gasPrice,
			gasPrice: settingsState.marketGasPrice,
		}),
		[settingsState.gasPrice, settingsState.marketGasPrice]
	);
}
