import { SummaryItem, usePlatformApi } from "ui";

import { definition } from ".";
import E2G_SUMMARY from "./E2GSummaryFragment.gql";

function Summary() {
  const request = usePlatformApi(E2G_SUMMARY);

  let subText = "";
  if (
    !request.data?.enhancerGenePredictionsCount ||
    request.data?.enhancerGenePredictionsCount === 0
  ) {
    subText = "No predictions found";
  } else {
    subText = `${request.data?.enhancerGenePredictionsCount} ${
      request.data?.enhancerGenePredictionsCount === 1 ? "prediction" : "predictions"
    }`;
  }

  return <SummaryItem definition={definition} request={request} subText={subText} />;
}

Summary.fragments = {
  E2GSummaryFragment: E2G_SUMMARY,
};

export default Summary;
