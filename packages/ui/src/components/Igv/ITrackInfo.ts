interface ITrackInfo {
    cellTypeID: string;
    cellTypeName: string;
    study: string;
    studyUrl: string;
    trackUrl: string;
    trackType: string;
    model?: string | null;
    color?: string;
  }  
export default ITrackInfo;