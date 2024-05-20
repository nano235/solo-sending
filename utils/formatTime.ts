export const formatTime = (date: number | string, is12HourFormat: boolean = true) => {
	// Handle both epoch and ISO string
	const time = new Date(typeof date === "number" ? date : Date.parse(date));
	let hours = time.getHours();
	const minutes = time.getMinutes();
	let period = "";

	if (is12HourFormat) {
		// Convert to 12-hour format
		period = hours >= 12 ? "PM" : "AM";
		hours = hours % 12 || 12; // Handle midnight (12 AM)
	}

	// Ensure leading zero for single-digit minutes
	const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

	return `${hours}:${formattedMinutes} ${period}`;
};

export const formatDate = (date: number | string, separator: string = "/") => {
	// Handle both epoch and ISO string
	const time = new Date(typeof date === "number" ? date : Date.parse(date));
	const year = time.getFullYear();
	const month = (time.getMonth() + 1).toString().padStart(2, "0");
	const day = time.getDate().toString().padStart(2, "0");

	return `${year}${separator}${month}${separator}${day}`;
};
