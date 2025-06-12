const id = "linkagedisequilibrium";
export const definition = {
  id,
  name: "Variants in Linkage Disequilibrium",
  shortName: "LD",
  hasData: data => {
    return data?.linkageDisequilibriumsCount > 0 || data?.variant?.linkageDisequilibriumsCount > 0;
  },
};
