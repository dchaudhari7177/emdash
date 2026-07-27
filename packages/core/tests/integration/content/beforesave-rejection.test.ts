import { afterEach, beforeEach, expect } from "vitest";

import type { EmDashRuntime } from "../../../src/emdash-runtime.js";
import type { ResolvedPlugin } from "../../../src/plugins/types.js";
import { SchemaRegistry } from "../../../src/schema/registry.js";
import { createTestRuntime } from "../../utils/mcp-runtime.js";
import {
	describeEachDialect,
	setupForDialect,
	teardownForDialect,
	type DialectTestContext,
} from "../../utils/test-db.js";

// A trusted plugin whose content:beforeSave hook throws to cancel the save.
const rejectingPlugin: ResolvedPlugin = {
	id: "rejecter",
	version: "1.0.0",
	capabilities: ["content:write"],
	allowedHosts: [],
	storage: {},
	routes: {},
	admin: { pages: [], widgets: [] },
	hooks: {
		"content:beforeSave": {
			pluginId: "rejecter",
			handler: async () => {
				throw new Error("rejected for testing");
			},
			priority: 100,
			timeout: 5000,
			dependencies: [],
			errorPolicy: "abort",
			exclusive: false,
		},
	},
};

describeEachDialect("content:beforeSave rejection", (dialect) => {
	let ctx: DialectTestContext;
	let runtime: EmDashRuntime;

	beforeEach(async () => {
		ctx = await setupForDialect(dialect);
		const registry = new SchemaRegistry(ctx.db);
		await registry.createCollection({ slug: "posts", label: "Posts" });
		await registry.createField("posts", { slug: "title", label: "Title", type: "string" });
		runtime = createTestRuntime(ctx.db, { plugins: [rejectingPlugin] });
	});

	afterEach(async () => {
		await teardownForDialect(ctx);
	});

	it("surfaces a beforeSave throw as a structured error, not an unhandled crash", async () => {
		const result = await runtime.handleContentCreate("posts", {
			slug: "p1",
			data: { title: "p1" },
		});
		expect(result.success).toBe(false);
		if (result.success) return;
		expect(result.error.code).toBe("BEFORE_SAVE_REJECTED");
		expect(result.error.message).toBe("rejected for testing");
	});
});
