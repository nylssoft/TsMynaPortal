import { FetchHelper } from "../utils/FetchHelper";

export type WeatherLocation = {
    id: number;
    name: string;
    countryCode: string | null;
    region: string | null;
    timeZone: string;
};

export type WeatherConditions = {
    timeUtc: string;
    temperatureC: number | null;
    weatherCode: number | null;
};

export type WeatherResult = {
    location: WeatherLocation;
    asOfUtc: string;
    current: WeatherConditions & { windSpeedKph: number | null };
    hourly: (WeatherConditions & { precipitationProbabilityPercent: number | null })[];
};

export type WeatherLookup =
    | { kind: "weather"; weather: WeatherResult }
    | { kind: "candidates"; candidates: WeatherLocation[] };

export class WeatherService {
    static async getAsync(token: string, query: { city: string } | { locationId: number }, locale: string): Promise<WeatherLookup> {
        const params = new URLSearchParams();
        if ("city" in query) {
            params.set("city", query.city);
        } else {
            params.set("locationId", String(query.locationId));
        }
        params.set("locale", locale);
        const response = await FetchHelper.fetchAsync(`/api/weather?${params}`, { headers: { token } }, [409]);
        if (response.status === 409) {
            const body: { error?: string; candidates?: WeatherLocation[] } = await response.json();
            if (body.error !== "ERROR_WEATHER_AMBIGUOUS_LOCATION" || !Array.isArray(body.candidates) || body.candidates.length === 0) {
                throw new Error("ERROR_WEATHER_RESPONSE");
            }
            return { kind: "candidates", candidates: body.candidates };
        }
        const weather: WeatherResult = await response.json();
        if (!weather.location || !weather.current || !Array.isArray(weather.hourly) || weather.hourly.length !== 24) {
            throw new Error("ERROR_WEATHER_RESPONSE");
        }
        return { kind: "weather", weather };
    }
}
