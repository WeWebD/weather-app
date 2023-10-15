import useWeatherContext from "../hooks/useWeatherContext";

function HourForecast({ data}) {
  
  const { wmoCodes, twoDigitTimeConversion, temperatureUnitDisplay} = useWeatherContext();
  
  const getWeatherIcon = (height, weatherCode) => {

    const getDayOrNightIcon =
      twoDigitTimeConversion(data.time).split(":")[0] >= 6 &&
      twoDigitTimeConversion(data.time).split(":")[0] <= 21
        ? "iconD"
        : "iconN";

    return wmoCodes(weatherCode) && wmoCodes(weatherCode, height)[getDayOrNightIcon];
  };

  return (
    <li  className="flex flex-col mt-2 items-center mx-2.5">
      <p className="font-regular">
        {twoDigitTimeConversion(data.time).split(":")[0]}
      </p>
      {getWeatherIcon(2, data.weather_code)}
      <p className="font-regular mt-2">{`${Math.round(data.temperature)}${temperatureUnitDisplay()}`}</p>
    </li>
  );
}

export default HourForecast;
