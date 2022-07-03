export const createRandomRange = (randomNumber) => {
	return function random(min, max) {
		if (typeof min === "undefined") {
			min = 1;
		}
		if (typeof max === "undefined") {
			max = min;
			min = 0;
		}
		return randomNumber.next() * (max - min) + min;
	};
};
