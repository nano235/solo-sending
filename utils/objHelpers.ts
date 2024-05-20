export function findKeyByValue(
	obj: { [key: string]: any },
	value: any
): string | undefined {
	for (const [key, val] of Object.entries(obj)) {
		if (val === value) {
			return key;
		}
	}
	return undefined;
}
