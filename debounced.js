const Debounced = (callback, duration, immediate) => {
	let timeout;
	return (...args) => {
		const later = () => {
			timeout = null;
			if (!immediate) callback(...args);
		};
		const callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, duration);
		if (callNow) callback(...args);
	};
};

export default Debounced;