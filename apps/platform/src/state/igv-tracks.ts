import { atom } from "jotai";
import { ITrackInfo } from "ui";

export const igvTracksSet = atom<Array<ITrackInfo>>([]);
