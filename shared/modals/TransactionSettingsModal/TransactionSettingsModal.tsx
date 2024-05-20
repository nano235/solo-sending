"use client";

import React, { useCallback, useEffect, useState } from "react";
import styles from "./TransactionSettingsModal.module.scss";
import Image from "next/image";
import Button from "../../button/Button";
import { formatNum } from "@/utils";
import useGasPrice from "@/hooks/useGasPrice";
import { useAppDispatch, useAppSelector } from "@/store/configureStore";
import { setGasPrice, setSelectedGasLevel } from "@/store/slices/settingsSlice";
import { formatGwei, parseGwei } from "viem";
import Loader from "../../loader/Loader";
import { estimateTransactionTime } from "@/utils/gasPrice";
import Modal from "../modal/Modal";
import { toast } from "react-toastify";
import InputField from "@/shared/inputField/InputField";

interface Props {
	openModal: boolean;
	close: () => void;
}

const TransactionSettingsModal = (props: Props) => {
	const dispatch = useAppDispatch();
	const selectedGasLevel = useAppSelector(s => s.settings.selectedGasLevel);
	const gasLevels = useAppSelector(s => s.settings.gasLevels);
	const { gasPrice, userGasPrice } = useGasPrice();
	const [selectedFee, setSelectedFee] = useState<string>(selectedGasLevel || "custom");
	const [gasFee, setGasFee] = useState<string>(
		formatNum(formatGwei(BigInt(userGasPrice)), false, 3).toString()
	);

	const updateFee = useCallback(
		(value: string, active: string) => {
			setGasFee(formatNum(formatGwei(BigInt(value)), false, 3).toString());
			setSelectedFee(active);
			dispatch(setSelectedGasLevel(active));
		},
		[dispatch]
	);

	const handleGasFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (!isNaN(Number(value))) {
			setGasFee(value);
			dispatch(setSelectedGasLevel(""));
		}
	};

	const submit = useCallback(async () => {
		const baseFee = Number(formatNum(formatGwei(BigInt(gasPrice)), false, 3));
		if (Number(gasFee) < baseFee)
			return toast.error(
				`Gas fee is ignored because it's less than the network's current base fee of ${baseFee}. Your transactions will not be mined with this fee`
			);
		dispatch(setGasPrice(parseGwei(gasFee).toString()));
		dispatch(setSelectedGasLevel("market"));
		props.close();
	}, [gasFee, gasPrice, dispatch]);

	useEffect(() => {
		if (selectedGasLevel) {
			updateFee(gasLevels[selectedGasLevel], selectedGasLevel);
		}
	}, [selectedGasLevel, userGasPrice, gasPrice, gasLevels, updateFee]);

	return (
		<Modal
			openModal={props.openModal}
			close={props.close}
			className={styles.modal}
			title="Transaction Settings"
			titleClassName={styles.title}
		>
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
						const value = item == "market" ? gasPrice : gasLevels[item];
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
												{formatNum(formatGwei(value), true, 2)}{" "}
												GWEI
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
				<Button className={styles.button} onClick={submit}>
					Save
				</Button>
			</div>
		</Modal>
	);
};

export default TransactionSettingsModal;
