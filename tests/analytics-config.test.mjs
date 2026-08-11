import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);

test("analytics integrations are opt-in and contain no hard-coded GTM container", () => {
	const analytics = fs.readFileSync(
		path.join(rootDir, "src/layouts/partials/AnalyticsScripts.astro"),
		"utf8",
	);
	const layout = fs.readFileSync(
		path.join(rootDir, "src/layouts/Layout.astro"),
		"utf8",
	);

	assert.doesNotMatch(analytics, /GTM-[A-Z0-9]+/);
	assert.doesNotMatch(layout, /GTM-[A-Z0-9]+/);
	assert.match(analytics, /thirdPartyAnalytics\.enable && gtmId/);
	assert.match(layout, /thirdPartyAnalytics\?\.enable/);
});
