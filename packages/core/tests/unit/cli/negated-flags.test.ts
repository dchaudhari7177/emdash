/**
 * citty reads any `--no-<name>` token as the negation of `<name>`. A boolean declared as
 * "no-<name>" is therefore never set from the command line (#2928), so these commands
 * declare the positive flag and read `false` from it.
 */

import { parseArgs } from "citty";
import { describe, it, expect } from "vitest";

import { publishCommand } from "../../../src/cli/commands/publish.js";
import { seedCommand } from "../../../src/cli/commands/seed.js";

const commands = { seed: seedCommand, publish: publishCommand };

describe("negated CLI flags", () => {
	it.each([
		["seed", "content"],
		["publish", "wait"],
	] as const)("%s --no-%s parses to false, and the flag defaults on", (name, flag) => {
		const args = commands[name].args!;

		expect(parseArgs([], args)[flag]).toBe(true);
		expect(parseArgs([`--no-${flag}`], args)[flag]).toBe(false);
	});

	it.each(Object.entries(commands))("%s declares no boolean named no-*", (_name, command) => {
		const negated = Object.entries(command.args!).filter(
			([key, def]) => key.startsWith("no-") && def.type === "boolean",
		);

		expect(negated.map(([key]) => key)).toEqual([]);
	});
});
