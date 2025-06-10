import { atom } from "jotai";
import ITrackInfo from "./ITrackInfo";

export const igvTracksSet = atom<Array<ITrackInfo>>([]);
