import { lazy } from "react";

export const definition = {
  id: "linkagedisequilibrium",
  name: "Variants in Linkage Disequilibrium",
  shortName: "LD",
  hasData: (data: any) => {
    return (data?.linkageDisequilibriumsCount ?? 0) > 0;
  },
};

export { default as Summary } from "./Summary";

export const getBodyComponent = () => lazy(() => import("./Body"));
