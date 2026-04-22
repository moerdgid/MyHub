export const getCoordinatesFromCity = async (location: string) => {
  const attempts: string[] = [
    location,
    location.replace(',', ''),
    location.split(',')[0] || location, // fallback
  ]

  for (const attempt of attempts) {
    const cleaned = attempt.trim()

    if (!cleaned) continue // extra safety

    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        cleaned
      )}&count=1&country=US`

      const response = await fetch(url)
      const data = await response.json()

      if (data.results && data.results.length > 0) {
        return {
          latitude: data.results[0].latitude,
          longitude: data.results[0].longitude,
        }
      }
    } catch (err) {
      console.error('Geocode attempt failed:', cleaned)
    }
  }

  throw new Error('Location not found')
}

export const getWeather = async (latitude: number, longitude: number) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch weather')
  }

  const data = await response.json()
  return data.current_weather
}