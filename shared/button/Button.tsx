import React from "react";
import styles from "./Button.module.scss";

import Image from "next/image";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	buttonType?: "primary" | "secondary" | "transparent";
	children: React.ReactNode;
	iconPrefix?: string;
	iconSuffix?: string;
	className?: string;
	onClick?: (event?: any) => void;
}

const Button = ({
	buttonType = "primary",
	children,
	onClick,
	className,
	iconPrefix,
	iconSuffix,
	...otherProps
}: Props) => {
	return (
		<button
			onClick={onClick}
			className={`${styles[buttonType]} ${className} ${styles.button}`}
			data-type={buttonType}
			{...otherProps}
		>
			{!!iconPrefix && (
				<figure className={styles.button_icon}>
					<Image
						src={iconPrefix}
						layout="fill"
						alt=""
						sizes="(max-width: 600px) 100vw, 
               (max-width: 1200px) 50vw, 
               33vw"
					/>
				</figure>
			)}
			{children}
			{!!iconSuffix && (
				<figure className={styles.button_icon}>
					<Image
						src={iconSuffix}
						layout="fill"
						alt=""
						sizes="(max-width: 600px) 100vw, 
               (max-width: 1200px) 50vw, 
               33vw"
					/>
				</figure>
			)}
		</button>
	);
};

export default Button;
