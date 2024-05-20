"use client";

import { Button, Icon } from "@/shared";
import React, { useState } from "react";
import styles from "./TokenSelector.module.scss";
import Image from "next/image";
import { TokenSelectorModal } from "@/shared/modals";
import { formatNum } from "@/utils";
import { Token } from "@/store/slices/tokenSlice";

const TokenSelector = ({
	selectedToken,
	balance,
}: {
	selectedToken: Token | null;
	balance: string;
}) => {
	const [openModal, setOpenModal] = useState<boolean>(false);
	const close = () => {
		setOpenModal(false);
	};
	const open = () => {
		setOpenModal(true);
	};
	return (
		<>
			<Button className={styles.button} buttonType="transparent" onClick={open}>
				<Icon
					src={selectedToken ? selectedToken.logoURI : "/svgs/info.svg"}
					className={styles.icon}
				/>
				<div className={styles.text}>
					{selectedToken ? (
						<p>
							{selectedToken?.symbol} -{" "}
							{balance !== ""
								? `${formatNum(balance, true, 4)} ${selectedToken.symbol}`
								: ""}
						</p>
					) : (
						<p>Select token</p>
					)}
				</div>
				<div className={styles.icon}>
					<Image
						src="/svgs/chevron.svg"
						alt=""
						sizes="(max-width: 600px) 100vw, 
               (max-width: 1200px) 50vw, 
               33vw"
						fill
					/>
				</div>
			</Button>
			{openModal && <TokenSelectorModal openModal={openModal} close={close} />}
		</>
	);
};

export default TokenSelector;
