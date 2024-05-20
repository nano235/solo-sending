import Image from "next/image";
import React from "react";
import styles from "./Icon.module.scss";

interface Props {
	src?: string;
	className?: string;
	title?: string;
	width?: number;
	height?: number;
}

const Icon = ({ src, className, title = "", width, height }: Props) => {
	return (
		<>
			{src ? (
				<div
					className={`${styles.icon} ${className && className}`}
					style={{ width: `${width! / 10}rem`, height: `${height! / 10}` }}
				>
					<Image
						src={src}
						alt={title}
						title={title}
						fill
						sizes="(max-width: 600px) 100vw, 
               (max-width: 1200px) 50vw, 
               33vw"
					/>
				</div>
			) : (
				<div
					className={`${styles.container} ${className && className}`}
					style={{ width: `${width! / 10}rem`, height: `${height! / 10}` }}
				>
					<div className={`${!src && styles.icon_not}`}>
						<Image
							src={"/images/unknown.png"}
							alt={title}
							title={title}
							fill
							sizes="(max-width: 600px) 100vw, 
               (max-width: 1200px) 50vw, 
               33vw"
						/>
					</div>
				</div>
			)}
		</>
	);
};

export default Icon;
