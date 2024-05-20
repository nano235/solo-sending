"use client";

import { useEffect, useState } from "react";

interface TimerProps {
	initialTime: number; //This is in seconds
}

const Timer: React.FC<TimerProps> = ({ initialTime }) => {
	const [time, setTime] = useState(initialTime);

	useEffect(() => {
		setTime(initialTime);
	}, [initialTime]);

	useEffect(() => {
		let timerId: NodeJS.Timeout;

		if (time > 0) {
			timerId = setInterval(() => {
				setTime(prevTime => prevTime - 1);
			}, 1000);
		}

		return () => clearInterval(timerId);
	}, [time]);

	const formatTime = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(
			2,
			"0"
		)}`;
	};

	return formatTime(time);
};

export default Timer;
