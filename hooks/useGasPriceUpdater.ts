import { useAppDispatch, useAppSelector } from "@/store/configureStore";
import { setGasLevels, setGasPrice, updateMarketGasPrice } from "@/store/slices/settingsSlice";
import { calculateGasMargin, contractUtils } from "@/utils/web3Utils";
import { useEffect, useRef } from "react";
import { useChainId } from "wagmi";

const pollingInterval = 3_000

export default function useGasPriceUpdater() {
	const chainId = useChainId();
	const dispatch = useAppDispatch();
    const selectedGasLevel = useAppSelector(s => s.settings.selectedGasLevel)
	const interval = useRef<NodeJS.Timeout>();

	useEffect(() => {
		const getGasPrice = async () => {
			try {
				const price = await contractUtils.getGasPrice();
                const levels = await getGasLevels()
                const market = Math.max(Number(price), Number(levels.market)).toString()
				dispatch(updateMarketGasPrice(market));
                dispatch(setGasLevels(levels))
                if(selectedGasLevel && levels[selectedGasLevel]){
                    dispatch(setGasPrice(levels[selectedGasLevel]))
                }
			} catch (error) {}
		};

		getGasPrice();
		clearInterval(interval.current);
		interval.current = setInterval(getGasPrice, pollingInterval);
		return () => {
			clearInterval(interval.current);
		};
	}, [chainId, selectedGasLevel]);
}

async function getGasLevels() {
    try {
        // [TODO]: Should account for chainId to fetch data for current network.
        const url = "/api/gastracker/gasnow/data"
		const data = await fetch(url).then(res => res.json());
        const speeds = data.data

        const adjustedFast = speeds.fast <= speeds.slow ? Math.min(Number(calculateGasMargin(BigInt(speeds.fast), 3)), speeds.rapid): speeds.fast
        const adjustedInstant = speeds.rapid <= adjustedFast ? Number(calculateGasMargin(BigInt(adjustedFast), 3)) : speeds.rapid
        return {
            slow: speeds.slow,
            fast: adjustedFast,
            instant: adjustedInstant,
            market: speeds.standard
        }
	} catch (error) {
        console.log('Error fetching gasPrice');
        throw error
    }
}

async function getGasPricesFromOwlracle(chainId: number) {
    try {
        const url = `https://api.owlracle.info/v4/${chainId}/gas?apikey=${process.env.NEXT_PUBLIC_OWLRACLE_API_KEY}&reportwei=true`;
        const data = await fetch(url).then(res => res.json());
        const speeds = data.speeds
        return {
            slow: speeds[0].maxFeePerGas,
            fast: speeds[2].maxFeePerGas,
            instant: speeds[3].maxFeePerGas,
            market: speeds[1].maxFeePerGas //standard
        }
    } catch (error) {
        console.log('Error fetching gasPrice');
    }
}