export interface Distribution {
    [sectionId: string]: DistributionItem;
}

export interface DistributionItem {
    order: number;
    position: "left" | "right" | "FULL";
    visible: boolean;
    showIcon: boolean;
}