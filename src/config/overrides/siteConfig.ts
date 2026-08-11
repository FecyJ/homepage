import type { DeepPartial, SiteConfig } from "../../types/config";

/**
 * 个人站点配置入口。
 *
 * 这里只保存与上游默认值不同的字段，主题升级时新增配置会自动继承。
 * 正式部署前请至少替换 title、siteURL、navbarTitle.text 和首页文案。
 */
export default {
	title: "我的个人网站",
	subtitle: "记录学习、项目与生活",
	siteURL: "http://localhost:3000/",
	siteStartDate: "2026-08-11",
	timeZone: "Asia/Shanghai",
	lang: "zh_CN",
	featurePages: {
		anime: false,
		diary: false,
		friends: false,
		projects: false,
		skills: false,
		timeline: false,
		albums: false,
		devices: false,
		aiTools: false,
	},
	navbarTitle: {
		text: "个人网站",
	},
	banner: {
		homeText: {
			title: "欢迎来到我的个人空间",
			subtitle: ["记录所学", "分享思考", "持续创造"],
		},
	},
	toc: {
		useJapaneseBadge: false,
	},
} satisfies DeepPartial<SiteConfig>;
