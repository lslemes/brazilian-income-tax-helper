import { MonthLabel } from "../utils";

export default class Darf {
	constructor(
		private readonly year: number,
		private readonly month: MonthLabel, // mudar para receber um Month
		private readonly value: number,
	) {}
}
