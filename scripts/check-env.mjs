import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadEnv } from "./load-env.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const minimumNode = [22, 12, 0];
const currentNode = process.versions.node.split(".").map(Number);

function isAtLeast(current, minimum) {
	for (let index = 0; index < minimum.length; index += 1) {
		if (current[index] > minimum[index]) return true;
		if (current[index] < minimum[index]) return false;
	}
	return true;
}

if (!isAtLeast(currentNode, minimumNode)) {
	console.error(
		`Node.js ${minimumNode.join(".")} or newer is required; current: ${process.versions.node}`,
	);
	process.exit(1);
}

loadEnv();

const syncValue = process.env.ENABLE_CONTENT_SYNC;
if (syncValue !== undefined && !["true", "false"].includes(syncValue)) {
	console.error("ENABLE_CONTENT_SYNC must be either true or false.");
	process.exit(1);
}

if (syncValue === "true" && !process.env.CONTENT_REPO_URL) {
	console.error("CONTENT_REPO_URL is required when content sync is enabled.");
	process.exit(1);
}

const envStatus = fs.existsSync(path.join(rootDir, ".env"))
	? ".env loaded"
	: ".env not found; safe local defaults will be used";

console.log(`Node.js ${process.versions.node} OK`);
console.log("pnpm 11.5.3+ is required by package.json");
console.log(envStatus);
console.log(`Content sync: ${syncValue === "true" ? "enabled" : "disabled"}`);
