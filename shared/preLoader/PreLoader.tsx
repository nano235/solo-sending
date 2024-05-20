"use client";

import React from "react";
import styles from "./PreLoader.module.scss";
import { useGlobalContext } from "@/contexts/AppContext";

const PreLoader = () => {
	const { isPageLoading } = useGlobalContext();
	return <>{isPageLoading && <div className={styles.loader}></div>}</>;
};

export default PreLoader;
