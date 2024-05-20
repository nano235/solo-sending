"use client"
import { wagmiConfig } from "@/constants/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FC, ReactNode } from "react";
import { WagmiProvider as WagmiReactProvider } from "wagmi";

const queryClient = new QueryClient();

const WagmiProvider: FC<{ children: ReactNode }> = ({ children }) => {
	return (
		<WagmiReactProvider config={wagmiConfig}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</WagmiReactProvider>
	);
};

export default WagmiProvider;
