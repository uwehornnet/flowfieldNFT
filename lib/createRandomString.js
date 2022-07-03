function index(min, max) {
	// min and max included
	return Math.floor(Math.random() * (max - min + 1) + min);
}

export const createRandomString = () => {
	const multiplicator = [10000, 100000, 1000000];
	const i = index(0, multiplicator.length - 1);
	const randomNumer = Math.random() * multiplicator[i];
	return Math.floor(randomNumer).toString();
};
