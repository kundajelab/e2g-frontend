import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faDatabase } from "@fortawesome/free-solid-svg-icons";
import { BasePage, Link, OtLongText, OtCodeBlock } from "ui";

// Published datasets live in the requester-pays GCS bucket gs://e2g — anonymous
// HTTPS download does NOT work; callers must supply their own billing project.
const E2G_BUCKET = "gs://e2g";
const OT_DOWNLOADS_URL = "https://platform.opentargets.org/downloads";

const EGP_CHROMOSOMES = [...Array.from({ length: 22 }, (_, i) => String(i + 1)), "X"];

type SchemaCol = { name: string; type: string; description: string };
type Dataset = {
  name: string;
  description: string;
  categories: string[];
  /** Object or prefix under the bucket. Trailing "/" => directory (cp -r). */
  path: string;
  schema: SchemaCol[];
};

const datasets: Dataset[] = [
  {
    name: "Enhancer–Gene Predictions",
    description:
      "Predicted enhancer–gene links across cell types (ENCODE-rE2G / scE2G), with prediction score, target gene, and enhancer–gene distance. Partitioned by chromosome (chr1–chr22, chrX).",
    categories: ["Parquet", "125M rows"],
    path: "enhancer_gene_predictions/",
    schema: [
      { name: "id", type: "INT32", description: "Row identifier" },
      { name: "score", type: "DOUBLE", description: "Enhancer–gene prediction score" },
      { name: "target_gene_id", type: "STRING", description: "Ensembl target gene ID" },
      { name: "target_gene_name", type: "STRING", description: "Target gene symbol" },
      { name: "target_gene_tss", type: "INT32", description: "Target gene TSS (GRCh38, bp)" },
      { name: "enhancer_gene_distance", type: "INT32", description: "Enhancer–gene distance (bp)" },
      { name: "model", type: "STRING", description: "Prediction model (ENCODE-rE2G / scE2G)" },
      { name: "chromosome", type: "STRING", description: "Chromosome" },
      { name: "enhancer_id", type: "INT32", description: "Foreign key → enhancers.id" },
      { name: "cell_type_id", type: "STRING", description: "Foreign key → cell_types.id" },
    ],
  },
  {
    name: "Enhancers",
    description: "Candidate enhancer elements with genomic coordinates (GRCh38) and element class.",
    categories: ["Parquet", "59.8M rows"],
    path: "enhancers.parquet",
    schema: [
      { name: "id", type: "INT32", description: "Enhancer identifier (primary key)" },
      { name: "chromosome", type: "STRING", description: "Chromosome" },
      { name: "start", type: "INT32", description: "Start position (GRCh38, bp)" },
      { name: "end", type: "INT32", description: "End position (GRCh38, bp)" },
      { name: "class", type: "STRING", description: "Element class (e.g. promoter, intergenic)" },
    ],
  },
  {
    name: "Cell Types",
    description:
      "Cell type / sample metadata (name, dataset) referenced by the enhancer–gene predictions.",
    categories: ["Parquet", "1,604 rows"],
    path: "cell_types.parquet",
    schema: [
      { name: "id", type: "STRING", description: "Cell type identifier (primary key)" },
      { name: "name", type: "STRING", description: "Cell type name" },
      { name: "dataset", type: "STRING", description: "Source dataset accession" },
      { name: "dataset_url", type: "STRING (nullable)", description: "Source dataset URL" },
    ],
  },
];

function RequesterPaysMemo() {
  return (
    <Typography
      variant="caption"
      sx={{
        mb: 1,
        display: "block",
        fontWeight: "medium",
        backgroundColor: "#1f5279",
        color: "white",
        p: 1,
        borderRadius: 1,
      }}
    >
      <code>gs://e2g</code> is a <b>requester-pays</b> bucket: you must supply your own Google Cloud{" "}
      <b>billing project</b> (egress is billed to you). Anonymous HTTPS download is not available.
    </Typography>
  );
}

function SchemaView({ dataset }: { dataset: Dataset }) {
  return (
    <Box tabIndex={-1} sx={{ typography: "subtitle2" }}>
      <OtCodeBlock>
        <Box component="table" sx={{ borderSpacing: 0, "& td, & th": { p: "3px 12px 3px 0", textAlign: "left", whiteSpace: "nowrap" } }}>
          <thead>
            <tr>
              <th>Column</th>
              <th>Data Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {dataset.schema.map(col => (
              <tr key={col.name}>
                <td>
                  <b>{col.name}</b>
                </td>
                <td>{col.type}</td>
                <td style={{ whiteSpace: "normal" }}>{col.description}</td>
              </tr>
            ))}
          </tbody>
        </Box>
      </OtCodeBlock>
    </Box>
  );
}

function AccessView({ dataset }: { dataset: Dataset }) {
  const isDir = dataset.path.endsWith("/");
  const uri = `${E2G_BUCKET}/${dataset.path}`;
  const recursive = isDir ? "-r " : "";
  const dest = isDir ? `./${dataset.path}` : ".";
  const gcloudCmd = `gcloud storage cp ${recursive}--billing-project=YOUR_PROJECT ${uri} ${dest}`;
  const gsutilCmd = `gsutil -u YOUR_PROJECT -m cp ${recursive}${uri} ${dest}`;

  return (
    <>
      <Box sx={{ wordBreak: "break-all", typography: "subtitle2", mt: 1, mb: 3 }}>
        <Typography mb={1} variant="body1">
          Bucket location:
        </Typography>
        <OtCodeBlock textToCopy={uri}>{uri}</OtCodeBlock>
      </Box>

      <RequesterPaysMemo />

      <Box sx={{ wordBreak: "break-all", typography: "subtitle2", mb: 3 }}>
        <Typography mb={1} variant="body1">
          Google Cloud CLI:
        </Typography>
        <OtCodeBlock textToCopy={gcloudCmd}>{gcloudCmd}</OtCodeBlock>
      </Box>

      <Box sx={{ wordBreak: "break-all", typography: "subtitle2", mb: 1 }}>
        <Typography mb={1} variant="body1">
          gsutil (alternative):
        </Typography>
        <OtCodeBlock textToCopy={gsutilCmd}>{gsutilCmd}</OtCodeBlock>
      </Box>
    </>
  );
}

function DatasetDialog({
  dataset,
  view,
  onSwitch,
  onClose,
}: {
  dataset: Dataset;
  view: "schema" | "access";
  onSwitch: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog
      open
      onClose={onClose}
      sx={{
        "& .MuiDialog-container": {
          "& .MuiPaper-root": { minWidth: "50vw", width: "800px", maxWidth: "100%", maxHeight: "90%" },
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
          Dataset: {dataset.name}
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, pt: 2, mx: 3, mb: 3 }}>
        {view === "schema" ? <SchemaView dataset={dataset} /> : <AccessView dataset={dataset} />}
      </DialogContent>
      <DialogActions sx={{ mb: 2, mx: 2, display: "flex", justifyContent: "space-between" }}>
        <Button onClick={onSwitch}>{view === "access" ? "Show Schema" : "Access Data"}</Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function DatasetCard({ dataset, onOpen }: { dataset: Dataset; onOpen: (view: "schema" | "access") => void }) {
  return (
    <Card
      sx={{
        width: "350px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "none",
        border: theme => `1px solid ${theme.palette.grey[300]}`,
        "&:hover": { boxShadow: theme => theme.boxShadow.lg },
      }}
    >
      <CardContent
        sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: 1 }}
      >
        <Box>
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold", mb: 1 }}>
            {dataset.name}
          </Typography>
          <OtLongText variant="body2" lineLimit={3} displayText="... more">
            {dataset.description}
          </OtLongText>
        </Box>
        <Box sx={{ display: "flex", gap: 1, my: 1, flexWrap: "wrap" }}>
          {dataset.categories.map(c => (
            <Chip
              key={c}
              size="small"
              label={c}
              sx={{ background: theme => theme.palette.primary.dark, color: "white" }}
            />
          ))}
        </Box>
      </CardContent>
      <CardActions
        sx={{ display: "flex", width: 1, pb: 3, px: 2, justifyContent: "center", gap: 2, flexWrap: "wrap" }}
      >
        <Box sx={{ width: { xs: "100%", sm: "45%" }, m: { xs: "0 !important" } }}>
          <Button variant="outlined" color="primary" sx={{ width: 1, gap: 2 }} onClick={() => onOpen("schema")}>
            <FontAwesomeIcon icon={faCode} />
            Schema
          </Button>
        </Box>
        <Box sx={{ width: { xs: "100%", sm: "45%" }, m: { xs: "0 !important" } }}>
          <Button variant="outlined" color="primary" sx={{ width: 1, gap: 2 }} onClick={() => onOpen("access")}>
            <FontAwesomeIcon icon={faDatabase} />
            Access Data
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
}

function E2GDownloadsPage() {
  const location = useLocation();
  const [active, setActive] = useState<{ dataset: Dataset; view: "schema" | "access" } | null>(null);

  return (
    <BasePage
      title="Enhancer2Gene | Data downloads"
      description="Download the Enhancer2Gene enhancer–gene prediction datasets."
      location={location}
    >
      <Typography variant="h4" component="h1" paragraph>
        Enhancer2Gene
      </Typography>
      <Typography paragraph>
        Download the datasets powering this portal as Apache Parquet files from the{" "}
        <code>{E2G_BUCKET}</code> Google Cloud Storage bucket. For all other resources (targets,
        diseases, drugs, evidence, etc.), use the{" "}
        <Link to={OT_DOWNLOADS_URL} external>
          Open Targets Platform data downloads
        </Link>
        .
      </Typography>

      <Typography variant="h6" sx={{ fontWeight: "bold", mt: 3, mb: 2 }}>
        All Datasets ({datasets.length})
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 2 }}>
        {datasets.map(dataset => (
          <DatasetCard
            key={dataset.name}
            dataset={dataset}
            onOpen={view => setActive({ dataset, view })}
          />
        ))}
      </Box>

      {active && (
        <DatasetDialog
          dataset={active.dataset}
          view={active.view}
          onSwitch={() =>
            setActive(a => (a ? { ...a, view: a.view === "access" ? "schema" : "access" } : a))
          }
          onClose={() => setActive(null)}
        />
      )}
    </BasePage>
  );
}

export default E2GDownloadsPage;
