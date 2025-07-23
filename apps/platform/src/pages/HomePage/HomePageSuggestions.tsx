import {
  faChartBar,
  faDna,
  faMapPin,
  faPrescriptionBottleMedical,
  faStethoscope,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Chip, Grid } from "@mui/material";
import { styled } from "@mui/styles";
import { Link } from "ui";

const StyledChip = styled(Chip)(({ theme }) => ({
  border: 1,
  fontSize: "12px",
  fontWeight: "bold",
  boxShadow: 0,
  "&:hover": {
    color: theme.palette.primary.dark,
    background: theme.palette.grey[100],
  },
  "&:hover .MuiChip-icon": {
    color: theme.palette.primary.dark,
  },
}));

interface SearchSuggestion {
  id: string;
  name: string;
}

// Static Array of Suggestions Related to Lab Papers
const staticVariants: SearchSuggestion[] = [
  { id: "5_173860848_G_A", name: "rs875741" },
  { id: "4_142405561_T_G", name: "rs7696969" },
  { id: "1_99580690_T_G", name: "rs6702619" },
];

function HomePageSuggestions() {
  return (
    <Grid container justifyContent="center" gap={1.5} sx={{ mt: 4 }}>
      {staticVariants.map(suggestion => (
        <Link asyncTooltip to={`/variant/${suggestion.id}`} key={suggestion.id}>
          <StyledChip
            sx={{ pl: 1, borderRadius: 2 }}
            icon={<FontAwesomeIcon icon={faMapPin} />}
            label={suggestion.name}
          />
        </Link>
      ))}
    </Grid>
  );
}
export default HomePageSuggestions;
