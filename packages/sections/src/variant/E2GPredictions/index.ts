const id = "e2gpredictions";
export const definition = {
  id,
  name: "Enhancer-to-gene predictions",
  shortName: "EG",
  hasData: data => {
    return data?.enhancerGenePredictionsCount > 0; // section
  },
};
