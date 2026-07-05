"use client";

import { ComponentProps, useEffect, useState } from "react";
import type { IconType } from "react-icons";
import { loadIconComponent } from "./loadIcon";

type IconPreviewProps = ComponentProps<"svg"> & {
    name: string;
    fallbackClassName?: string;
};

export default function IconPreview({ name, fallbackClassName, ...props }: IconPreviewProps) {
    const [loadedIcon, setLoadedIcon] = useState<{ name: string; Icon: IconType | null }>({ name, Icon: null });

    useEffect(() => {
        let isMounted = true;
        void loadIconComponent(name).then((Icon) => {
            if (isMounted) setLoadedIcon({ name, Icon });
        });
        return () => {
            isMounted = false;
        };
    }, [name]);

    const Icon = loadedIcon.name === name ? loadedIcon.Icon : null;

    if (!Icon) {
        return <span aria-hidden className={fallbackClassName ?? props.className} />;
    }

    return <Icon {...props} />;
}
