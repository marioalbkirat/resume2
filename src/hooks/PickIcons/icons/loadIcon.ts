import type { IconType } from "react-icons";
import { ICON_COMPONENT_NAME_BY_NAME, ICON_PACK_BY_NAME, type IconPack } from "./index";

type IconModule = Record<string, IconType>;

const iconModuleLoaders: Record<IconPack, () => Promise<IconModule>> = {
    fa: () => import("react-icons/fa") as unknown as Promise<IconModule>,
    si: () => import("react-icons/si") as unknown as Promise<IconModule>,
    io5: () => import("react-icons/io5") as unknown as Promise<IconModule>,
    io: () => import("react-icons/io") as unknown as Promise<IconModule>,
    tb: () => import("react-icons/tb") as unknown as Promise<IconModule>,
    bi: () => import("react-icons/bi") as unknown as Promise<IconModule>,
    pi: () => import("react-icons/pi") as unknown as Promise<IconModule>,
    bs: () => import("react-icons/bs") as unknown as Promise<IconModule>,
    md: () => import("react-icons/md") as unknown as Promise<IconModule>,
    fa6: () => import("react-icons/fa6") as unknown as Promise<IconModule>,
    di: () => import("react-icons/di") as unknown as Promise<IconModule>,
    vsc: () => import("react-icons/vsc") as unknown as Promise<IconModule>,
    gr: () => import("react-icons/gr") as unknown as Promise<IconModule>,
};

const iconCache = new Map<string, IconType | null>();

export const loadIconComponent = async (iconName: string) => {
    if (iconCache.has(iconName)) return iconCache.get(iconName) ?? null;

    const iconPack = ICON_PACK_BY_NAME[iconName];
    if (!iconPack) {
        iconCache.set(iconName, null);
        return null;
    }

    const iconModule = await iconModuleLoaders[iconPack]();
    const componentName = ICON_COMPONENT_NAME_BY_NAME[iconName] ?? iconName.trim();
    const Icon = iconModule[componentName] ?? null;
    iconCache.set(iconName, Icon);
    return Icon;
};
