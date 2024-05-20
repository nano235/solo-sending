"use client";

import { HistoryTable } from "@/components/history";
import styles from "./page.module.scss";

export default function History() {
	return (
		<section className={styles.section}>
			<HistoryTable />
		</section>
	);
}
