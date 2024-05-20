"use client";
import { ConnectWallet, Logo } from "@/shared";
import styles from "./Header.module.scss";
import Link from "next/link";
import { useState } from "react";
import { navLinks } from "@/mock";
import { usePathname } from "next/navigation";
import { usePendingTransactions } from "@/hooks/useTransaction";

const Header = () => {
	const pathName = usePathname();
	const [collapsed, setCollapsed] = useState<boolean>(true);
	const { pendingNumber } = usePendingTransactions();

	const checkActive = (href: string) => {
		const isActive = href === pathName;
		return isActive;
	};

	const closeNav = () => {
		setCollapsed(true);
	};
	return (
		<header className={styles.header}>
			<Link href="/">
				<Logo />
			</Link>
			<div
				className={
					styles[!collapsed ? "header_wrapper" : "header_wrapper__collapsed"]
				}
			>
				<nav className={styles.header_nav}>
					<ul className={styles.header_navList}>
						{navLinks.map(({ label, href }, index) => {
							return (
								<li
									key={index}
									className={styles.header_navLink}
									data-active={checkActive(href)}
									onClick={closeNav}
								>
									<Link href={href}>{label}</Link>
									{label === "history" && pendingNumber ? (
										<span className={styles.tranx_badge}>
											{pendingNumber}
										</span>
									) : null}
								</li>
							);
						})}
					</ul>
				</nav>
				<ConnectWallet className={styles.button} />
			</div>
			<div
				onClick={() => setCollapsed(!collapsed)}
				className={
					styles[collapsed ? "header_hamburger" : "header_hamburger__open"]
				}
			>
				<span className={styles.header_hamburgerBar}></span>
				<span className={styles.header_hamburgerBar}></span>
			</div>
		</header>
	);
};

export default Header;
