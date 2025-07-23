import React from "react";
import { Autocomplete, TextField, Box } from "@mui/material";

interface FiltersProps {
  data: any[];
  selectedCellTypes: string[];
  setSelectedCellTypes: (cellTypes: string[]) => void;
  selectedCellTypeIds: string[];
  setSelectedCellTypeIds: (cellTypeIds: string[]) => void;
  selectedStudies: string[];
  setSelectedStudies: (studies: string[]) => void;
  selectedModels: string[];
  setSelectedModels: (models: string[]) => void;
}

const Filters: React.FC<FiltersProps> = ({
  data,
  selectedCellTypes,
  setSelectedCellTypes,
  selectedCellTypeIds,
  setSelectedCellTypeIds,
  selectedStudies,
  setSelectedStudies,
  selectedModels,
  setSelectedModels,
}) => {
  // Get unique values for each filter
  const uniqueCellTypes = Array.from(new Set(data.map(track => track.cellType)));
  const uniqueCellTypeIds = Array.from(new Set(data.map(track => track.cellTypeId)));
  const uniqueStudies = Array.from(new Set(data.map(track => track.study)));
  const uniqueModels = Array.from(
    new Set(data.map(track => track.modelType || "").filter(Boolean))
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
      <Autocomplete
        multiple
        options={uniqueCellTypes}
        value={selectedCellTypes}
        freeSolo
        onChange={(_, newValue) => setSelectedCellTypes(newValue)}
        renderInput={params => (
          <TextField {...params} label="Search by Cell Type" variant="outlined" />
        )}
      />

      <Autocomplete
        multiple
        options={uniqueStudies}
        value={selectedStudies}
        onChange={(_, newValue) => setSelectedStudies(newValue)}
        renderInput={params => <TextField {...params} label="Filter by Study" variant="outlined" />}
      />

      <Autocomplete
        multiple
        options={uniqueModels}
        value={selectedModels}
        onChange={(_, newValue) => setSelectedModels(newValue)}
        renderInput={params => <TextField {...params} label="Filter by Model" variant="outlined" />}
      />
    </Box>
  );
};

export default Filters;
