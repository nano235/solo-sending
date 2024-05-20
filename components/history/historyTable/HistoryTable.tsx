"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./HistoryTable.module.scss";
import { ConnectWallet, Icon, Pagination } from "@/shared";
import { formatDate, formatNum, formatTime, truncateAddress } from "@/utils";
import Timer from "@/shared/timer/Timer";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TransactionModal } from "@/shared/modals";
import { useAccount } from "wagmi";
import { useAllTransactions, usePendingTransactions } from "@/hooks/useTransaction";
import { TransactionDetails, TransactionStatus } from "@/interfaces";
import { formatUnits } from "viem";
import { useAppSelector } from "@/store/configureStore";

const pageSize = 8;

const HistoryTable = () => {
	const { address } = useAccount();
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const currentTxHash = searchParams.get("tx");
	const transactions = useAllTransactions();
	const { pendingNumber } = usePendingTransactions();
	const allTransactions = useAppSelector(s => s.transaction.transactions);
	const [currentPage, setCurrentPage] = useState<number>(1);

	const openModal = (tx: string) => {
		if (!allTransactions.hasOwnProperty(tx)) return;
		const current = new URLSearchParams(Array.from(searchParams.entries()));
		current.set("tx", tx);
		const search = current.toString();
		const query = search ? `?${search}` : "";
		router.push(`${pathname}${query}`);
	};

	const closeModal = () => {
		router.push(pathname);
	};

	const currentTx = useMemo(() => {
		const firstPageIndex = (currentPage - 1) * pageSize;
		const lastPageIndex = firstPageIndex + pageSize;
		return transactions.slice(firstPageIndex, lastPageIndex);
	}, [currentPage, pendingNumber, allTransactions, transactions]);

	const startNumber = (currentPage - 1) * pageSize + 1;
	const endNumber = Math.min(startNumber + currentTx.length - 1, transactions.length);

	return (
		<section className={styles.section}>
			{address ? (
				<>
					<div className={styles.table}>
						<div className={styles.table_head}>
							<div className={styles.cell}>
								<div className={styles.text}>
									<span>Token</span>
								</div>
							</div>
							<div className={styles.cell}>
								<div className={styles.text}>
									<span>Amount</span>
								</div>
							</div>
							<div className={styles.cell}>
								<div className={styles.text}>
									<span>Receiver</span>
								</div>
							</div>
							<div className={styles.cell}>
								<div className={styles.text}>
									<span>Status</span>
								</div>
							</div>
							<div className={styles.cell}>
								<div className={styles.text}>
									<span>Date</span>
								</div>
							</div>
							<div className={styles.cell}></div>
						</div>
						<div className={styles.table_body}>
							{currentTx.length ? (
								currentTx.map((tx: TransactionDetails, index: number) => (
									<div className={styles.table_row} key={index}>
										<div className={styles.cell}>
											<Icon
												src={tx.token.logoURI}
												title={tx.token.symbol}
											/>
											<div className={styles.text}>
												<p
													style={{
														textTransform: "uppercase",
														fontWeight: 600,
														color: "white",
													}}
												>
													{tx.token.symbol}
												</p>
											</div>
										</div>
										<div className={styles.cell}>
											<div className={styles.text}>
												<p
													style={{
														textTransform: "uppercase",
														fontWeight: 600,
														color: "white",
													}}
												>
													{formatNum(
														formatUnits(
															BigInt(
																tx.token.address === ""
																	? tx.value
																	: tx.tokenAmount!
															),
															tx.token.decimals
														)
													)}{" "}
													{tx.token.symbol}
												</p>
											</div>
										</div>
										<div className={styles.cell}>
											<div className={styles.text}>
												<p>{truncateAddress(tx.to)}</p>
											</div>
										</div>
										<div className={styles.cell}>
											<div
												className={styles.text}
												data-type={tx.status}
											>
												<span>
													{tx.status}
													{tx.status !== "success" && (
														<div
															className={
																styles.info_container
															}
														>
															<StatusDescription
																status={tx.status}
																timer={0}
																description={
																	tx.description
																}
															/>
														</div>
													)}
												</span>
											</div>
										</div>
										<div className={styles.cell}>
											<div className={styles.text}>
												<p>
													{formatDate(tx.submittedAt)}
													{" • "}
													{formatTime(tx.submittedAt)}
												</p>
											</div>
										</div>
										{tx?.hash && (
											<div
												className={styles.cell}
												onClick={() => openModal(tx.hash)}
											>
												<div
													className={styles.more_options}
												></div>
											</div>
										)}
									</div>
								))
							) : (
								<div className={styles.center_text}>
									<p>No History</p>
								</div>
							)}
						</div>
					</div>
					<div className={styles.mob_table}>
						{currentTx.length ? (
							currentTx.map((tx: TransactionDetails, index: number) => (
								<div className={styles.card} key={index}>
									<div className={styles.row}>
										<div
											className={styles.text}
											style={{ textTransform: "capitalize" }}
										>
											<span>Token</span>
										</div>
										<div className={styles.cell}>
											<Icon
												src={tx.token.logoURI}
												title={tx.token.symbol}
											/>
											<div className={styles.text}>
												<p
													style={{
														textTransform: "uppercase",
														fontWeight: 600,
														color: "white",
													}}
												>
													{tx.token.symbol}
												</p>
											</div>
										</div>
									</div>
									<div className={styles.row}>
										<div
											className={styles.text}
											style={{ textTransform: "capitalize" }}
										>
											<span>Amount</span>
										</div>
										<div className={styles.cell}>
											<div className={styles.text}>
												<p
													style={{
														textTransform: "uppercase",
														fontWeight: 600,
														color: "white",
													}}
												>
													{formatNum(
														formatUnits(
															BigInt(
																BigInt(
																	tx.token.address ===
																		""
																		? tx.value
																		: tx.tokenAmount!
																)
															),
															tx.token.decimals
														)
													)}{" "}
													{tx.token.symbol}
												</p>
											</div>
										</div>
									</div>
									<div className={styles.row}>
										<div
											className={styles.text}
											style={{ textTransform: "capitalize" }}
										>
											<span>Receiver</span>
										</div>
										<div className={styles.cell}>
											<div className={styles.text}>
												<p>{truncateAddress(tx.to)}</p>
											</div>
										</div>
									</div>
									<div className={styles.row}>
										<div
											className={styles.text}
											style={{ textTransform: "capitalize" }}
										>
											<span>Status</span>
										</div>
										<div className={styles.cell}>
											<div
												className={styles.text}
												data-type={tx.status}
											>
												<span>
													{tx.status}
													{tx.status !== "success" && (
														<div
															className={
																styles.info_container
															}
														>
															<StatusDescription
																status={tx.status}
																timer={0}
																description={
																	tx.description
																}
															/>
														</div>
													)}
												</span>
											</div>
										</div>
									</div>
									<div className={styles.row}>
										<div
											className={styles.text}
											style={{ textTransform: "capitalize" }}
										>
											<span>Date</span>
										</div>
										<div className={styles.cell}>
											<div className={styles.text}>
												<p>
													{formatDate(tx.submittedAt)}
													{" • "}
													{formatTime(tx.submittedAt)}
												</p>
											</div>
										</div>
									</div>
									<div className={styles.row}>
										<div
											className={styles.text}
											style={{ textTransform: "capitalize" }}
										>
											<span>Actions</span>
										</div>
										<div className={styles.cell}>
											<div
												className={styles.more_options}
												onClick={() => openModal(tx.hash)}
											></div>
										</div>
									</div>
								</div>
							))
						) : (
							<div className={styles.center_text}>
								<p>No History</p>
							</div>
						)}
					</div>
					<Pagination
						currentPage={currentPage}
						totalCount={transactions.length}
						pageSize={pageSize}
						onPageChange={(page: any) => setCurrentPage(page)}
						startNumber={startNumber}
						endNumber={endNumber}
					/>
					{!!currentTxHash && (
						<TransactionModal
							openModal={!!currentTxHash}
							close={closeModal}
						/>
					)}
				</>
			) : (
				<ConnectWallet />
			)}
		</section>
	);
};

const StatusDescription = ({
	status,
	timer = 0,
	description = "",
}: {
	status: TransactionStatus;
	timer: number;
	description?: string;
}) => {
	return (
		<div className={styles.text}>
			{status === "pending" && (
				<span style={{ fontSize: "1.2rem" }}>
					Estimated time to complete : <Timer initialTime={timer} />
				</span>
			)}
			{status === "failed" && (
				<span style={{ fontSize: "1.2rem" }}>{description}</span>
			)}
		</div>
	);
};
export default HistoryTable;
