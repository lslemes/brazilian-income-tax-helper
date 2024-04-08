import { MonthLabel } from "../utils";

export default class Darf {
	constructor(
		private readonly year: number,
		private readonly month: MonthLabel,
		private readonly value: number,
	) {}
}
