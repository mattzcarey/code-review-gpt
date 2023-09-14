type LocationData = {
    name: string, 
    lat: number, 
    lon: number, 
    country: string, 
    state: string,
};

const getCoords = async(location: string, countryCode: string): Promise<any> => {
    const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=2&appid=${API_KEY}`);
    const data = await response.json();
    return data.filter((item: { country: string; }) => item.country === countryCode)[0];
}

const getDailyForecast = async(location: string, countryCode: string): Promise<any> => {
    const locationData: LocationData = await getCoords(location, countryCode);
    const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${locationData.lat}&lon=${locationData.lon}&units=${"metric"}&appid=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    //console.log(new Date(data.list[0].dt * 1000));

    return data;
}