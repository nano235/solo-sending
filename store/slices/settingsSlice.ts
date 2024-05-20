import { GAS_PRICE_GWEI } from "@/utils/gasPrice";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SettingsState {
	gasPrice: string | "market";
	marketGasPrice: string;
	selectedGasLevel: string;
	gasLevels: {
		slow: string;
		fast: string;
		market: string;
		instant: string;
	};
}

export const initialState: SettingsState = {
	gasPrice: "market",
	gasLevels: GAS_PRICE_GWEI,
	marketGasPrice: "",
	selectedGasLevel: 'market'
};

const settingsSlice = createSlice({
	name: "settings",
	initialState,
	reducers: {
		setGasPrice: (state, action: PayloadAction<SettingsState["gasPrice"]>) => {
			state.gasPrice = action.payload;
		},
		setGasLevels: (state, action: PayloadAction<SettingsState["gasLevels"]>) => {
			state.gasLevels = action.payload;
		},
		setSelectedGasLevel: (state, action: PayloadAction<SettingsState["selectedGasLevel"]>) => {
			state.selectedGasLevel = action.payload;
		},
		updateMarketGasPrice: (
			state,
			action: PayloadAction<SettingsState["marketGasPrice"]>
		) => {
			state.marketGasPrice = action.payload;
		},
		resetGasPrice: state => {
			state = initialState;
		},
	},
});

export default settingsSlice.reducer;
export const { setGasPrice, setGasLevels, setSelectedGasLevel, updateMarketGasPrice, resetGasPrice } = settingsSlice.actions;
