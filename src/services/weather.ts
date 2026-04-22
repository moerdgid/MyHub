export const getCoordinatesFromCity = async (location: string) => {
  const attempts: string[] = [
    location,
    location.replace(',', ''),
    location.split(',')[0] || location,
  ]

  for (const attempt of attempts) {
    const cleaned = attempt.trim()

    if (!cleaned) continue

    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        cleaned
      )}&count=1&country=US`

      const response = await fetch(url)

      if (!response.ok) {
        continue
      }

      const data = await response.json()

      if (data.results && data.results.length > 0) {
        return {
          latitude: data.results[0].latitude,
          longitude: data.results[0].longitude,
          label: `${data.results[0].name}${
            data.results[0].admin1 ? `, ${data.results[0].admin1}` : ''
          }`,
        }
      }
    } catch (err) {
      console.error('Geocode attempt failed:', cleaned)
    }
  }

  throw new Error('Location not found')
}

export const getWeather = async (lat: number, lng: number) => {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}` +
    `&longitude=${lng}` +
    `&current=temperature_2m,wind_speed_10m,precipitation,weather_code` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max` +
    `&temperature_unit=fahrenheit` +
    `&wind_speed_unit=mph` +
    `&precipitation_unit=inch` +
    `&timezone=auto`

  const res = await fetch(url)

  if (!res.ok) {
    throw new Error('Weather request failed')
  }

  const data = await res.json()

  return {
    current: {
      temperature: data.current?.temperature_2m,
      windspeed: data.current?.wind_speed_10m,
      precipitation: data.current?.precipitation,
      weatherCode: data.current?.weather_code,
    },
    daily: {
      high: data.daily?.temperature_2m_max?.[0],
      low: data.daily?.temperature_2m_min?.[0],
      precipitationSum: data.daily?.precipitation_sum?.[0],
      precipitationChance: data.daily?.precipitation_probability_max?.[0],
    },
  }
}