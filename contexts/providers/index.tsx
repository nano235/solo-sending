"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { PreLoader } from "@/shared";
import WagmiProvider from "./WagmiProvider";
import store, { persistor } from "@/store/configureStore";
import { AppProvider } from "../AppContext";

export default function Providers({ children }: { children: ReactNode }) {
	return (
		<>
			<Provider store={store!}>
				<WagmiProvider>
					<AppProvider>
						<PersistGate loading={<PreLoader />} persistor={persistor}>
							{children}
						</PersistGate>
					</AppProvider>
				</WagmiProvider>
			</Provider>
		</>
	);
}
