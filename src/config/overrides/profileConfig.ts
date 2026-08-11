import type { DeepPartial, ProfileConfig } from "../../types/config";

/** 正式发布前替换这里的姓名、简介、头像和社交链接。 */
export default {
	avatar: "/assets/home/default-logo.webp",
	name: "站点主人",
	bio: "记录学习、项目与生活",
	links: [],
} satisfies DeepPartial<ProfileConfig>;
