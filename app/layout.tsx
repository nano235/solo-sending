import type { Metadata } from "next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@/styles/index.scss";
import { Header, PreLoader } from "@/shared";
import styles from "./layout.module.scss";
import Providers from "@/contexts/providers";

export const metadata: Metadata = {
	title: "Solo Sending",
	description: "Send your ERC20 tokens",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<Providers>
					<PreLoader />
					<ToastContainer
						position="top-right"
						autoClose={2000}
						hideProgressBar={false}
						newestOnTop={false}
						closeOnClick
						rtl={false}
						pauseOnFocusLoss
						draggable
						pauseOnHover
						theme="dark"
					/>
					<Header />
					<main className={styles.main}>{children}</main>
				</Providers>
			</body>
		</html>
	);
}
