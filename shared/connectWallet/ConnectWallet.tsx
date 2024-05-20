"use client";

import React, { useState } from "react";
import { Button } from "..";
import WalletModal from "../modals/walletModal/WalletModal";
import styles from "./ConnectWallet.module.scss";
import Image from "next/image";
import { truncateAddress } from "@/utils";
import { useAccount, useDisconnect, useEnsName } from "wagmi";

interface Props {
	className?: string;
}

const ConnectWallet = ({ className }: Props) => {
	const [openModal, setOpenModal] = useState<{
		walletModal: boolean;
		profileModal: boolean;
	}>({ walletModal: false, profileModal: false });

	const { isConnected, isConnecting, address } = useAccount();
	const { disconnect } = useDisconnect();
	const { data: ensName } = useEnsName({ address });
	const formattedAddress = truncateAddress(address);

	const closeWalletModal = () => {
		setOpenModal({ ...openModal, walletModal: false });
	};

	const openWalletModal = () => {
		setOpenModal({ ...openModal, walletModal: true });
	};

	const toggleProfileModal = () => {
		setOpenModal({ ...openModal, profileModal: !openModal.profileModal });
	};

	return (
		<>
			{isConnecting ? (
				<div className={`${styles.text} ${className}`} style={{ width: "100%" }}>
					<h3>Connecting...</h3>
				</div>
			) : !isConnected ? (
				<Button onClick={openWalletModal} className={className}>
					Connect Wallet
				</Button>
			) : (
				<div
					className={`${styles.profile} ${className}`}
					onClick={toggleProfileModal}
				>
					<div className={styles.text}>
						{address && (
							<p>
								{ensName
									? `${ensName} (${formattedAddress})`
									: formattedAddress}
							</p>
						)}
					</div>
					<div className={styles.icon}>
						<Image
							src="/svgs/chevron.svg"
							alt=""
							fill
							sizes="(max-width: 600px) 100vw, 
               (max-width: 1200px) 50vw, 
               33vw"
						/>
					</div>
					{openModal.profileModal && (
						<div className={styles.profile_body} onClick={() => disconnect()}>
							<div className={styles.text}>
								<h3>Disconnect</h3>
							</div>
						</div>
					)}
				</div>
			)}
			{openModal.walletModal && (
				<WalletModal openModal={openModal.walletModal} close={closeWalletModal} />
			)}
		</>
	);
};

export default ConnectWallet;
