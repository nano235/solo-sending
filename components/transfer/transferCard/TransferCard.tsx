"use client";

import React, { useMemo, useState } from "react";
import styles from "./TransferCard.module.scss";
import Image from "next/image";
import { Button, ConnectWallet, DetailContainer, InputField } from "@/shared";
import TokenSelector from "../tokenSelector/TokenSelector";
import { TransferModal } from "@/shared/modals";
import { useAccount } from "wagmi";
import { useAppDispatch, useAppSelector } from "@/store/configureStore";
import { formatNum } from "@/utils";
import useTokenTransfer from "@/hooks/useTokenTransfer";
import { Token } from "@/store/slices/tokenSlice";
import { Address, isValidEthereumAddress } from "@/utils/web3Utils";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import useEthBalance from "@/hooks/useEthBalance";
import { toast } from "react-toastify";
import TransactionSettingsModal from "@/shared/modals/TransactionSettingsModal/TransactionSettingsModal";
import { estimateTransactionTime } from "@/utils/gasPrice";
import { formatGwei } from "viem";
import useGasPrice from "@/hooks/useGasPrice";
import { setSelectedTxHash } from "@/store/slices/transactionSlice";

const TransferCard = () => {
	const dispatch = useAppDispatch();
	const selectedToken = useAppSelector(state => state.tokens.selectedToken);
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [openSettings, setOpenSettings] = useState<boolean>(false);
	const [amount, setAmount] = useState<string>("");
	const [transferAddress, setTransferAddress] = useState<string>("");
	const { isConnected } = useAccount();
	const { transfer } = useTokenTransfer();
	const { balance, isLoading } = useTokenBalance(selectedToken);
	const { balance: balanceEth } = useEthBalance();
	const { userGasPrice } = useGasPrice();

	const closeModal = () => {
		setOpenModal(false);
	};

	const openSettingsModal = () => {
		setOpenSettings(true);
	};

	const selectedTokenBalance = useMemo(() => {
		if (selectedToken) {
			if (selectedToken.address === "") return balanceEth;
			else return balance;
		}
		return "";
	}, [selectedToken, isLoading, balanceEth, balance]);

	const onClickTransfer = async () => {
		if (!isConnected) return toast.error("Please connect wallet to proceed");
		if (!isValidEthereumAddress(transferAddress))
			return toast.error("Invalid ethereum address");

		dispatch(setSelectedTxHash(""));
		setOpenModal(true);
		try {
			const hash = await transfer({
				token: selectedToken as Token,
				to: transferAddress as Address,
				amount,
			});

			dispatch(setSelectedTxHash(hash));
		} catch (error: any) {
			console.log(error, "error");
			setOpenModal(false);
			toast.error(error);
		}
	};

	const disabled = useMemo(
		() => !amount || !transferAddress || !isValidEthereumAddress(transferAddress),
		[amount, transferAddress]
	);

	return (
		<div className={styles.card}>
			<div className={styles.row}>
				<div className={styles.text}>
					<h1>Transfer Tokens</h1>
				</div>
				<div className={styles.icon_hourglass} onClick={openSettingsModal}>
					<Image
						src="/svgs/icon-settings.svg"
						alt=""
						fill
						sizes="(max-width: 600px) 100vw, 
               (max-width: 1200px) 50vw, 
               33vw"
					/>
				</div>
			</div>
			<div className={styles.block}>
				<input
					className={styles.input}
					value={amount}
					type="number"
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setAmount(e.target.value)
					}
					placeholder="0"
				/>
				<Button
					buttonType="transparent"
					className={styles.grad_button}
					disabled={!selectedToken}
					onClick={() =>
						selectedTokenBalance !== ""
							? setAmount(
									formatNum(selectedTokenBalance, true, 6)
										.toString()
										.replace(/,/g, "")
							  )
							: null
					}
				>
					Max
				</Button>
				<TokenSelector
					selectedToken={selectedToken}
					balance={selectedTokenBalance}
				/>
			</div>
			<InputField
				label="Recipient Address"
				placeholder="Wallet address"
				value={transferAddress}
				disabled={!isConnected}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
					setTransferAddress(e.target.value)
				}
			/>
			{isConnected ? (
				<Button
					className={styles.button}
					disabled={disabled}
					onClick={onClickTransfer}
				>
					Transfer
				</Button>
			) : (
				<ConnectWallet className={styles.button} />
			)}
			{!disabled && (
				<div className={styles.block}>
					<DetailContainer
						title="Estimated Time of Arrival"
						description="The time it will take to get to the recepient's wallet"
						value={estimateTransactionTime(userGasPrice)}
						suffix="sec"
					/>
					<DetailContainer
						title="Gas Price"
						value={formatNum(formatGwei(BigInt(userGasPrice)), true, 3)}
						suffix="GWEI"
					/>
				</div>
			)}
			{openModal && <TransferModal openModal={openModal} close={closeModal} />}

			{openSettings && (
				<TransactionSettingsModal
					openModal={openSettings}
					close={() => setOpenSettings(false)}
				/>
			)}
		</div>
	);
};

export default TransferCard;
