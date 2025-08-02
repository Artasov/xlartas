import React from "react";

export interface Skill {
    name: string;
    Icon: React.ComponentType<{ size?: number; color?: string }>;
    color?: string;
    scale?: number;
}