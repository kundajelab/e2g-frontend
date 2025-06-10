import { Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import classNames from "classnames";

import usePermissions from "../hooks/usePermissions";

const useStyles = makeStyles(() => ({
  root: {
    display: "inline",
  },
  fat: {
    fontWeight: 1100,
    textTransform: "capitalize",
  },
  thin: {
    fontWeight: 300,
    textTransform: "capitalize",
  },
}));

type OpenTargetsTitleProps = {
  className?: string;
  name: string;
};

function OpenTargetsTitle({ className, name }: OpenTargetsTitleProps) {
  const classes = useStyles();
  const titleClasses = classNames(classes.root, className);
  const { isPartnerPreview } = usePermissions();
  const displayedAppName = isPartnerPreview ? "Partner Preview Platform" : name;
  return (
    <Typography className={titleClasses} variant="h6" color="inherit">
      Enhancer2Gene
    </Typography>
  );
}

export default OpenTargetsTitle;
