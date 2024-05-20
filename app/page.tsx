import styles from "./page.module.scss";
import { TransferCard } from "@/components/transfer";

export default function Home() {
	return (
		<section className={styles.section}>
			<TransferCard />
		</section>
	);
}
