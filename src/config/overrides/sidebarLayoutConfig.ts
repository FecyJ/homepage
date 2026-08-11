import type { DeepPartial, SidebarLayoutConfig } from "../../types/config";

export default {
	components: {
		left: ["profile", "tags", "card-toc"],
		right: ["site-stats", "categories"],
		drawer: ["profile", "categories", "tags"],
	},
} satisfies DeepPartial<SidebarLayoutConfig>;
