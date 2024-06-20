import type { Activity, Day } from "@cTypes/types";
import { atom, map } from "nanostores";

export const isPanelOpen = atom(false)

export interface InfoPanel extends Activity {
  color: Day['color']
  day: string
}

const initialState = {
  color: {},
  day: '',
  title: '',
  description: '',
  location: {
    city: '',
    name: '',
    maps: ''
  },
  category: '',
  time: '',
}

export const infoPanel = map<InfoPanel>(initialState)

export const openPanel = (data: InfoPanel) => {
  infoPanel.set(data)
  isPanelOpen.set(true)
}

export const closePanel = () => {
  isPanelOpen.set(false)
  infoPanel.set(initialState)
}

