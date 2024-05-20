import React, { useEffect } from "react";
import Modal from "../modal/Modal";
import styles from "./WalletModal.module.scss";
import Image from "next/image";
import { wallets } from "@/mock";
import { Wallet } from "@/interfaces";
import { Connector, useAccount, useChainId, useConnect } from "wagmi";

interface Props {
	close: () => void;
	openModal: boolean;
}

const WalletModal = (props: Props) => {
	const { connectors, connect } = useConnect();
	const { isConnected, isConnecting, isDisconnected } = useAccount();
	const chainId = useChainId();

	useEffect(() => {
		if (isConnected) {
			props.close();
		}
	}, [isConnected]);

	return (
		<Modal
			title={isConnecting ? "Connecting wallet" : "Get Started"}
			description={isDisconnected ? "Select your wallet to make transfers" : ""}
			close={props.close}
			openModal={props.openModal}
			className={styles.modal}
			titleClassName={isConnecting ? styles.title : ""}
		>
			{isDisconnected ? (
				<>
					<ul className={styles.wallet_list}>
						{wallets.map((wallet: Wallet, index: number) => {
							const connector = connectors.find(
								c => c.id === wallet.connectorName
							);
							if (!connector) return;
							return (
								<ConnectorButton
									key={connector.uid}
									connector={connector}
									wallet={wallet}
									onClick={() => connect({ connector, chainId })}
								/>
							);
						})}
					</ul>
					<div className={styles.text}>
						<p>
							Dont have a wallet?{" "}
							<a
								href="https://ethereum.org/en/wallets/find-wallet/"
								target="_blank"
								rel="noopener noreferrer"
							>
								Learn more
							</a>
						</p>
					</div>
				</>
			) : (
				<div className={styles.container}>
					<div className={styles.row}>
						<div className={styles.large_icon}>
							<Image
								src="/svgs/icon-logo.svg"
								alt="logo"
								fill
								sizes="(max-width: 600px) 100vw, 
								(max-width: 1200px) 50vw, 
								33vw"
							/>
						</div>
						<div className={styles.loader}></div>
						<div className={styles.large_icon}>
							<Image
								src="/svgs/icon-metamask.svg"
								alt="logo"
								fill
								sizes="(max-width: 600px) 100vw, 
								(max-width: 1200px) 50vw, 
								33vw"
							/>
						</div>
					</div>
					<div className={styles.text_container}>
						<p>Establishing Connection</p>
					</div>
				</div>
			)}
		</Modal>
	);
};

export default WalletModal;

const ConnectorButton = ({
	connector,
	onClick,
	wallet,
}: {
	connector: Connector;
	onClick: () => void;
	wallet: Wallet;
}) => {
	const [ready, setReady] = React.useState(false);
	React.useEffect(() => {
		(async () => {
			const provider = await connector.getProvider();
			setReady(!!provider);
		})();
	}, [connector, setReady]);
	return (
		<li
			className={styles.wallet_list__item}
			style={{ backgroundColor: !ready ? "rgba(0,0,0,0.4)" : "transparent" }}
			onClick={() => {
				if (!ready) return;
				onClick();
			}}
		>
			<div className={styles.icon}>
				<Image
					src={wallet.icon}
					alt=""
					fill
					sizes="(max-width: 600px) 100vw, 
               (max-width: 1200px) 50vw, 
               33vw"
				/>
			</div>
			<h3>{wallet.label}</h3>
		</li>
	);
};
