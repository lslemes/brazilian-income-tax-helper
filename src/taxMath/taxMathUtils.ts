export function getUpdatedAveragePrice(
	currentPosition: number,
	currentAveragePrice: number,
	positionIncrement: number,
	valueIncrement: number,
): number {
	if (currentPosition < 0) throw new Error(`Current position ${currentPosition} must not be negative.`);
	if (currentAveragePrice < 0) throw new Error(`Current average price ${currentAveragePrice} must not be negative.`);
	if (positionIncrement <= 0) throw new Error(`Position increment ${positionIncrement} must be positive.`);
	if (valueIncrement < 0) throw new Error(`Value increment ${valueIncrement} must not be negative.`);
	return (currentPosition * currentAveragePrice + valueIncrement) / (currentPosition + positionIncrement);
}

export function getMonetaryValue(value: number): number {
	return Number(value.toFixed(2));
}
