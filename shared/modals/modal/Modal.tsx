"use client";

import React, { useCallback, useEffect } from "react";
import styles from "./Modal.module.scss";
import { Title } from "@/shared";

interface Props {
	openModal: boolean;
	title?: string;
	className?: string;
	children?: React.ReactNode;
	description?: string;
	close: () => void;
	titleClassName?: string;
}

const Modal = (props: Props) => {
	useEffect(() => {
		document.body.style.overflow = props.openModal ? "hidden" : "auto";
		return () => {
			document.body.style.overflow = "auto";
		};
	}, [props.openModal]);
	return (
		<div className={styles.modal_container}>
			<div className={styles.close_background} onClick={props.close}></div>
			<div
				className={`${styles.modal} ${props.className}`}
				onClick={(e: React.MouseEvent<HTMLDivElement>) =>
					e.nativeEvent.stopImmediatePropagation()
				}
			>
				<div className={styles.closeModal_container} onClick={props.close}>
					<div className={styles.closeModal}>
						<span></span>
						<span></span>
					</div>
				</div>
				{props.title && (
					<div className={styles.header}>
						<Title
							title={props.title}
							description={props.description}
							type="medium"
							className={props.titleClassName}
						/>
					</div>
				)}
				<div className={styles.body}>{props.children}</div>
			</div>
		</div>
	);
};

export default Modal;
