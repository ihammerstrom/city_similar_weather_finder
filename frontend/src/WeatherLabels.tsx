import { ReactNode } from "react";
import { JsxElement } from "typescript";

export const weatherLabels: Record<string, string | ReactNode> = {
    TAVG: "Average Temperature",
    TMAX: "Maximum Temperature",
    TMIN: "Minimum Temperature",
    PRCP: "Precipitation",
    SNOW: "Snowfall",
    DISTANCE: <span>Minimum distance <br/> between cities</span>
  };