import React from "react";
import { Link, OtTable } from "ui";
import { IconButton, Tooltip, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useAtom } from "jotai";
import ITrackInfo from "./ITrackInfo";

type DataTableProps = {
  loading: boolean;
  error: any;
  data: any[];
  filenameStem: string;
  igvTracksSetAtom: any;
};

const DataTrackTable: React.FC<DataTableProps> = ({
  loading,
  error,
  data,
  filenameStem,
  igvTracksSetAtom,
}) => {
  const [tracksSet, setTracksSet] = useAtom(igvTracksSetAtom);

  // Add all tracks for the specific cellTypeId/study combination
  const addAllTracksForRow = (study: string, cellTypeId: string) => {
    setTracksSet(prevTrackSet => {
      const newTrackSet: ITrackInfo[] = [...prevTrackSet];
      data.forEach(track => {
        if (track.study === study && track.cellTypeId === cellTypeId) {
          // Create a track for each available URL

          if (
            track.e2gPredictionsUrl &&
            !newTrackSet.some(t => t.trackUrl === track.e2gPredictionsUrl)
          ) {
            const trackInfo: ITrackInfo = {
              cellTypeID: track.cellTypeId,
              cellTypeName: track.cellType,
              study: track.study,
              studyUrl: track.paperUrl || "",
              trackUrl: track.e2gPredictionsUrl,
              trackType: "E2G Predictions",
              model: track.modelType,
            };
            newTrackSet.push(trackInfo);
          }

          if (track.dnaseSignalUrl && !newTrackSet.some(t => t.trackUrl === track.dnaseSignalUrl)) {
            const trackInfo: ITrackInfo = {
              cellTypeID: track.cellTypeId,
              cellTypeName: track.cellType,
              study: track.study,
              studyUrl: track.paperUrl || "",
              trackUrl: track.dnaseSignalUrl,
              trackType: "DNase Signal",
              model: track.modelType,
            };
            newTrackSet.push(trackInfo);
          }

          if (track.atacSignalUrl && !newTrackSet.some(t => t.trackUrl === track.atacSignalUrl)) {
            const trackInfo: ITrackInfo = {
              cellTypeID: track.cellTypeId,
              cellTypeName: track.cellType,
              study: track.study,
              studyUrl: track.paperUrl || "",
              trackUrl: track.atacSignalUrl,
              trackType: "ATAC Signal",
              model: track.modelType,
            };
            newTrackSet.push(trackInfo);
          }

          if (track.elementsUrl && !newTrackSet.some(t => t.trackUrl === track.elementsUrl)) {
            const trackInfo: ITrackInfo = {
              cellTypeID: track.cellTypeId,
              cellTypeName: track.cellType,
              study: track.study,
              studyUrl: track.paperUrl || "",
              trackUrl: track.elementsUrl,
              trackType: "Elements",
              model: track.modelType,
            };
            newTrackSet.push(trackInfo);
          }
        }
      });
      return newTrackSet;
    });
  };

  const removeAllTracksForRow = (study: string, cellTypeId: string) => {
    setTracksSet(prevTrackSet => {
      return prevTrackSet.filter(t => !(t.study === study && t.cellTypeID === cellTypeId));
    });
  };

  // Prepare data for display - group by cellTypeId and study
  const prepareTableData = () => {
    const uniqueRows = new Map();

    data.forEach(track => {
      const key = `${track.cellTypeId}-${track.study}`;
      if (!uniqueRows.has(key)) {
        uniqueRows.set(key, track);
      }
    });

    return Array.from(uniqueRows.values());
  };

  // Table is now defined here
  const tableColumns = [
    {
      id: "addAll",
      label: "Add Tracks",
      renderCell: (rowData: any) => {
        const isTrackAdded = Array.from(tracksSet).some(
          t => t.study === rowData.study && t.cellTypeID === rowData.cellTypeId
        );
        return (
          <IconButton
            onClick={() =>
              isTrackAdded
                ? removeAllTracksForRow(rowData.study, rowData.cellTypeId)
                : addAllTracksForRow(rowData.study, rowData.cellTypeId)
            }
          >
            {isTrackAdded ? <RemoveIcon /> : <AddIcon />}
          </IconButton>
        );
      },
    },
    {
      id: "cellType",
      label: "Cell Type",
      renderCell: (rowData: any) => (
        <Tooltip title={`Cell Type ID: ${rowData.cellTypeId}`} placement="top">
          <span>{rowData.cellType}</span>
        </Tooltip>
      ),
    },
    {
      id: "study",
      label: "Study",
      renderCell: (rowData: any) => rowData.study,
    },
    {
      id: "model",
      label: "Model",
      renderCell: (rowData: any) => rowData.modelType || "N/A",
    },
    {
      id: "dataset",
      label: "Dataset",
      renderCell: (rowData: any) => {
        let url = rowData.datasetUrl;
        if (!url && rowData.dataset?.startsWith("ENCSR")) {
          url = `https://www.encodeproject.org/experiments/${rowData.dataset}`;
        }
        return url ? (
          <Link to={url} external newTab>
            {rowData.dataset || "N/A"}
          </Link>
        ) : (
          rowData.dataset || "N/A"
        );
      },
    },
    /*
    {
      id: 'tracks',
      label: 'Tracks',
      renderCell: (rowData: any) => (
        <>
          <IconButton onClick={() => toggleExpand(`${rowData.study}-${rowData.cellTypeId}`)}>
            <ExpandMoreIcon />
          </IconButton>
          
          <Collapse in={expandedRows.has(`${rowData.study}-${rowData.cellTypeId}`)} timeout="auto" unmountOnExit>
            <Table size="small">
              <TableBody>
                {data
                  .filter(
                    (track: DataTrack) =>
                      track.study === rowData.study && track.cellTypeId === rowData.cellTypeId
                  )
                  .map((track: DataTrack) => {
                    // Create a list of available tracks for this cell type/study
                    const availableTracks = [];
                    
                    if (track.dnaseSignalUrl) {
                      availableTracks.push({
                        type: 'DNase Signal',
                        url: track.dnaseSignalUrl
                      });
                    }
                    
                    if (track.atacSignalUrl) {
                      availableTracks.push({
                        type: 'ATAC Signal',
                        url: track.atacSignalUrl
                      });
                    }
                    
                    if (track.e2gPredictionsUrl) {
                      availableTracks.push({
                        type: 'E2G Predictions',
                        url: track.e2gPredictionsUrl
                      });
                    }
                    
                    if (track.variantPredsUrl) {
                      availableTracks.push({
                        type: 'Variant Predictions',
                        url: track.variantPredsUrl
                      });
                    }
                    
                    if (track.elementsUrl) {
                      availableTracks.push({
                        type: 'Elements',
                        url: track.elementsUrl
                      });
                    }
                    
                    return availableTracks.map((availableTrack) => {
                      const trackInfo: ITrackInfo = {
                        cellTypeID: track.cellTypeId,
                        cellTypeName: track.cellType,
                        study: track.study,
                        studyUrl: track.paperUrl || '',
                        trackUrl: availableTrack.url,
                        trackType: availableTrack.type,
                        model: track.modelType,
                      };

                      // Check if this specific track is in the tracksSet
                      const isTrackAdded = Array.from(tracksSet).some(
                        (t) => t.trackUrl === trackInfo.trackUrl
                      );

                      return (
                        <TableRow key={availableTrack.url}>
                          <TableCell>
                            {availableTrack.type}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => isTrackAdded ? removeTrack(trackInfo) : addTrack(trackInfo)}
                              size="small"
                              color="primary"
                            >
                              {isTrackAdded ? <RemoveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <IconButton href={availableTrack.url} target="_blank" rel="noopener noreferrer">
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    });
                  })}
              </TableBody>
            </Table>
          </Collapse>
        </>
      ),
    },
    */
  ];

  return (
    <Box>
      <div style={{ margin: "16px" }}>
        <OtTable
          loading={loading}
          error={error}
          columns={tableColumns}
          rows={prepareTableData()}
          sortBy="cellType"
          order="asc"
          dataDownloader={true}
          dataDownloaderFileStem={filenameStem}
          pageSize={100}
          staticColumns={false}
          staticRows={false}
        />
      </div>
    </Box>
  );
};

export default DataTrackTable;
