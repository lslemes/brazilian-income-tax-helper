export const MONTHS = [
	{ value: 0, label: "January" },
	{ value: 1, label: "February" },
	{ value: 2, label: "March" },
	{ value: 3, label: "April" },
	{ value: 4, label: "May" },
	{ value: 5, label: "June" },
	{ value: 6, label: "July" },
	{ value: 7, label: "August" },
	{ value: 8, label: "September" },
	{ value: 9, label: "October" },
	{ value: 10, label: "November" },
	{ value: 11, label: "December" },
] as const;

export type MonthLabel = (typeof MONTHS)[number]["label"];
export type MonthValue = (typeof MONTHS)[number]["value"];

export const FLOATING_POINT_PRECISION = 11 as const;
