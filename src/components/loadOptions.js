import axios from "axios";

const loadOptions = async (searchQuery) => {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${searchQuery}&count=10&language=en&format=json`
  );
  //   const response = await axios
  //     .get(
  //       `https://geocoding-api.open-meteo.com/v1/search?name=${searchQuery}&count=10&language=en&format=json`
  //     )
  //     .catch((error) => {
  //       console.log(error.toJSON().message);
  //     });
  const resJSON = await res.json();
  return {
    options:
      resJSON.results.map((city) => {
        return {
          value: `${city.longitude}, ${city.latitude}`,
          label: `${city.name}, ${city.country}`,
        };
      }) || [],
  };
};

export default loadOptions;
