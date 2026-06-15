import { lazy } from "react";

export const definition = {
  id: "e2gpredictions",
  name: "Enhancer-to-gene predictions",
  shortName: "EG",
  hasData: (data: any) => {
    return (data?.enhancerGenePredictionsCount ?? 0) > 0;
  },
};

export { default as Summary } from "./Summary";

export const getBodyComponent = () => lazy(() => import("./Body"));
