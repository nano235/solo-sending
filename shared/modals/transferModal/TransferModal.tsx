"use client";

import React, { useEffect, useState } from "react";
import styles from "./TransferModal.module.scss";
import Modal from "../modal/Modal";
import Image from "next/image";
import { Button, Icon, SpeedUpTransaction } from "@/shared";
import Timer from "@/shared/timer/Timer";
import { useAppSelector } from "@/store/configureStore";
import { TransactionStatus } from "@/interfaces";
import { isValidEthereumAddress } from "@/utils/web3Utils";

interface Props {
	close: () => void;
	openModal: boolean;
}

enum View {
	DETAILS = "details",
	SPEEDUP = "speedup",
}

const TransferModal = ({ close, openModal }: Props) => {
	const selectedTxHash = useAppSelector(s => s.transaction.selectedTxHash);
	const selectedToken = useAppSelector(s => s.tokens.selectedToken);
	const allTransactions = useAppSelector(s => s.transaction.transactions);
	const [view, setView] = useState<View>(View.DETAILS);
	const [txStatus, setTxStatus] = useState<TransactionStatus>(TransactionStatus.IDLE);

	useEffect(() => {
		if (selectedTxHash) {
			const transaction = allTransactions?.[selectedTxHash];
			if (transaction?.status) setTxStatus(transaction.status);
		}
	}, [selectedTxHash, txStatus, allTransactions]);

	return (
		<Modal
			close={close}
			openModal={openModal}
			className={styles.modal}
			titleClassName={styles.title}
			title={view === View.DETAILS ? "Teleporting" : "Speed Up"}
		>
			{view === View.DETAILS && (
				<div className={styles.container}>
					{(txStatus === TransactionStatus.PENDING ||
						txStatus === TransactionStatus.IDLE) && (
						<div className={styles.row}>
							<div className={styles.portal}>
								<Image
									src="/images/portal.png"
									alt=""
									fill
									sizes="(max-width: 600px) 100vw, 
               (max-width: 1200px) 50vw, 
               33vw"
								/>
							</div>
							<div
								className={styles.icon_container}
								data-status={
									allTransactions?.[selectedTxHash]?.oldHash
										? "speed"
										: txStatus
								}
							>
								<Icon src={selectedToken?.logoURI} />
							</div>
							<div className={styles.portal}>
								<Image
									src="/images/portal.png"
									alt=""
									fill
									sizes="(max-width: 600px) 100vw, 
               (max-width: 1200px) 50vw, 
               33vw"
								/>
							</div>
						</div>
					)}
					{txStatus === TransactionStatus.SUCCESS && (
						<div className={styles.center}>
							<div className={styles.success_icon}>
								<Image
									src="/svgs/success.svg"
									alt="transaction successful"
									fill
									sizes="(max-width: 600px) 100vw, 
               (max-width: 1200px) 50vw, 
               33vw"
								/>
							</div>
						</div>
					)}
					{txStatus === TransactionStatus.FAILED && (
						<div className={styles.center}>
							<div className={styles.success_icon}>
								<Image
									src="/svgs/error.svg"
									alt="transaction failed"
									fill
									sizes="(max-width: 600px) 100vw, 
               (max-width: 1200px) 50vw, 
               33vw"
								/>
							</div>
						</div>
					)}
					{txStatus === TransactionStatus.IDLE &&
						!isValidEthereumAddress(selectedTxHash) && (
							<div className={styles.text}>
								<p>Confirm From Metamask</p>
							</div>
						)}
					{txStatus === TransactionStatus.PENDING ? (
						<>
							<div className={styles.text}>
								<span>
									Estimated time:{" "}
									<Timer
										initialTime={
											allTransactions?.[selectedTxHash]
												?.estimatedTime || 0
										}
									/>
								</span>
							</div>
							<div className={styles.button_container}>
								<Button
									buttonType="transparent"
									className={styles.button}
									onClick={close}
								>
									Home
								</Button>
								<Button
									className={styles.button}
									onClick={() => setView(View.SPEEDUP)}
								>
									Speed Up
								</Button>
							</div>
						</>
					) : txStatus === TransactionStatus.SUCCESS ? (
						<div className={styles.text}>
							<p> Transaction is successful</p>
						</div>
					) : txStatus === TransactionStatus.FAILED ? (
						<div className={styles.text}>
							<p>Transaction failed</p>
						</div>
					) : null}
				</div>
			)}
			{view === View.SPEEDUP && (
				<SpeedUpTransaction
					hash={selectedTxHash}
					close={() => setView(View.DETAILS)}
					closeModal={() => setView(View.DETAILS)}
				/>
			)}
		</Modal>
	);
};

export default TransferModal;
