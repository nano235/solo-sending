import { formatNum } from "@/utils";
import Image from "next/legacy/image";
import React from "react";
import styles from "./DetailContainer.module.scss";

interface Props {
	title?: string;
	value?: string | number;
	prefix?: string;
	suffix?: string;
	description?: string;
	className?: string;
	textClassName?: string;
	textType?: "gain" | "loss";
}

const DetailContainer = ({
	title,
	value,
	description,
	prefix,
	suffix,
	className,
	textClassName,
	textType,
}: Props) => {
	return (
		<div className={`${styles.container} ${className}`}>
			<div className={styles.row}>
				<div className={styles.text}>
					<p>{title}</p>
				</div>
				{description && (
					<div className={styles.icon}>
						<Image
							src="/svgs/info.svg"
							layout="fill"
							alt=""
							sizes="(max-width: 600px) 100vw, 
               (max-width: 1200px) 50vw, 
               33vw"
						/>
						<div className={styles.info_container}>
							<div className={styles.text}>
								<h6>{description}</h6>
							</div>
						</div>
					</div>
				)}
			</div>
			<div className={`${styles.text} ${textClassName}`}>
				<h5>
					{prefix}
					{typeof value === "number" ? formatNum(value) : value}{" "}
					{suffix || null}
				</h5>
			</div>
		</div>
	);
};

export default DetailContainer;
