import { SummaryItem, usePlatformApi } from "ui";

import { definition } from ".";
import E2G_SUMMARY from "./E2GSummaryFragment.gql";

function Summary() {
  const request = usePlatformApi(E2G_SUMMARY);

  return <SummaryItem definition={definition} request={request} subText={`${request.data?.enhancerGenePredictionsCount} ${request.data?.enhancerGenePredictionsCount === 1 ? "prediction" : "predictions"}`} />;
}

Summary.fragments = {
  E2GSummaryFragment: E2G_SUMMARY,
};

export default Summary;
