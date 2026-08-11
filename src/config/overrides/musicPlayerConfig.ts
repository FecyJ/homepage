import type { DeepPartial, MusicPlayerConfig } from "../../types/config";

export default {
	enable: false,
	showFloatingPlayer: false,
} satisfies DeepPartial<MusicPlayerConfig>;
