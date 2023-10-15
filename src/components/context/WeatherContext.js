import React, { createContext, useState, useCallback } from "react";
import axios from "axios";
import { wmoCodes } from "../../helpers/helperCodes";
import AirPolutionTable from "../../helpers/AirPolutionTable";
import VisibilityTable from "../../helpers/VisibilityTable";

const WeatherContext = createContext();
const API_KEY = process.env.REACT_APP_API_KEY;

const Provider = ({ children }) => {
  const [weather, setWeather] = useState(null);
  const [units, setUnits] = useState("imperial");
  const [geoData, setGeoData] = useState();
  const [airQuality, setAirQuality] = useState(null);
  const [searchBar, setSearchBar] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState({
    loading: false,
    navLoading: "",
  });

  const getHomeLocation = () => {
    return localStorage.getItem("defaultWeatherLocation");
  };

  const getGeoWeather = () => {
    setIsLoading({
      loading: true,
      navLoading: "current",
    });
    if (!navigator.geolocation) return geoError();
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
  };

  const geoError = (errObj) => {
    const errMsg = errObj ? errObj.message : "Geolocation not supported";
    setError(errMsg);
  };

  const geoSuccess = async (position) => {
    const responseGeoCoding = await axios
      .get(
        `http://api.openweathermap.org/geo/1.0/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&limit=5&appid=${API_KEY}
        `
      )
      .then((res) => {
        return fetchTimeZone(res.data[0].name);
      })
      .then(async (res) => {
        const latLongGeoData = {
          name: res.results[0].name,
          longitude: res.results[0].longitude,
          latitude: res.results[0].latitude,
          timezone: res.results[0].timezone,
        };

        if (latLongGeoData.name === geoData.name) return;

        setGeoData(latLongGeoData);
        const geoWeather = await fetchCurrentWeather(latLongGeoData);
        setWeather(geoWeather);
      });

    setIsLoading({
      loading: false,
      navLoading: "",
    });
  };

  const fetchCurrentWeather = useCallback(async (geoLocation, units) => {
    const lat = geoLocation.latitude;
    const long = geoLocation.longitude;
    const timezone = geoLocation.timezone;

    setError("");

    const response = await axios
      .get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m,weathercode,apparent_temperature,dewpoint_2m,visibility,,surface_pressure,windspeed_80m,winddirection_80m,uv_index,is_day,relativehumidity_2m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant&timezone=${timezone}&forecast_days=7&current_weather=true&temperature_unit=${
          units === "imperial" ? "fahrenheit" : "celsius"
        }&windspeed_unit=mph`,
        { cache: false }
      )
      .catch((error) => {
        setError(error.toJSON().message);
      });

    if (response && response.status === 200) {
      return response.data;
    }
  }, []);

  const fetchAirQuality = async (geoLocation) => {
    const lat = geoLocation.latitude;
    const long = geoLocation.longitude;
    const timezone = geoLocation.timezone;

    const response = await axios
      .get(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${long}&hourly=pm2_5,us_aqi_pm2_5,european_aqi_pm2_5&timezone=${timezone}`
      )
      .catch((error) => {
        setError(error.toJSON().message);
      });
    if (response && response.status === 200) {
      return response.data;
    }
  };

  const fetchTimeZone = useCallback(async (term) => {
    setError("");

    const response = await axios
      .get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${term}&count=10&language=en&format=json`
      )
      .catch((error) => {
        setError(error.toJSON().message);
      });

    if (!response.data.results)
      return setError("Twon or City Not Found! Please try again.");

    const responseValid =
      response && response.status === 200 && response.data.results[0];

    if (responseValid) {
      setGeoData({
        name: response.data.results[0].name,
        longitude: response.data.results[0].longitude,
        latitude: response.data.results[0].latitude,
        timezone: response.data.results[0].timezone,
      });
    } else {
      setError("Something went wrong!");
    }

    const returnData = () => {
      try {
        if (responseValid) return response.data;
      } catch (error) {
        setError(`${error} Something went wrong.`);
      }
    };
    return returnData();
  }, []);

  const loadWeather = useCallback(async () => {
    let location;

    setIsLoading({
      loading: true,
      navLoading: "home",
    });

    const savedLocation = JSON.parse(getHomeLocation());

    if (savedLocation) {
      location = {
        name: savedLocation.name,
        longitude: savedLocation.longitude,
        latitude: savedLocation.latitude,
        timezone: savedLocation.timezone,
      };

      setGeoData(location);
      setUnits(savedLocation.unit);
      const currWather = await fetchCurrentWeather(location);
      const currAirIndex = await fetchAirQuality(location);
      setAirQuality(currAirIndex);
      setWeather(currWather);
    }

    if (!savedLocation) return setError("Home Location not set.");
    setIsLoading("");
  }, []);

  const saveLocation = () => {
    setIsLoading({
      loading: true,
      navLoading: "save",
    });
    if (geoData.longitude && geoData.latitude) {
      const location = {
        name: geoData.name,
        latitude: geoData.latitude,
        longitude: geoData.longitude,
        timezone: geoData.timezone,
        unit: units,
      };
      localStorage.setItem("defaultWeatherLocation", JSON.stringify(location));
    }
    setIsLoading({
      loading: false,
      navLoading: "",
    });
  };

  const toggleUnit = async (unit) => {
    setIsLoading({
      loading: true,
      navLoading: "units",
    });

    const location = {
      name: geoData.name,
      longitude: geoData.longitude,
      latitude: geoData.latitude,
      timezone: geoData.timezone,
    };

    setUnits(unit);
    const weatherUpdatedUnits = await fetchCurrentWeather(location, unit);

    setWeather(weatherUpdatedUnits);

    setIsLoading({
      loading: false,
      navLoading: "",
    });
  };

  const temperatureUnitDisplay = () => {
    return units === "imperial" ? "°F" : "°C";
  };

  const getCurrentTime = (arr) => {
    const currentTimeAtTown =
      weather.current_weather.time.split(":")[0] + ":00";

    return arr.findIndex((currTime) => currTime === currentTimeAtTown);
  };

  const searchAndLoadWeatherAsync = async (searchData) => {
    setIsLoading({
      loading: true,
      navLoading: "",
    });

    let weatherForSearchedPlace, airQualityForSearchedPlace;

    if (searchData) {
      weatherForSearchedPlace = await fetchCurrentWeather(searchData);

      airQualityForSearchedPlace = await fetchAirQuality(searchData);
    } else {
      return setTimeout(() => {
        loadWeather();
      }, 1000);
    }

    setWeather(weatherForSearchedPlace);
    setAirQuality(airQualityForSearchedPlace);

    setIsLoading({
      loading: false,
      navLoading: "",
    });
  };

  /* Load weather when search term was inputed by the html form
  const searchAndLoadWeather = async (searchTerm) => {
    setIsLoading({
      loading: true,
      navLoading: "",
    });

    let weatherForSearchedPlace, airQualityForSearchedPlace;

    const geoDataResponse = await fetchTimeZone(searchTerm);

    if (geoDataResponse) {
      weatherForSearchedPlace = await fetchCurrentWeather(
        geoDataResponse.results[0]
      );

      airQualityForSearchedPlace = await fetchAirQuality(
        geoDataResponse.results[0]
      );
    } else {
      return setTimeout(() => {
        loadWeather();
      }, 1000);
    }

    setWeather(weatherForSearchedPlace);
    setAirQuality(airQualityForSearchedPlace);

    setIsLoading({
      loading: false,
      navLoading: "",
    });
  };

  */

  const twoDigitTimeConversion = (timeUTC) => {
    return timeUTC.toString().slice(-5).split(":")[0] + ":00";
  };

  const weatherUtils = {
    isLoading,
    setIsLoading,
    toggleUnit,
    fetchCurrentWeather,
    temperatureUnitDisplay,
    searchAndLoadWeatherAsync,
    twoDigitTimeConversion,
    fetchTimeZone,
    saveLocation,
    loadWeather,
    airQuality,
    getGeoWeather,
    getCurrentTime,
    getHomeLocation,
    wmoCodes,
    AirPolutionTable,
    VisibilityTable,
    weather,
    setError,
    searchBar,
    setSearchBar,
    error,
    units,
    geoData,
    setGeoData,
  };

  return (
    <WeatherContext.Provider value={weatherUtils}>
      {children}
    </WeatherContext.Provider>
  );
};

export { Provider };
export default WeatherContext;
