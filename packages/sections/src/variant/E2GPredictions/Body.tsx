import { useQuery } from "@apollo/client";
import { IconButton, Typography } from "@mui/material";
import {
  Link,
  SectionItem,
  Tooltip,
  OtTable,
  IGVBrowser,
  IGVBrowserHandle,
  ExportIGVSession,
  ITrackInfo,
} from "ui";
import { definition } from "../E2GPredictions";
import Description from "../E2GPredictions/Description";
import E2G_PREDICTIONS_QUERY from "./E2GQuery.gql";
import { Add, Remove } from "@mui/icons-material";
import { atom, useAtom } from "jotai";
import { useEffect, useMemo, useRef } from "react";

export const igvTracksSet = atom<Array<ITrackInfo>>([]);

const tableColumns = (
  _variantId: string,
  igvTracks: ITrackInfo[] = [],
  addTrack: (track: ITrackInfo) => void = () => {},
  removeTrack: (track: ITrackInfo) => void = () => {}
) => [
  {
    id: "cellType",
    label: "Cell Type",
    renderCell: rowData => rowData.cellType,
    sortable: true,
  },
  {
    id: "targetGene",
    label: "Target Gene",
    renderCell: rowData => (
      <Link key={rowData.targetGene.id} to={`/target/${rowData.targetGene.id}`}>
        {rowData.targetGene.symbol}
      </Link>
    ),
    sortable: true,
    accessorFn: rowData => rowData.targetGene.symbol,
  },
  {
    id: "score",
    label: "Score",
    renderCell: rowData => rowData.score.toFixed(3),
    sortable: true,
  },
  {
    id: "dataset",
    label: "Dataset",
    renderCell: rowData => {
      const text = (
        <div style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
          {rowData.dataset.startsWith("ENCSR") ? (
            <Link to={`https://www.encodeproject.org/experiments/${rowData.dataset}`} external>
              {rowData.dataset}
            </Link>
          ) : (
            rowData.dataset
          )}
        </div>
      );
      if (rowData.dataset.length > 25) {
        return (
          <Tooltip title={text} placement="top">
            {text}
          </Tooltip>
        );
      }
      return text;
    },
    sortable: true,
  },
  {
    id: "model",
    label: "Model",
    renderCell: rowData => rowData.model || "N/A", // Default to 'N/A' if model is missing
    sortable: true,
  },
  // {
  //   id: 'variantGeneDistance',
  //   label: 'Variant-Gene Distance',
  //   renderCell: (rowData) =>
  //     rowData.variantToGeneDistance,
  // },
  {
    id: "enhancerStart",
    label: "Enhancer Start",
    renderCell: rowData => rowData.enhancerStart,
    sortable: true,
  },
  {
    id: "enhancerEnd",
    label: "Enhancer End",
    renderCell: rowData => rowData.enhancerEnd,
    sortable: true,
  },
  {
    id: "enhancerClass",
    label: "Enhancer Class",
    renderCell: rowData => rowData.enhancerClass,
    sortable: true,
  },
  {
    id: "enhancerGeneDistance",
    label: "E-G Distance",
    renderCell: rowData => rowData.enhancerToGeneDistance,
    sortable: true,
  },
  {
    id: "datatrack",
    label: "Add to IGV",
    renderCell: rowData => {
      if (rowData.datatrack) {
        const tracks: ITrackInfo[] = [
          {
            cellTypeID: rowData.cellType,
            cellTypeName: rowData.cellType,
            study: rowData.dataset,
            studyUrl: "",
            trackUrl: rowData.datatrack.e2gPredictionsUrl || "",
            trackType: "E2G Predictions",
            model: rowData.model,
          },

          {
            cellTypeID: rowData.cellType,
            cellTypeName: rowData.cellType,
            study: rowData.dataset,
            studyUrl: "",
            trackUrl: rowData.datatrack.atacSignalUrl || "",
            trackType: "ATAC Signal",
            model: rowData.model,
          },
          {
            cellTypeID: rowData.cellType,
            cellTypeName: rowData.cellType,
            study: rowData.dataset,
            studyUrl: "",
            trackUrl: rowData.datatrack.dnaseSignalUrl || "",
            trackType: "DNase Signal",
            model: rowData.model,
          },
          {
            cellTypeID: rowData.cellType,
            cellTypeName: rowData.cellType,
            study: rowData.dataset,
            studyUrl: "",
            trackUrl: rowData.datatrack.elementsUrl || "",
            trackType: "Elements",
            model: rowData.model,
          },
        ].filter(track => track.trackUrl !== "");

        const isTrackAdded = igvTracks.some(track => track.trackUrl === tracks[0].trackUrl);

        const addTracks = () => {
          tracks.forEach(track => addTrack(track));
        };

        const removeTracks = () => {
          tracks.forEach(track => removeTrack(track));
        };

        return (
          <IconButton onClick={() => (isTrackAdded ? removeTracks() : addTracks())}>
            {isTrackAdded ? <Remove /> : <Add />}
          </IconButton>
        );
      }
      return null;
    },
  },
];

type BodyProps = {
  id: string;
  entity: string;
};

export function Body({ id, entity }: BodyProps) {
  const igvBrowserRef = useRef<IGVBrowserHandle>(null);
  const variables = {
    variantId: id,
  };
  const [tracksSet, setTracksSet] = useAtom(igvTracksSet);
  const locus = useMemo(() => {
    const [chromosome, position] = id.split("_");
    const intPosition = parseInt(position);
    return `${chromosome}:${intPosition - 5000}-${intPosition + 5000}`;
  }, [id]);

  useEffect(() => {
    setTracksSet([]); // This will clear the set on component mount
  }, [setTracksSet]);

  const addTrack = (trackInfo: ITrackInfo) => {
    setTracksSet(prevTrackSet => Array.from(new Set(prevTrackSet).add(trackInfo)));
  };

  const removeTrack = (trackInfo: ITrackInfo) => {
    setTracksSet(prevTrackSet => {
      return prevTrackSet.filter(track => track.trackUrl !== trackInfo.trackUrl);
    });
  };

  const request = useQuery(E2G_PREDICTIONS_QUERY, {
    variables,
  });

  return (
    <SectionItem
      definition={definition}
      request={request}
      entity={entity}
      renderDescription={() => (
        <Description
          variantId={request.data?.variant.id}
          referenceAllele={request.data?.variant.referenceAllele}
          alternateAllele={request.data?.variant.alternateAllele}
        />
      )}
      renderBody={() => {
        let sortedRows = [];
        sortedRows = structuredClone(request.data?.variant.enhancerGenePredictions);
        sortedRows?.sort((a, b) => b.score - a.score);
        return (
          <>
            <OtTable
              columns={tableColumns(id, tracksSet, addTrack, removeTrack)}
              rows={sortedRows}
              dataDownloader
              query={E2G_PREDICTIONS_QUERY.loc.source.body}
              variables={variables}
              loading={request.loading}
              staticColumns={false}
              staticRows={false}
            />
            <Typography variant="h6">IGV Browser for Enhancer-Gene Model Predictions
            </Typography>
            <Typography paragraph>
              Select cell types to view in the Enhancer-Gene Model Predictions table above. See here
              to explore more cell types.
            </Typography>
            <ExportIGVSession
              igvBrowserRef={igvBrowserRef}
              sessionData={null}
              hideImport={true}
              igvTracksSetAtom={igvTracksSet}
            />
            <IGVBrowser
              key={`igv-browser-${id}`}
              locus={locus}
              variantId={id}
              ref={igvBrowserRef}
              igvTracksSetAtom={igvTracksSet}
            />
          </>
        );
      }}
    />
  );
}

export default Body;
