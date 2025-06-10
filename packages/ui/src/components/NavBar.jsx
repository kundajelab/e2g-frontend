import { Link as ReactRouterLink } from "react-router-dom";
import { AppBar, Toolbar, Button, Typography, useMediaQuery, Box, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { makeStyles, useTheme } from "@mui/styles";
import { styled } from "@mui/material/styles";
import classNames from "classnames";
import { v1 } from "uuid";

import Link from "./Link";
import OpenTargetsTitle from "./OpenTargetsTitle";
import HeaderMenu from "./HeaderMenu";
import PrivateWrapper from "./PrivateWrapper";
import { GitHub } from "@mui/icons-material";

const LogoBTN = styled(Button)`
  border: none;
  color: white;
`;

const useStyles = makeStyles(theme => ({
  navbar: {
    backgroundColor: `${theme.palette.primary.dark} !important`,
    margin: 0,
    width: "100%",
  },
  navbarHomepage: {
    left: 0,
    top: 0,
    position: "absolute !important",
  },
  flex: {
    flexGrow: 1,
  },
  menuExternalLinkContainer: {
    fontSize: "1rem",
    "&:first-of-type": {
      marginLeft: "1rem",
    },
    "&:not(:last-child)": {
      marginRight: "1rem",
    },
  },
  menuExternalLink: {
    color: "inherit",
    textDecoration: "none",
    "&:hover": {
      color: theme.palette.secondary.main,
    },
  },
  menuList: {
    display: "flex",
  },
  menuLink: {
    color: theme.palette.secondary.contrastText,
    margin: `0 ${theme.spacing(2)}`,
    whiteSpace: "nowrap",
    "&:hover": {
      color: theme.palette.secondary.contrastText,
    },
  },
  spaceBetween: {
    display: "flex",
    justifyContent: "space-between",
  },
  navLogo: {
    flex: 1,
    display: "none",
  },
  navSearch: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
  },
  navMenu: {
    flex: 1,
    display: "flex",
    justifyContent: "end",
    alignItems: "center",
  },
}));

function MenuExternalLink({ classes, href, children }) {
  return (
    <Typography color="inherit" className={classes.menuExternalLinkContainer}>
      <a target="_blank" rel="noopener noreferrer" href={href} className={classes.menuExternalLink}>
        {children}
      </a>
    </Typography>
  );
}

function NavBar({ name, search, api, downloads, docs, contact, homepage, items, placement }) {
  const classes = useStyles();
  const theme = useTheme();
  const smMQ = useMediaQuery(theme.breakpoints.down("sm"));
  const isHomePageRegular = homepage && !smMQ;
  const navigate = useNavigate();
  return (
    <AppBar
      className={classNames(classes.navbar, {
        [classes.navbarHomepage]: homepage,
      })}
      position="static"
      color="primary"
      elevation={0}
    >
      <Toolbar variant="dense" className={classNames(classes.spaceBetween)}>
        {homepage ? null : (
          <Box
            component={ReactRouterLink}
            to="/"
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img width="30px" height="100%" alt="logo" src="/assets/img/ot-logo-small.png" />
          </Box>
        )}
        <Box
          sx={{
            flex: 1,
            display: { xs: "none", md: "flex" },
          }}
        >
          {/* {homepage ? null : ( */}
          <LogoBTN component={ReactRouterLink} to="/" color="inherit">
            <OpenTargetsTitle name={name} />
          </LogoBTN>
          {/* )} */}
        </Box>

        <Box
          sx={{
            flex: {
              xs: 2,
              sm: 1,
            },
            ml: {
              xs: 1,
              sm: 2,
              md: 0,
            },
          }}
        >
          {search || null}
        </Box>

        <div className={classes.navMenu}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/igv")}
            sx={{
              marginLeft: "2rem",
              ml: {
                xs: 1,
                sm: 2,
                md: 0,
              },
            }}
          >
            <Typography color="white">IGV Browser</Typography>
          </Button>
          <IconButton
            component="a"
            href="https://github.com/kundajelab/e2g-frontend"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            sx={{ marginLeft: "0.5rem" }}
          >
            <GitHub />
          </IconButton>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
