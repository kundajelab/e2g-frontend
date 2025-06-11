import { SummaryItem, usePlatformApi } from "ui";

import { definition } from ".";
import LD_SUMMARY from "./LDSummaryFragment.gql";
import { useQuery } from "@apollo/client";

function Summary({ variantId }: { variantId: string }) {
  const request = useQuery(LD_SUMMARY, {
    variables: {
      variantId,
    },
  });

  return <SummaryItem definition={definition} request={request} subText="" />;
}

Summary.fragments = {
  LDSummaryFragment: LD_SUMMARY,
};

export default Summary;
