import { lazy } from "react";

export const definition = {
  id: "linkagedisequilibrium",
  name: "Variants in Linkage Disequilibrium",
  shortName: "LD",
  hasData: (data: any) => {
    // LD is fetched from Ensembl in the background, so on a variant's first view
    // the count is 0 while a fetch is "pending". Keep the section/summary visible
    // for pending (it shows a loader and polls) and failed (it shows an error),
    // not just when data already exists.
    if ((data?.linkageDisequilibriumsCount ?? 0) > 0) return true;
    const status = data?.linkageDisequilibriumStatus;
    return status === "pending" || status === "failed";
  },
};

export { default as Summary } from "./Summary";

export const getBodyComponent = () => lazy(() => import("./Body"));
