import { SummaryItem, usePlatformApi } from "ui";

import { definition } from ".";
import LD_SUMMARY from "./LDSummaryFragment.gql";

function Summary() {
  const request = usePlatformApi(LD_SUMMARY);

  return <SummaryItem definition={definition} request={request} subText="" />;
}

Summary.fragments = {
  LDSummaryFragment: LD_SUMMARY,
};

export default Summary;
