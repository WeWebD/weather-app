import React from "react";
import useWeatherContext from "../hooks/useWeatherContext";

function PercipitationVisibility() {
  const { weather, VisibilityTable, units, getCurrentTime } = useWeatherContext();

  const metersInMiles = 1609.34;

  if (!weather) {
    return null; // Return early if weather data is not available
  }

  const indexToExtractVisibility = getCurrentTime(weather.hourly.time);

  const visibilityInMiles =
    weather.hourly.visibility[indexToExtractVisibility] / metersInMiles;

  const visibilityInMeters =
    weather.hourly.visibility[indexToExtractVisibility];

  const visibilityDescription = VisibilityTable(visibilityInMeters, units);

  return (
    <section className="grid grid-cols-2 gap-5">
      <div className="aspect-square bg-gray-300/40 mt-5 rounded-xl px-3 py-2 backdrop-blur pb-4">
        <div>
          <h2 className="font-thin">Percipitation</h2>
          <hr className="opacity-50 mt-1"></hr>
        </div>
        <div className="mt-2">
          <p className="text-xl">{weather.daily.precipitation_sum[0]}mm</p>
          <p className="text-xs mt-2">In the last 24 hours!</p>
        </div>
      </div>
      <div className="aspect-square bg-gray-300/40 mt-5 rounded-xl px-3 py-2 backdrop-blur pb-4">
        <div>
          <h2 className="font-thin">Visibility</h2>
          <hr className="opacity-50 mt-1"></hr>
        </div>
        <div className="flex flex-col mt-2">
          <p className="text-xl">{Math.round(visibilityInMiles)} miles</p>
          <p className="text-xs mt-2 ">{visibilityDescription}</p>
        </div>
      </div>
    </section>
  );
}

export default PercipitationVisibility;
