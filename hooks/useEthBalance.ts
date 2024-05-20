import { formatEther } from "viem";
import { useAccount, useBalance } from "wagmi";

export default function useEthBalance() {
	const { address } = useAccount();
	const result = useBalance({
		address,
	});

	return {
		balance: result.data ? formatEther(result.data.value, "wei") : "",
		isLoading: result.isLoading,
		status: result.status,
	};
}
