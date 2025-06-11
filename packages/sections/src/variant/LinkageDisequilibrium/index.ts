const id = "linkagedisequilibrium";
export const definition = {
  id,
  name: "Linkage disequilibriums",
  shortName: "LD",
  hasData: data => {
    return data.linkageDisequilibriumsCount > 0;
  },
};
