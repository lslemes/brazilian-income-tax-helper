/* eslint-disable @typescript-eslint/no-explicit-any */
import { InternationalDividendTransaction } from "./InternationalDividendTransaction";

const CLASS_NAME = InternationalDividendTransaction.name;
describe(CLASS_NAME, () => {
	it("should throw an error when dividend value is not positive", () => {
		const ANYTHING: any = undefined;
		expect(() => new InternationalDividendTransaction(ANYTHING, ANYTHING, 0)).toThrow(
			`${CLASS_NAME} value 0 must be positive.`,
		);
		expect(() => new InternationalDividendTransaction(ANYTHING, ANYTHING, -1)).toThrow(
			`${CLASS_NAME} value -1 must be positive.`,
		);
	});
});
