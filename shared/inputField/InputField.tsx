"use client";

import React, { InputHTMLAttributes, ReactNode, useState } from "react";
import styles from "./InputField.module.scss";

import Image from "next/image";
interface Props extends InputHTMLAttributes<HTMLInputElement> {
	name?: string;
	label?: string;
	className?: string;
	error?: string;
}

const InputField = ({ name, label, className, error, ...options }: Props) => {
	return (
		<div className={styles.input}>
			{!!label && (
				<label className={styles.input_label} htmlFor={name}>
					{label}
				</label>
			)}

			<div className={`${styles.input_wrapper} ${className}`}>
				<input
					className={styles.input_field}
					name={name}
					autoComplete="off"
					{...options}
				/>
			</div>
			{!!error && (
				<label className={styles.input_label} style={{ color: "#FC0000" }}>
					{error}
				</label>
			)}
		</div>
	);
};

export default InputField;
