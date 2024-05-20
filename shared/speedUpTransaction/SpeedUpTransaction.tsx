"use client";

import React, { useCallback, useEffect, useState } from "react";
import styles from "./SpeedUpTransaction.module.scss";
import Image from "next/image";
import Button from "../button/Button";
import { formatNum } from "@/utils";
import { usePendingTransactions, useSpeedUpTransaction } from "@/hooks/useTransaction";
import { estimateTransactionTime } from "@/utils/gasPrice";
import useGasPrice from "@/hooks/useGasPrice";
import { formatEther, formatGwei, parseGwei } from "viem";
import Loader from "../loader/Loader";
import { toast } from "react-toastify";
import { useAppSelector } from "@/store/configureStore";
import InputField from "../inputField/InputField";
import { useDispatch } from "react-redux";
import { setSelectedGasLevel } from "@/store/slices/settingsSlice";

interface Props {
	hash: string | undefined;
	close: () => void;
	closeModal: () => void;
}

const SpeedUpTransaction = (props: Props) => {
	const { pendingTransactions } = usePendingTransactions();
	const selectedGasLevel = useAppSelector(s => s.settings.selectedGasLevel);
	const gasLevels = useAppSelector(s => s.settings.gasLevels);
	const dispatch = useDispatch();
	const { gasPrice, userGasPrice } = useGasPrice();
	const [selectedFee, setSelectedFee] = useState<string>("custom");
	const [gasFee, setGasFee] = useState<string>(
		formatNum(formatGwei(BigInt(userGasPrice)), false, 3).toString()
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const speedUpTx = useSpeedUpTransaction();

	const updateFee = useCallback(
		(value: string, active: string) => {
			setGasFee(formatNum(formatGwei(BigInt(value)), false, 3).toString());
			setSelectedFee(active);
			dispatch(setSelectedGasLevel(active));
		},
		[dispatch]
	);

	useEffect(() => {
		if (selectedGasLevel) {
			updateFee(gasLevels[selectedGasLevel], selectedGasLevel);
		}
	}, [selectedGasLevel, userGasPrice, gasPrice, gasLevels, updateFee]);

	const handleGasFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (!isNaN(Number(value))) {
			setGasFee(value);
		}
	};

	const submit = async () => {
		try {
			if (!props.hash) return;
			const isSpeedableTx = pendingTransactions.at(-1) === props.hash;
			if (!isSpeedableTx)
				return toast.error(
					"You need to speed up the oldest pending transaction first"
				);
			setIsSubmitting(true);
			await speedUpTx(props.hash, parseGwei(gasFee));
			toast.success(
				"Speed up transaction submitted. Your transaction will be replaced!"
			);
			props.closeModal();
		} catch (error: any) {
			let err = error;
			if (error.toLowerCase().includes("nonce"))
				err =
					"Speed up transaction failed! Transaction may have already been mined. Check status";
			toast.error(err);
			props.close();
		} finally {
			dispatch(setSelectedGasLevel("market"));
			setIsSubmitting(false);
		}
	};
	return (
		<div className={styles.container}>
			<Button
				buttonType="transparent"
				className={styles.go_back}
				onClick={props.close}
			>
				<div className={styles.chevron}>
					<Image
						src="/svgs/chevron.svg"
						alt=""
						fill
						sizes="(max-width: 600px) 100vw, 
               (max-width: 1200px) 50vw, 
               33vw"
					/>
				</div>
				<div className={styles.text}>
					<h4>Go back</h4>
				</div>
			</Button>
			<div className={styles.table}>
				<div className={styles.table_head}>
					<div className={styles.cell}>
						<div className={styles.text}>
							<p>Gas Option</p>
						</div>
					</div>
					<div className={styles.cell}>
						<div className={styles.text}>
							<p>Time</p>
						</div>
					</div>
					<div className={styles.cell}>
						<div className={styles.text}>
							<p>Max fee</p>
						</div>
					</div>
					<div className={styles.cell}></div>
				</div>
				{Object.keys(gasLevels).map((item, index: number) => {
					const name = item.charAt(0).toUpperCase() + item.slice(1);
					const value =
						gasLevels[item] === "market" ? gasPrice : gasLevels[item];
					const duration = estimateTransactionTime(value);
					return (
						<Button
							key={index}
							buttonType="transparent"
							className={styles.table_row}
							data-active={selectedFee === item}
							onClick={() => updateFee(value, item)}
						>
							<div className={styles.cell}>
								<div className={styles.text}>
									<p>{name}</p>
								</div>
							</div>
							<div className={styles.cell}>
								<div className={styles.text}>
									<p>{duration} sec</p>
								</div>
							</div>
							<div className={styles.cell}>
								<div className={styles.text}>
									{value ? (
										<p>
											{formatNum(formatGwei(value), true, 2)} GWEI
										</p>
									) : (
										<Loader />
									)}
								</div>
							</div>
							<div className={styles.cell}>
								<div className={styles.grad_box}>
									<p>Select</p>
								</div>
							</div>
						</Button>
					);
				})}

				<InputField
					label="Custom (GWEI)"
					placeholder="Input custom GWEI"
					value={gasFee}
					type="number"
					onChange={handleGasFeeChange}
					onClick={() => setSelectedFee("custom")}
					className={styles.input}
				/>
			</div>
			<Button className={styles.button} onClick={submit} disabled={isSubmitting}>
				{isSubmitting ? (
					<>
						<span>Submitting</span> <Loader />
					</>
				) : (
					"Submit"
				)}
			</Button>
		</div>
	);
};

export default SpeedUpTransaction;
