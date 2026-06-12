import { gql } from "@apollo/client";
import {
  PlatformApiProvider,
  SectionContainer,
  SummaryContainer,
  summaryUtils,
  SummaryRenderer,
  SectionsRenderer,
} from "ui";

import { Variant, Widget } from "sections";
import ProfileHeader from "./ProfileHeader";

const variantProfileWidgets = new Map<string, Widget>([
  [Variant.E2GPredictions.definition.id, Variant.E2GPredictions],
  [Variant.LinkageDisequilibrium.definition.id, Variant.LinkageDisequilibrium],
]);

const VARIANT_WIDGETS = Array.from(variantProfileWidgets.values());

const variantProfileWidgetsSummaries = Array.from(variantProfileWidgets.values()).map(
  widget => widget.Summary
);

const VARIANT = "variant";
const VARIANT_PROFILE_SUMMARY_FRAGMENT = summaryUtils.createSummaryFragment(
  variantProfileWidgetsSummaries,
  "Variant"
);
const VARIANT_PROFILE_QUERY = gql`
  query VariantProfileQuery($variantId: String!) {
    variant(variantId: $variantId) {
      id
      ...VariantProfileHeaderFragment
      ...VariantProfileSummaryFragment
    }
  }
  ${ProfileHeader.fragments.profileHeader}
  ${VARIANT_PROFILE_SUMMARY_FRAGMENT}
`;

type ProfileProps = {
  varId: string;
};

function Profile({ varId }: ProfileProps) {
  return (
    <PlatformApiProvider
      entity={VARIANT}
      query={VARIANT_PROFILE_QUERY}
      variables={{ variantId: varId }}
    >
      <ProfileHeader />
      <SummaryContainer>
        <SummaryRenderer widgets={VARIANT_WIDGETS} />
      </SummaryContainer>
      <SectionContainer>
        <SectionsRenderer widgets={VARIANT_WIDGETS} id={varId} entity={VARIANT} label={VARIANT} />
      </SectionContainer>
    </PlatformApiProvider>
  );
}

export default Profile;
