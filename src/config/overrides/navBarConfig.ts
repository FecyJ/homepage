import type { DeepPartial, NavBarConfig } from "../../types/config";
import { LinkPreset } from "../../types/config";

export default {
	links: [LinkPreset.Home, LinkPreset.Archive, LinkPreset.About],
} satisfies DeepPartial<NavBarConfig>;
