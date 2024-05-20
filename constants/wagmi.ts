import { createConfig, createStorage, http, noopStorage } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const wagmiConfig = createConfig({
	chains: [sepolia],
	connectors: [injected()],
	transports: {
		[sepolia.id]: http(),
	},
	storage: createStorage({
		storage:
			typeof window !== "undefined" && window.localStorage
				? window.localStorage
				: noopStorage,
	}),
	ssr: true
});
