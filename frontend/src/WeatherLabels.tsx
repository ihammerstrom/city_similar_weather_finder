import { ReactNode } from "react";
import { JsxElement } from "typescript";

export const weatherLabels: Record<string, string | ReactNode> = {
    // TAVG: "Average Temperature",
    // TMAX: "Maximum Temperature",
    // TMIN: "Minimum Temperature",
    // PRCP: "Precipitation",
    DISTANCE: <span>Minimum distance between cities: </span>,
    SHIFTED: <span> Offset the climate of cities in the Southern Hemisphere by 6 months to be compared by the same seasons to those in the Northern Hemisphere. </span>
  };