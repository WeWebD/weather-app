import React from "react";
import Picker from "../imgs/Picker.svg";
import Refresh from "../imgs/Refresh.svg";
import Home from "../imgs/Home.svg";
import Units from "../imgs/Units.svg";
import Save from "../imgs/Save.svg";
import NavButton from "../helpers/NavButton";
import useWeatherContext from "../hooks/useWeatherContext";

function Navbar() {
  const {
    saveLocation,
    loadWeather,
    getGeoWeather,
    isLoading,
    toggleUnit,
    units,
    setIsLoading,
    searchBar,
    setSearchBar,
  } = useWeatherContext();

  const handleSaveClick = () => {
    setSearchBar((search) => search = false);
    saveLocation();
    loadWeather();
  };

  const handleHomeClick = () => {
    setSearchBar((search) => (search = false));
    loadWeather();
  };

  const handleLocationClick = () => {
    setSearchBar((search) => (search = false));
    getGeoWeather();
  };

  const handleUnitClick = () => {
    let unitsToPass;
    units === "imperial"
      ? (unitsToPass = "metric")
      : (unitsToPass = "imperial");
    toggleUnit(unitsToPass);
  };

  const handleRefreshClick = () => {
    setSearchBar((search) => (search = false));
    setIsLoading({
      loading: true,
      navLoading: "refresh",
    });
    setTimeout(() => {
      loadWeather();
      setIsLoading({
        loading: false,
        navLoading: "",
      });
    }, 2000);
  };

  return (
    <nav className="grid gap-4 grid-cols-5 w-full grid-rows-1 px-5 h-20 bg-white/60 fixed bottom-0 max-w-md rounded-t-[16px] backdrop-blur text-gray-600 text-sm items-center">
      <NavButton
        icon={Picker}
        text="Current"
        loading={isLoading.navLoading === "current"}
        buttonTitle="Get Location"
        onClick={handleLocationClick}
        aria-label="Get the current weather conditions for your current location"
      />
      <NavButton
        icon={Home}
        text="Home"
        loading={isLoading.navLoading === "home"}
        buttonTitle="Home Location"
        onClick={handleHomeClick}
        alabel="Get the current weather conditions for your saved Home location"
      />
      <NavButton
        icon={Save}
        text="Save"
        loading={isLoading.navLoading === "save"}
        buttonTitle="Save Location"
        onClick={handleSaveClick}
        aLabel="Save the current locagtion as your home location"
      />
      <NavButton
        icon={Units}
        text="Units"
        loading={isLoading.navLoading === "units"}
        onClick={handleUnitClick}
        buttonTitle="Change units"
        aLabel="Toggle units between imperial and metric."
      />
      <NavButton
        icon={Refresh}
        loading={isLoading.navLoading === "refresh"}
        text="Refresh"
        onClick={handleRefreshClick}
        buttonTitle="Refresh the app"
        aLabel="Refresh the application"
      />
    </nav>
  );
}

export default Navbar;
