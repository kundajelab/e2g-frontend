import { Link, DisplayVariantId } from "ui";

type DescriptionProps = {
  variantId: string;
  referenceAllele: string;
  alternateAllele: string;
};

function Description({ variantId, referenceAllele, alternateAllele }: DescriptionProps) {
  return (
    <>
      Genes predicted to be regulated by enhancers overlapping the credible set lead variant{" "}
      <strong>
        <DisplayVariantId
          variantId={variantId}
          referenceAllele={referenceAllele}
          alternateAllele={alternateAllele}
        />
      </strong>. Source:{" "}
      <Link to="https://www.nature.com/articles/s41586-026-10781-4" external>
        ENCODE rE2G
      </Link>
    </>
  );
}

export default Description;
