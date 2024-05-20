import styles from "./Logo.module.scss";
import React from "react";

import Image from "next/image";

interface Props {
	className?: string;
}

const Logo = ({ className }: Props) => {
	return (
		<div className={`${styles.logo} ${className}`}>
			<Image
				src="/svgs/logo.svg"
				loading="eager"
				priority={true}
				alt="RPSLS"
				fill
				sizes="(max-width: 600px) 100vw, 
				(max-width: 1200px) 50vw, 
				33vw"
				quality={100}
			/>
		</div>
	);
};

export default Logo;
