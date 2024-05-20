import styles from "./Title.module.scss";

interface Props {
	title?: string;
	description?: string;
	className?: string;
	type?: "small" | "medium" | "large";
}

const Title = ({ title, description, className, type = "small" }: Props) => {
	return (
		<div className={`${styles.title} ${className}`} data-type={type}>
			<h1>{title}</h1>
			<p>{description}</p>
		</div>
	);
};

export default Title;
