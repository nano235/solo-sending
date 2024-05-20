import { createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import sepoliaList from "@/constants/tokenLists/sepolia.json";
import { Address } from "@/utils/web3Utils";

export interface Token {
	chainId: number;
	name: string;
	symbol: string;
	address: string;
	decimals: number;
	logoURI: string;
}

type StateActionPayload = {
	[K in keyof TokenState]: {
		name: K;
		value: TokenState[K];
	};
}[keyof TokenState];

type List = {
	readonly tokens: Token[];
	readonly isFetchingList: boolean;
	readonly error?: string;
	readonly loaded?: boolean;
};

export interface TokenState {
	list: List;
	blackList: string[];
	favourites: string[];
	activeList: Token[];
	selectedToken: Token | null;
}

const initialState: TokenState = {
	list: {
		tokens: sepoliaList.tokens,
		isFetchingList: false,
		error: "",
		loaded: false,
	},
	activeList: [],
	blackList: [],
	favourites: [],
	selectedToken: null,
};

const tokenSlice = createSlice({
	name: "tokens",
	initialState,
	reducers: {
		addTokens: (state, action: PayloadAction<Token>) => {
			state.list.tokens = [action.payload, ...state.list.tokens];
		},
		resetTokens: state => {
			state = initialState;
		},
		deleteToken: (state, action: PayloadAction<Address>) => {
			state.list.tokens = state.list.tokens.filter((s) => s.address.toLowerCase() !== action.payload.toLowerCase());
		},
		update: (state, action: PayloadAction<StateActionPayload>) => {
			const { name, value } = action.payload;
			state[name] = value as any;
		},
	},
});

export default tokenSlice.reducer;
export const { addTokens, resetTokens, deleteToken, update } = tokenSlice.actions;

export const getTokens = (tokenState: TokenState, url?: string): any => {
	return async (dispatch: any) => {
		const { list, blackList, favourites } = tokenState;
		dispatch(
			update({
				name: "list",
				value: {
					tokens: list.tokens,
					isFetchingList: true,
				},
			})
		);
		try {
			let tokensMap = new Map<string, Token>();
			list.tokens.forEach(token => tokensMap.set(token.address, token));

			if (url) {
				const externalTokens = await getTokenFromListUrl(url, dispatch, list);
				externalTokens.forEach(token => tokensMap.set(token.address, token));
			}

			blackList.forEach(address => tokensMap.delete(address));

			let tokens: Token[] = [];
			favourites.forEach(address => {
				const token = tokensMap.get(address);
				if (token) {
					tokens.push(token);
					tokensMap.delete(address);
				}
			});

			tokens = tokens.concat(Array.from(tokensMap.values()));
			dispatch(
				update({
					name: "list",
					value: {
						tokens,
						loaded: true,
						isFetchingList: false,
					},
				})
			);
		} catch (error: any) {
			dispatch(
				update({
					name: "list",
					value: {
						tokens: list.tokens,
						isFetchingList: false,
						error: error.message,
					},
				})
			);
		}
	};
};

async function getTokenFromListUrl(
	url: string,
	dispatch: Dispatch,
	list: TokenState["list"]
) {
	try {
		if (!url) return [];
		const res = await fetch(url);
		const result = await res.json();
		return result.tokens as Token[];
	} catch (error: any) {
		throw error;
	}
}
