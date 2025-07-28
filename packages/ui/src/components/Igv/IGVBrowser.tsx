// IGVBrowser.js
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
// @ts-ignore
import igv from "igv";
import { useAtom } from "jotai";
import ITrackInfo from "./ITrackInfo";

export interface IGVBrowserHandle {
  getBrowser: () => any;
  setROI: (roi: any[]) => void;
  setLocus: (locus: any[]) => void;
}

const IGVBrowser = forwardRef<
  IGVBrowserHandle,
  { locus: string; variantId?: string; igvTracksSetAtom: any }
>(({ locus, variantId, igvTracksSetAtom }, ref) => {
  const containerRef = useRef(null);
  const [hasRendered, setHasRendered] = useState(false);
  const [browserInitialized, setBrowserInitialized] = useState(false);
  const [tracksSet] = useAtom<ITrackInfo[]>(igvTracksSetAtom);
  const browserRef = useRef<any>(null);
  const prevTrackSet = useRef<ITrackInfo[]>(tracksSet);
  const pendingROIRef = useRef<any[] | null>(null);
  const pendingLocusRef = useRef<any[] | null>(null);

  // Function to apply ROI data to the browser
  const applyROI = (roi: any[]) => {
    if (!browserRef.current || !browserInitialized) return false;

    // Remove existing ROIs
    const existingROIs = browserRef.current.roi;
    if (existingROIs) {
      browserRef.current.removeROIs(existingROIs);
    }

    // Add new ROIs
    if (roi && roi.length > 0) {
      browserRef.current.loadROI(roi);
    }

    return true;
  };

  // Function to apply Locus Data to the browser
  const applyLocus = (locus: any[]) => {
    if (!browserRef.current || !browserInitialized) return false;
    browserRef.current.search(locus);
    return true;
  };

  // Expose the browser instance to parent components
  useImperativeHandle(ref, () => ({
    getBrowser: () => browserRef.current,
    setLocus: (locus: any[]) => {
      // Try to apply Locus immediately
      const applied = applyLocus(locus);

      // If not applied (browser not ready), queue it
      if (!applied) {
        pendingLocusRef.current = locus;
      }
    },
    setROI: (roi: any[]) => {
      // Try to apply ROI immediately
      const applied = applyROI(roi);

      // If not applied (browser not ready), queue it
      if (!applied) {
        pendingROIRef.current = roi;
      }
    },
  }));

  // Effect to apply pending ROI and Locus once browser is initialized
  useEffect(() => {
    if (
      browserInitialized &&
      browserRef.current &&
      pendingROIRef.current &&
      pendingLocusRef.current
    ) {
      applyROI(pendingROIRef.current);
      applyLocus(pendingLocusRef.current);
      pendingROIRef.current = null;
      pendingLocusRef.current = null;
    }
  }, [browserInitialized]);

  useEffect(() => {
    if (containerRef.current && !hasRendered && locus) {
      setHasRendered(true);

      let roi: any[] = [];
      if (variantId) {
        const [chr, pos, ref, alt] = variantId.split("_");
        roi = [
          {
            name: `Variant ${variantId}`,
            color: "rgba(94,255,1,0.5)",
            indexed: false,
            features: [
              {
                chr: `chr${chr}`,
                start: parseInt(pos) - 1,
                end: parseInt(pos) + ref.length - 1,
              },
            ],
          },
        ];
      }

      const browserOptions = {
        genome: "hg38",
        locus, // Use the passed locus prop here,
        roi,
      };

      const browserPromise: Promise<any> = igv.createBrowser(containerRef.current, browserOptions);
      browserPromise.then(browser => {
        browserRef.current = browser;
        setBrowserInitialized(true);
      });
    }
  }, [hasRendered, locus, variantId]);

  useEffect(() => {
    if (!browserInitialized || !browserRef.current) {
      return;
    }

    const newTracks = [...tracksSet];
    const oldTracks = prevTrackSet.current;

    // Add new tracks
    for (const [index, track] of newTracks.entries()) {
      if (!oldTracks.some(t => t.trackUrl === track.trackUrl)) {
        // Load the track based on its trackType
        const trackConfig = {
          name: `${createTrackName(track)} - ${track.trackType}`,
          url: track.trackUrl,
          height: 100,
          color: track.color,
          order: index,
        };

        // Add color based on track type
        switch (track.trackType) {
          case "DNase Signal":
            trackConfig.color = "#0000FF";
            break;
          case "ATAC Signal":
            trackConfig.color = "#0000FF";
            break;
          case "E2G Predictions":
            trackConfig.color = "#FF0000";
            trackConfig.height = 75;
            break;
          case "Elements":
            trackConfig.color = "rgb(83, 83, 83)";
            trackConfig.height = 50;
            break;
          default:
            trackConfig.color = "#888888";
        }

        browserRef.current.loadTrack(trackConfig);
      }
    }

    // Remove old tracks
    for (const track of oldTracks) {
      if (!newTracks.some(t => t.trackUrl === track.trackUrl)) {
        const trackToRemove = browserRef.current.trackViews.find(
          (trackView: any) => trackView.track.url === track.trackUrl
        );

        if (trackToRemove) {
          browserRef.current.removeTrack(trackToRemove.track);
        }
      }
    }

    prevTrackSet.current = tracksSet;
  }, [tracksSet, browserInitialized]);

  return <div ref={containerRef}></div>;
});

function createTrackName(track: ITrackInfo) {
  return `${track.cellTypeName} - ${track.study} ${track.model ? `(${track.model})` : ""}`;
}

export default IGVBrowser;
