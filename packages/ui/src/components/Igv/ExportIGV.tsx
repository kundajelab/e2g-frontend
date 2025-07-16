import React, { useEffect, useState } from "react";
import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useAtom } from "jotai";
import IGVBrowser, { IGVBrowserHandle } from "./IGVBrowser";
import { BGZip } from "igv-utils";

const exclusionFn = (track: any) => {
  return !["wig", "annotation", "interact"].includes(track.type) || track.format === "refgene";
};

const ExportIGVSession: React.FC<{
  igvBrowserRef: React.RefObject<IGVBrowserHandle>;
  sessionData: string | null;
  hideImport?: boolean;
  igvTracksSetAtom: any;
}> = ({ igvBrowserRef, sessionData, hideImport = false, igvTracksSetAtom }) => {
  const [tracksSet, setTracksSet] = useAtom(igvTracksSetAtom);
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [openLinkDialog, setOpenLinkDialog] = useState(false);
  const [shareableLink, setShareableLink] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const linkInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sessionData) {
      const session = JSON.parse(BGZip.uncompressString(sessionData));
      importSessionFromJSON(session);
    }
  }, [sessionData]);

  const exportSession = () => {
    const session = igvBrowserRef.current?.getBrowser()?.toJSON();
    let i = 1;
    for (const track of session.tracks) {
      if (exclusionFn(track)) {
        continue;
      }
      track.order = i;
      const correspondingTrack = tracksSet.find(t => t.trackUrl === track.url);
      track.metadata = {
        cellTypeID: correspondingTrack?.cellTypeID || "unknown",
        cellTypeName: correspondingTrack?.cellTypeName || "Unknown",
        study: correspondingTrack?.study || "Imported",
        trackType: correspondingTrack?.trackType || inferTrackType(track.url),
        model: correspondingTrack?.model || null,
      };
      i++;
    }
    return session;
  };

  const exportCompressedSession = () => {
    const session = exportSession();
    const compressedSession = BGZip.compressString(JSON.stringify(session));
    return compressedSession;
  };

  const importSessionFromJSON = (session: any) => {
    const importedTracks = [];
    for (const track of session.tracks) {
      if (exclusionFn(track)) {
        continue;
      }
      importedTracks.push({
        cellTypeID: track.metadata?.cellTypeID || "unknown",
        cellTypeName: track.metadata?.cellTypeName || track.name.split(" - ")[0] || "Unknown",
        study: track.metadata?.study || "Imported",
        studyUrl: "",
        trackUrl: track.url,
        trackType: track.metadata?.trackType || inferTrackType(track.url),
        model: track.metadata?.model || null,
        color: track.color,
      });
    }
    setTracksSet(importedTracks);

    // Restore ROIs if they exist in the session
    if (session.roi && igvBrowserRef.current) {
      igvBrowserRef.current.setROI(session.roi);
    }
    
    // Restore the Locus Session Data (Locus should always be present)
    if (session.locus && igvBrowserRef.current) {
      igvBrowserRef.current.setLocus(session.locus);
    }
  };

  const exportSessionAsFile = () => {
    const session = exportSession();
    const blob = new Blob([JSON.stringify(session)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "IGV_session.json";
    link.click();
    URL.revokeObjectURL(url);
    setOpenExportDialog(false);
  };

  const createShareableLink = async () => {
    const baseUrl = window.location.origin;
    const compressedSession = exportCompressedSession();
    const url = new URL(baseUrl);
    url.pathname = "/igv";
    url.searchParams.set("session", compressedSession);

    const linkText = url.toString();
    setShareableLink(linkText);

    try {
      // Check if clipboard API is available
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(linkText);
        alert("Shareable IGV link copied to clipboard!");
        setOpenExportDialog(false);
      } else {
        // Fallback: Create a temporary textarea element to copy text
        const textArea = document.createElement("textarea");
        textArea.value = linkText;
        // Make the textarea out of viewport
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (successful) {
          alert("Shareable IGV link copied to clipboard!");
          setOpenExportDialog(false);
        } else {
          // If execCommand also fails, show the link dialog
          setOpenExportDialog(false);
          setOpenLinkDialog(true);
        }
      }
    } catch (err) {
      console.error("Failed to copy link:", err);
      // Show the link dialog
      setOpenExportDialog(false);
      setOpenLinkDialog(true);
    }
  };

  const attemptCopyFromDialog = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(shareableLink)
          .then(() => {
            alert("Link copied to clipboard!");
          })
          .catch(() => {
            // If clipboard API fails, try execCommand
            if (linkInputRef.current) {
              linkInputRef.current.select();
              document.execCommand("copy");
              alert("Link copied to clipboard!");
            }
          });
      } else if (linkInputRef.current) {
        linkInputRef.current.select();
        const successful = document.execCommand("copy");
        if (successful) {
          alert("Link copied to clipboard!");
        }
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleImportSession = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const session = JSON.parse(e.target?.result as string);
        importSessionFromJSON(session);
        setOpenImportDialog(false);
      } catch (error) {
        console.error("Error importing session:", error);
        alert("Failed to import session file. Please ensure it is a valid IGV session JSON.");
      }
    };
    reader.readAsText(file);
  };

  const inferTrackType = (url: string): string => {
    const fileExtension = url.split(".").pop()?.split("?")[0]?.toLowerCase() || "";

    switch (fileExtension) {
      case "bw":
      case "bigwig":
        return "Signal";
      case "bedpe":
        return "Interaction";
      case "bed":
        return "Elements";
      case "bb":
      case "bigbed":
        return "Annotation";
      default:
        return "Track";
    }
  };

  return (
    <>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          onClick={() => setOpenExportDialog(true)}
          sx={{ mr: 1, color: "white" }}
        >
          Export Session
        </Button>
        {!hideImport && (
          <Button
            variant="contained"
            onClick={() => setOpenImportDialog(true)}
            sx={{ color: "white" }}
          >
            Import Session
          </Button>
        )}
      </Box>

      {/* Export Dialog */}
      <Dialog open={openExportDialog} onClose={() => setOpenExportDialog(false)}>
        <DialogTitle>Export Session</DialogTitle>
        <DialogContent>Choose how you would like to export your session:</DialogContent>
        <DialogActions>
          <Button onClick={exportSessionAsFile}>Download JSON</Button>
          <Button onClick={createShareableLink}>Copy Link</Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      {!hideImport && (
        <Dialog open={openImportDialog} onClose={() => setOpenImportDialog(false)}>
          <DialogTitle>Import Session</DialogTitle>
          <DialogContent>Choose how you would like to import your session:</DialogContent>
          <DialogActions>
            <Button component="label">
              From JSON
              <input
                type="file"
                hidden
                accept=".json"
                onChange={handleImportSession}
                ref={fileInputRef}
              />
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Link Dialog */}
      <Dialog
        open={openLinkDialog}
        onClose={() => setOpenLinkDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Shareable IGV Link</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Copy this link to share your IGV session:
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <TextField
              fullWidth
              variant="outlined"
              value={shareableLink}
              inputRef={linkInputRef}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <IconButton onClick={attemptCopyFromDialog} edge="end">
                    <ContentCopyIcon />
                  </IconButton>
                ),
              }}
              onClick={e => (e.target as HTMLInputElement).select()}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLinkDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExportIGVSession;
