"use client";

import { GlobalContext } from "@/interfaces";
import React, { useState, useContext, createContext } from "react";
import useWalletActions from "@/hooks/useWalletActions";
import { useWatchTransaction } from "@/hooks/useTransaction";
import useGasPriceUpdater from "@/hooks/useGasPriceUpdater";

const AppContext = createContext<GlobalContext | null>(null);

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [isPageLoading, setIsPageLoading] = useState<boolean>(false);

	// updaters
	useWalletActions()
	useWatchTransaction()
	useGasPriceUpdater()

	return (
		<AppContext.Provider
			value={{
				isPageLoading,
				setIsPageLoading,
			}}
		>
			{children}
		</AppContext.Provider>
	);
};

export const useGlobalContext = () => {
	if (!AppContext)
		throw new Error("This hook should be called within an AppContext provider");
	return useContext(AppContext) as GlobalContext;
};

export { AppContext, AppProvider };
