import { createContext } from "react";
import { MenuItem } from "./MenuItem";

export interface TopNavigation {
  menuItems: MenuItem[];
}

export const TopNavigationContext = createContext<TopNavigation | null>(null);
