import { Link, DisplayVariantId } from "ui";

type DescriptionProps = {
  variantId: string;
  referenceAllele: string;
  alternateAllele: string;
};

function Description({ variantId, referenceAllele, alternateAllele }: DescriptionProps) {
  return (
    <>
      Variants in linkage disequilibrium with{" "}
      <strong>
        <DisplayVariantId
          variantId={variantId}
          referenceAllele={referenceAllele}
          alternateAllele={alternateAllele}
        />
      </strong>{" "}
      with r² &gt; 0.8 in the 1000 Genomes Project Phase 3 CEU (Utah residents with Northern and
      Western European ancestry) population. Source:{" "}
      <Link to="https://rest.ensembl.org/documentation/info/ld_id_get" external>
        Ensembl
      </Link>
      <br />
      <br />
      [Please note that if this is the first time a variant is being loaded, it may take a couple
      minutes for the data to be available.]
    </>
  );
}

export default Description;
