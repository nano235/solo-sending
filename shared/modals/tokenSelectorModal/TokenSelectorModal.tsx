"use client";

import React, { useCallback, useMemo, useState } from "react";
import styles from "./TokenSelectorModal.module.scss";
import Modal from "../modal/Modal";
import { Button, Icon, InputField, Loader } from "@/shared";
import { formatNum, truncateAddress } from "@/utils";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { Token, addTokens, update } from "@/store/slices/tokenSlice";
import { useImportToken, useTokens } from "@/hooks/useTokens";
import useEthBalance from "@/hooks/useEthBalance";
import { useAppDispatch } from "@/store/configureStore";
import { isValidEthereumAddress } from "@/utils/web3Utils";

interface Props {
	close: () => void;
	openModal: boolean;
}

const TokenSelectorModal = (props: Props) => {
	const dispatch = useAppDispatch();
	const { isLoading, tokens, nativeCurrency } = useTokens();
	const { balances, isLoading: isLoadingBalances } = useTokenBalances();
	const { balance: ethBalance, isLoading: isLoadingEthBalanace } = useEthBalance();

	const [searchTerm, setSearchTerm] = useState<string>("");

	const selectToken = (token: Token) => {
		dispatch(
			update({
				name: "selectedToken",
				value: { ...token },
			})
		);
		props.close();
	};

	const filteredTokens = useMemo(() => {
		const _tokens = [nativeCurrency, ...tokens];
		const term = searchTerm.toLowerCase();
		if (term)
			return _tokens.filter(
				t =>
					t.address.toLowerCase().includes(term) ||
					t.name.toLowerCase().includes(term) ||
					t.symbol.toLowerCase().includes(term)
			);
		return _tokens;
	}, [searchTerm, tokens]);

	const shouldImportToken = useMemo(() => {
		if (isValidEthereumAddress(searchTerm)) {
			if (tokens.findIndex(t => t.address === searchTerm) === -1) return true;
			return false;
		}
		return false;
	}, [searchTerm, tokens]);

	const importToken = useCallback(
		(token: Token) => {
			setSearchTerm("");
			dispatch(addTokens(token));
		},
		[dispatch]
	);

	return (
		<Modal
			className={styles.modal}
			openModal={props.openModal}
			close={props.close}
			title="Select token"
		>
			<InputField
				value={searchTerm}
				placeholder="Search by name or paste address"
				className={styles.input}
				onChange={e => setSearchTerm(e.target.value)}
			/>
			{isLoading && <Loader className={styles.loader} />}
			<ImportToken tokenAddress={searchTerm} importToken={importToken} />
			<ul className={styles.token_list}>
				{filteredTokens.map(token => (
					<TokenButton
						key={token.address}
						token={token}
						balance={
							token.address === ""
								? ethBalance
								: balances?.get(token.address)
						}
						isLoadingBalances={
							token.address === ""
								? isLoadingEthBalanace
								: isLoadingBalances
						}
						onClick={() => selectToken(token)}
					/>
				))}
				{shouldImportToken && (
					<ImportToken tokenAddress={searchTerm} importToken={importToken} />
				)}
			</ul>
		</Modal>
	);
};

export default TokenSelectorModal;

interface TokenButton {
	token: Token;
	balance: string | undefined;
	isLoadingBalances: boolean;
	onClick?: () => void;
}

const TokenButton = ({ onClick, token, balance, isLoadingBalances }: TokenButton) => {
	return (
		<li className={styles.token_item}>
			<Button buttonType="transparent" className={styles.button} onClick={onClick}>
				<div className={styles.small_row}>
					<Icon src={token.logoURI} width={32} height={32} />
					<div className={styles.text} style={{ textAlign: "left" }}>
						<h3>{token.symbol}</h3>
						<p>{token.name}</p>
					</div>
				</div>
				<div className={styles.text} style={{ textAlign: "right" }}>
					{balance ? (
						<h3>
							{typeof balance === "number"
								? `${formatNum(balance)} ${token.symbol}`
								: balance}{" "}
						</h3>
					) : null}
					{isLoadingBalances && <Loader className={styles.loader} />}
				</div>
			</Button>
		</li>
	);
};

const ImportToken = ({
	tokenAddress,
	importToken,
}: {
	tokenAddress: string;
	importToken: (token: Token) => void;
}) => {
	const { token, balance, isLoading } = useImportToken(tokenAddress);

	const onClickImport = useCallback(() => {
		if (token) {
			importToken(token);
		}
	}, [token]);

	return (
		<div className={styles.row}>
			{isLoading && <Loader className={styles.loader} />}
			{token ? (
				<>
					<div className={styles.small_row}>
						<Icon />
						<div className={styles.text}>
							<h3>{token.symbol}</h3>
							<p>{token.name}</p>
						</div>
					</div>
					<div className={styles.text}>
						<h3>{truncateAddress(token.address)}</h3>
						{balance ? (
							<p>
								{typeof balance === "number"
									? `${formatNum(balance)} ${token.symbol}`
									: balance}
							</p>
						) : null}
					</div>
					<Button className={styles.import_button} onClick={onClickImport}>
						Add token
					</Button>
				</>
			) : (
				""
			)}
		</div>
	);
};
