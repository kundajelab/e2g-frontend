import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { Box, CircularProgress, Typography } from "@mui/material";
import { Link, SectionItem, Tooltip, OtTable } from "ui";
import { definition } from ".";
import Description from "./Description";
import LD_QUERY from "./LDQuery.gql";

// How often to re-check the backend while LD is still being fetched from Ensembl.
const LD_POLL_INTERVAL_MS = 5000;

type TableColumn<T> = {
  id: string;
  label: string;
  tooltip?: React.ReactNode;
  renderCell?: (rowData: T) => React.ReactNode;
};

const tableColumns = (rsIds: string[], curVariantId: string) => {
  const conditionalBold = (rowData, text: React.ReactNode) => {
    return rsIds.includes(rowData.variantRsId) ? <b>{text}</b> : text;
  };
  return [
    {
      id: "variantId",
      label: "Variant",
      sortable: true,
      renderCell: rowData =>
        conditionalBold(
          rowData,
          <div>
            <Link key={rowData.variantId} to={`/variant/${rowData.variantId}`}>
              {rowData.variantId}
            </Link>
            {curVariantId === rowData.variantId ? " (self)" : ""}
          </div>
        ),
    },
    {
      id: "variantRsId",
      label: "rsId",
      sortable: true,
      renderCell: rowData =>
        conditionalBold(
          rowData,
          rsIds.includes(rowData.variantRsId)
            ? `${rowData.variantRsId} (self)`
            : rowData.variantRsId
        ),
    },
    {
      id: "position",
      label: "Position",
      sortable: true,
      renderCell: rowData => conditionalBold(rowData, rowData.variantPosition),
    },
    {
      id: "r2",
      label: "LD (r²)",
      sortable: true,
      renderCell: rowData => conditionalBold(rowData, rowData.r2),
    },
    {
      id: "dprime",
      label: "LD (D')",
      sortable: true,
      renderCell: rowData => conditionalBold(rowData, rowData.dPrime),
    },
    {
      id: "mostSevereConsequence",
      label: "Most Severe Consequence",
      sortable: true,
      renderCell: rowData => conditionalBold(rowData, rowData.mostSevereConsequence),
    },
    {
      id: "egCellTypes",
      label: "# Cell types with E-G prediction",
      sortable: true,
      accessorFn: rowData => rowData.egCellTypes.length,
      renderCell: rowData => {
        const cellTypeSet = new Set(rowData.egCellTypes);
        return conditionalBold(
          rowData,
          <Tooltip
            title={
              <ul style={{ margin: 0, paddingLeft: 0, listStylePosition: "inside" }}>
                {Array.from(cellTypeSet)
                  .sort((a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()))
                  .map(cellType => (
                    <li key={cellType}>{cellType}</li>
                  ))}
              </ul>
            }
            placement="bottom"
          >
            <div>{cellTypeSet.size}</div>
          </Tooltip>
        );
      },
    },
    {
      id: "egGenes",
      label: "# Genes with E-G prediction",
      sortable: true,
      accessorFn: rowData => rowData.egGenes.length,
      renderCell: rowData => {
        const geneSet = new Set(rowData.egGenes);
        return conditionalBold(
          rowData,
          <Tooltip
            title={
              <div>
                {Array.from(geneSet)
                  .sort((a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()))
                  .map(gene => (
                    <div key={gene}>{gene}</div>
                  ))}
              </div>
            }
            placement="bottom"
          >
            <div>{geneSet.size}</div>
          </Tooltip>
        );
      },
    },
  ];
};

type BodyProps = {
  id: string;
  entity: string;
};

export function Body({ id, entity }: BodyProps) {
  const variables = {
    variantId: id,
  };

  const request = useQuery(LD_QUERY, {
    variables,
    notifyOnNetworkStatusChange: true,
  });

  const ldStatus = request.data?.variant?.linkageDisequilibriumStatus;

  // The first time a variant is viewed, the backend kicks off a background
  // Ensembl fetch and reports "pending". Poll until it resolves to "complete"
  // (data ready) or "failed", then stop. Polling also stops on unmount.
  useEffect(() => {
    if (ldStatus === "pending") {
      request.startPolling(LD_POLL_INTERVAL_MS);
    } else {
      request.stopPolling();
    }
    return () => request.stopPolling();
  }, [ldStatus]);

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
        if (ldStatus === "pending") {
          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                py: 6,
              }}
            >
              <CircularProgress />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center", maxWidth: 480 }}
              >
                Fetching linkage disequilibrium data from Ensembl. This is the first time this
                variant has been requested, so it may take a couple of minutes. This panel will
                update automatically.
              </Typography>
            </Box>
          );
        }

        if (ldStatus === "failed") {
          return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center", maxWidth: 480 }}
              >
                Linkage disequilibrium data could not be retrieved from Ensembl for this variant.
                Please try again later.
              </Typography>
            </Box>
          );
        }

        let sortedRows = [];
        sortedRows = structuredClone(request.data?.variant.linkageDisequilibriums || []);
        sortedRows?.sort((a, b) => b.r2 - a.r2);
        return (
          <OtTable
            columns={tableColumns(request.data?.variant.rsIds, id)}
            rows={sortedRows}
            dataDownloader
            query={LD_QUERY.loc.source.body}
            variables={variables}
            loading={request.loading}
          />
        );
      }}
    />
  );
}

export default Body;
