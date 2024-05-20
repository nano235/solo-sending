"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./TransactionModal.module.scss";
import Modal from "../modal/Modal";
import DetailContainer from "@/shared/detailContainer/DetailContainer";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { AppState } from "@/store/configureStore";
import { TransactionDetails, TransactionStatus } from "@/interfaces";
import { formatNum, truncateAddress } from "@/utils";
import Button from "@/shared/button/Button";
import SpeedUpTransaction from "@/shared/speedUpTransaction/SpeedUpTransaction";
import { formatEther, formatGwei, formatUnits } from "viem";

interface Props {
	close: () => void;
	openModal: boolean;
}

enum View {
	DETAILS = "details",
	SPEEDUP = "speedup",
}

const TransactionModal = (props: Props) => {
	const transactions = useSelector((state: AppState) => state.transaction.transactions);
	const searchParams = useSearchParams();
	const transactionHash = searchParams.get("tx");

	const [view, setView] = useState<View>(View.DETAILS);

	const currentTx: TransactionDetails | null = useMemo(
		() => (transactionHash ? transactions[transactionHash] : null),
		[transactionHash, transactions]
	);

	useEffect(() => {
		if (transactionHash && Object.keys(transactions).length > 0) {
			if (!currentTx) props.close();
		}
	}, [currentTx, transactionHash, transactions]);

	return (
		<Modal
			openModal={props.openModal}
			close={props.close}
			className={styles.modal}
			title={view === View.DETAILS ? "Transaction Details" : "Speed Up"}
			titleClassName={styles.title}
		>
			{currentTx ? (
				<>
					{view === View.DETAILS && (
						<>
							<DetailContainer
								title="Symbol"
								value={currentTx.token.symbol.toUpperCase()}
							/>
							<div className={styles.row}>
								<div className={styles.text}>
									<p>Status</p>
								</div>{" "}
								<div className={styles.small_row}>
									{currentTx.status === TransactionStatus.PENDING && (
										<Button
											className={styles.button}
											onClick={() => setView(View.SPEEDUP)}
										>
											Speed up
										</Button>
									)}
									<div
										className={styles.text}
										data-type={currentTx.status}
									>
										<span>{currentTx.status}</span>
									</div>
								</div>
							</div>
							{currentTx.to && (
								<DetailContainer
									title="Receiver"
									value={truncateAddress(currentTx?.to)?.toString()}
								/>
							)}
							<div className={styles.row}>
								<div className={styles.text}>
									<p>View on explorer</p>
								</div>{" "}
								<div className={styles.text}>
									<a
										href={`https://sepolia.etherscan.io/tx/${currentTx.hash}`}
										target="_blank"
										rel="noreferrer noopener"
									>
										{truncateAddress(currentTx.hash)}
									</a>
								</div>
							</div>
							<DetailContainer
								title="Amount"
								value={`${formatNum(
									formatUnits(
										BigInt(
											BigInt(
												currentTx.token.address === ""
													? currentTx.value
													: currentTx.tokenAmount!
											)
										),
										currentTx.token.decimals
									)
								)} ${currentTx.token.symbol.toUpperCase()}`}
							/>
							<DetailContainer
								title="Block Number"
								value={currentTx.receipt?.blockNumber.toString()}
							/>
							<DetailContainer
								title="Gas Used(Units)"
								value={currentTx.receipt?.gasUsed.toString()}
							/>
							{currentTx.receipt?.effectiveGasPrice && (
								<DetailContainer
									title="Effective Gas Price"
									value={`${formatNum(
										formatGwei(currentTx.receipt?.effectiveGasPrice),
										true,
										3
									)} GWEI`}
								/>
							)}
						</>
					)}
					{view === View.SPEEDUP && (
						<SpeedUpTransaction
							hash={currentTx?.hash}
							close={() => setView(View.DETAILS)}
							closeModal={() => props.close()}
						/>
					)}
				</>
			) : (
				<div className={styles.center}>
					<div className={styles.text}>
						<h3>404... No transaction found</h3>
					</div>
				</div>
			)}
		</Modal>
	);
};

export default TransactionModal;
