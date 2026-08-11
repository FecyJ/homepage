import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "./load-env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

loadEnv();
console.log("已加载 .env 配置文件\n");

// 从环境变量读取配置
const ENABLE_CONTENT_SYNC = process.env.ENABLE_CONTENT_SYNC === "true"; // 仅显式设置 true 时启用
const CONTENT_REPO_URL = process.env.CONTENT_REPO_URL || "";
const CONTENT_DIR = process.env.CONTENT_DIR || path.join(rootDir, "content");

console.log("开始同步内容...\n");

// 检查是否启用内容分离
if (!ENABLE_CONTENT_SYNC) {
	console.log("内容分离功能已关闭（ENABLE_CONTENT_SYNC=false）");
	console.log("提示：将使用本地内容，不会从远程仓库同步");
	console.log("      若要启用内容分离，请在 .env 中设置：");
	console.log("      ENABLE_CONTENT_SYNC=true");
	console.log("      CONTENT_REPO_URL=<your-repo-url>\n");
	process.exit(0);
}

// 检查内容目录是否存在
if (!fs.existsSync(CONTENT_DIR)) {
	console.log(`内容目录不存在：${CONTENT_DIR}`);
	console.log("将使用独立仓库模式");

	if (!CONTENT_REPO_URL) {
		console.error("错误：启用内容同步后必须设置 CONTENT_REPO_URL");
		process.exit(1);
	}

	try {
		console.log(`正在克隆内容仓库：${CONTENT_REPO_URL}`);
		execFileSync("git", ["clone", "--depth", "1", CONTENT_REPO_URL, CONTENT_DIR], {
			stdio: "inherit",
			cwd: rootDir,
		});
		console.log("内容仓库克隆成功");
	} catch (error) {
		console.error("克隆失败：", error.message);
		process.exit(1);
	}
} else {
	console.log(`内容目录已存在：${CONTENT_DIR}`);

	if (fs.existsSync(path.join(CONTENT_DIR, ".git"))) {
		try {
			const superproject = execFileSync(
				"git",
				["rev-parse", "--show-superproject-working-tree"],
				{ cwd: CONTENT_DIR, encoding: "utf8" },
			).trim();

			if (superproject) {
				console.log("检测到 Git Submodule，内容版本由主仓库 checkout 管理");
			} else {
				const changes = execFileSync("git", ["status", "--porcelain"], {
					cwd: CONTENT_DIR,
					encoding: "utf8",
				}).trim();

				if (changes) {
					throw new Error(
						"内容仓库存在未提交修改；请先提交或暂存，再重新同步",
					);
				}

				console.log("正在以 fast-forward 模式同步远程内容...");
				execFileSync("git", ["pull", "--ff-only"], {
					stdio: "inherit",
					cwd: CONTENT_DIR,
				});
				console.log("内容同步成功");
			}
		} catch (error) {
			console.error("内容更新失败：", error.message);
			process.exit(1);
		}
	}
}

// 创建符号链接或复制内容
console.log("\n正在建立内容链接...");

const contentMappings = [
	{ src: "posts", dest: "src/content/posts" },
	{ src: "spec", dest: "src/content/spec" },
	{ src: "data", dest: "src/data" },
	{ src: "images", dest: "public/images" },
	// 覆盖文件是带相对导入的 TS 模块，符号链接会被 Vite 解析到内容仓库真实
	// 路径导致找不到 types/config，因此复制进代码仓库而不是建链接
	{ src: "overrides", dest: "src/config/overrides", copy: true },
];

for (const mapping of contentMappings) {
	const srcPath = path.join(CONTENT_DIR, mapping.src);
	const destPath = path.join(rootDir, mapping.dest);

	if (!fs.existsSync(srcPath)) {
		// 内容仓库删掉 overrides/ 后清掉上次的副本，避免旧配置继续生效
		if (mapping.copy) {
			const stat = fs.lstatSync(destPath, { throwIfNoEntry: false });
			if (stat) {
				if (stat.isSymbolicLink()) {
					fs.unlinkSync(destPath);
				} else {
					fs.rmSync(destPath, { recursive: true, force: true });
				}
				console.log(`已清理失效的配置覆盖：${mapping.dest}`);
			}
		}
		console.log(`跳过不存在的源目录：${mapping.src}`);
		continue;
	}

	// 覆盖目录由本脚本复制维护，直接删除重建，不走备份逻辑
	if (mapping.copy) {
		const stat = fs.lstatSync(destPath, { throwIfNoEntry: false });
		if (stat) {
			if (stat.isSymbolicLink()) {
				fs.unlinkSync(destPath);
			} else {
				fs.rmSync(destPath, { recursive: true, force: true });
			}
		}
		copyRecursive(srcPath, destPath);
		console.log(`已复制配置覆盖：${mapping.src} -> ${mapping.dest}`);
		continue;
	}

	// 如果目标已存在且不是符号链接,备份它
	if (fs.existsSync(destPath) && !fs.lstatSync(destPath).isSymbolicLink()) {
		const backupPath = `${destPath}.backup`;
		console.log(
			`正在备份已有内容：${mapping.dest} -> ${mapping.dest}.backup`,
		);
		if (fs.existsSync(backupPath)) {
			fs.rmSync(backupPath, { recursive: true, force: true });
		}
		fs.renameSync(destPath, backupPath);
	}

	// 删除现有的符号链接
	if (fs.existsSync(destPath)) {
		fs.unlinkSync(destPath);
	}

	// 创建符号链接 (Windows 需要管理员权限,否则复制文件)
	try {
		const relPath = path.relative(path.dirname(destPath), srcPath);
		fs.symlinkSync(relPath, destPath, "junction");
		console.log(`已创建符号链接：${mapping.dest} -> ${mapping.src}`);
	} catch (error) {
		console.log(`符号链接失败，改为复制内容：${mapping.src} -> ${mapping.dest}`);
		copyRecursive(srcPath, destPath);
	}
}

console.log("\n内容同步完成\n");

// 递归复制函数
function copyRecursive(src, dest) {
	if (fs.statSync(src).isDirectory()) {
		if (!fs.existsSync(dest)) {
			fs.mkdirSync(dest, { recursive: true });
		}
		const files = fs.readdirSync(src);
		for (const file of files) {
			copyRecursive(path.join(src, file), path.join(dest, file));
		}
	} else {
		fs.copyFileSync(src, dest);
	}
}
