import { CSSProperties } from "react";
import styles from "./Loader.module.scss";

interface Props {
	className?: string;
	style?: CSSProperties;
}

const Loader = ({ className, style }: Props) => {
	return <div className={`${styles.loader} ${className}`} style={style}></div>;
};

export default Loader;
