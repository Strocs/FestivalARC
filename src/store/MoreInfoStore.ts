import type { Activity } from "@cTypes/types";
import { atom, map } from "nanostores";

export const isPanelOpen = atom(false)

export const infoPanel = map<Activity | {}>({})

export const openPanel = (data: Activity) => {
  infoPanel.set(data)
  isPanelOpen.set(true)
}

export const closePanel = () => {
  isPanelOpen.set(false)
  infoPanel.set({})
}

