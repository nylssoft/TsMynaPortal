import { PageContext } from "../PageContext";
import { DesktopTabType } from "../TypeDefinitions";
import { WeatherConditions, WeatherLocation, WeatherResult, WeatherService } from "../services/WeatherService";
import { Controls } from "../utils/Controls";
import { DesktopTab } from "./DesktopTab";

export class WeatherTab implements DesktopTab {
    tabType: DesktopTabType = "WEATHER";
    bootstrapIcon: string = "bi-cloud-sun";
    titleKey: string = "WEATHER";

    async renderAsync(pageContext: PageContext, parent: HTMLElement, alertDiv: HTMLDivElement): Promise<void> {
        const locale = pageContext.locale;
        const heading = Controls.createHeading(parent, 4, "mt-3 mb-3", locale.translate(this.titleKey));
        const panel = Controls.createDiv(parent, "weather-panel");
        const { form, input, toggle } = Controls.createSearch(heading, panel, locale.translate("SEARCH"), "", city => {
            if (city.length < 2) {
                input.setCustomValidity(locale.translate("WEATHER_CITY_HINT"));
                input.reportValidity();
                return;
            }
            void load({ city });
        });
        toggle.setAttribute("role", "button");
        toggle.tabIndex = 0;
        toggle.title = locale.translate("WEATHER_SEARCH");
        toggle.setAttribute("aria-label", locale.translate("WEATHER_SEARCH"));
        toggle.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggle.click();
            }
        });
        input.required = true;
        input.minLength = 2;
        input.maxLength = 100;
        const status = Controls.createDiv(panel, "mb-2");
        status.setAttribute("role", "status");
        const results = Controls.createDiv(panel);
        let loading = false;

        const load = async (query: { city: string } | { locationId: number }): Promise<void> => {
            if (loading) return;
            const token = pageContext.authenticationClient.getToken();
            if (!token) {
                Controls.createAlert(alertDiv, locale.translate("ERROR_INVALID_TOKEN"));
                return;
            }
            loading = true;
            input.disabled = true;
            Controls.removeAllChildren(alertDiv);
            Controls.removeAllChildren(results);
            status.textContent = locale.translate("WEATHER_LOADING");
            try {
                const result = await WeatherService.getAsync(token, query, locale.getLanguage());
                if (result.kind === "candidates") {
                    Controls.createParagraph(results, "", locale.translate("WEATHER_CHOOSE"));
                    const list = Controls.createDiv(results, "list-group");
                    result.candidates.forEach(location => {
                        const button = Controls.createButton(list, "button", this.locationName(location, true), "list-group-item list-group-item-action");
                        button.addEventListener("click", () => { void load({ locationId: location.id }); });
                    });
                } else {
                    this.renderWeather(pageContext, results, result.weather);
                    input.value = result.weather.location.name;
                    Controls.showElem(form, false);
                    try {
                        window.localStorage.setItem("weather-location-id", String(result.weather.location.id));
                    } catch {
                        Controls.createAlert(alertDiv, locale.translate("ERROR_WEATHER_STORAGE"));
                    }
                }
            } catch (error: Error | unknown) {
                Controls.removeAllChildren(results);
                Controls.showElem(form, true);
                const message = error instanceof TypeError || error instanceof SyntaxError ? locale.translate("ERROR_WEATHER_PROVIDER") : locale.translateError(error);
                Controls.createAlert(alertDiv, message);
            } finally {
                loading = false;
                input.disabled = false;
                status.textContent = "";
            }
        };

        input.addEventListener("input", () => input.setCustomValidity(""));
        let savedLocationId: number | null = null;
        try {
            const saved = window.localStorage.getItem("weather-location-id");
            if (saved !== null) {
                const id = Number(saved);
                if (Number.isSafeInteger(id) && id > 0) {
                    savedLocationId = id;
                } else {
                    window.localStorage.removeItem("weather-location-id");
                    Controls.createAlert(alertDiv, locale.translate("ERROR_WEATHER_STORAGE"));
                }
            }
        } catch {
            Controls.createAlert(alertDiv, locale.translate("ERROR_WEATHER_STORAGE"));
        }
        if (savedLocationId !== null) await load({ locationId: savedLocationId });
    }

    private renderWeather(pageContext: PageContext, parent: HTMLElement, weather: WeatherResult): void {
        const locale = pageContext.locale;
        const timeZone = weather.location.timeZone;
        const formatDate = (value: string): string => new Date(value).toLocaleString(locale.getLanguage(), {
            timeZone, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZoneName: "shortOffset"
        });
        Controls.createHeading(parent, 5, "mb-1", this.locationName(weather.location));
        Controls.createDiv(parent, "text-body-secondary small mb-3", locale.translateWithArgs("WEATHER_TIME_ZONE_1", [timeZone]));
        const current = Controls.createDiv(parent, "card mb-3");
        const currentBody = Controls.createDiv(current, "card-body");
        Controls.createHeading(currentBody, 6, "card-title", locale.translate("WEATHER_CURRENT"));
        this.renderConditions(pageContext, currentBody, weather.current);
        Controls.createDiv(currentBody, "small", locale.translateWithArgs("WEATHER_WIND_1", [this.value(weather.current.windSpeedKph, "km/h")]));
        Controls.createDiv(currentBody, "small text-body-secondary", locale.translateWithArgs("WEATHER_OBSERVED_1", [formatDate(weather.current.timeUtc)]));

        const titleRow = Controls.createDiv(parent, "d-flex align-items-center justify-content-between gap-2 mb-2");
        Controls.createHeading(titleRow, 6, "mb-0", locale.translate("WEATHER_FORECAST"));
        const buttons = Controls.createDiv(titleRow, "btn-group btn-group-sm");
        const previous = Controls.createButton(buttons, "button", "", "btn btn-outline-secondary");
        const next = Controls.createButton(buttons, "button", "", "btn btn-outline-secondary");
        previous.setAttribute("aria-label", locale.translate("WEATHER_PREVIOUS"));
        next.setAttribute("aria-label", locale.translate("WEATHER_NEXT"));
        previous.title = locale.translate("WEATHER_PREVIOUS");
        next.title = locale.translate("WEATHER_NEXT");
        Controls.createSpan(previous, "bi bi-chevron-left").setAttribute("aria-hidden", "true");
        Controls.createSpan(next, "bi bi-chevron-right").setAttribute("aria-hidden", "true");
        const hours = Controls.createDiv(parent, "weather-hours");
        hours.setAttribute("role", "region");
        hours.setAttribute("aria-label", locale.translate("WEATHER_FORECAST"));
        hours.tabIndex = 0;
        previous.addEventListener("click", () => hours.scrollBy({ left: -hours.clientWidth, behavior: "smooth" }));
        next.addEventListener("click", () => hours.scrollBy({ left: hours.clientWidth, behavior: "smooth" }));
        weather.hourly.forEach(hour => {
            const card = Controls.createDiv(hours, "weather-hour card text-center");
            const body = Controls.createDiv(card, "card-body px-2 py-3");
            Controls.createDiv(body, "small text-body-secondary", formatDate(hour.timeUtc));
            this.renderConditions(pageContext, body, hour);
            const precipitation = this.value(hour.precipitationProbabilityPercent, "%");
            const probability = Controls.createDiv(body, "small text-nowrap");
            const label = locale.translateWithArgs("WEATHER_PRECIPITATION_1", [precipitation]);
            probability.title = label;
            Controls.createSpan(probability, "bi bi-droplet me-1").setAttribute("aria-hidden", "true");
            Controls.createSpan(probability, "", precipitation).setAttribute("aria-hidden", "true");
            Controls.createSpan(probability, "visually-hidden", label);
        });
        const credit = Controls.createDiv(parent, "small text-body-secondary mt-2");
        Controls.createAnchor(credit, "https://open-meteo.com/", locale.translate("WEATHER_CREDIT"), "link-secondary");
        Controls.createSpan(credit, "", " · ");
        Controls.createAnchor(credit, "https://creativecommons.org/licenses/by/4.0/", "CC BY 4.0", "link-secondary");
    }

    private renderConditions(pageContext: PageContext, parent: HTMLElement, conditions: WeatherConditions): void {
        const [icon, key] = this.condition(conditions.weatherCode);
        const label = pageContext.locale.translate(key);
        const line = Controls.createDiv(parent, "my-2");
        const iconElement = Controls.createSpan(line, `bi ${icon} fs-3 me-2`);
        iconElement.setAttribute("aria-hidden", "true");
        Controls.createSpan(line, "fs-5", this.value(conditions.temperatureC, "°C"));
        Controls.createDiv(parent, "small", label);
    }

    private condition(code: number | null): [string, string] {
        if (code === 0) return ["bi-sun", "WEATHER_CLEAR"];
        if (code !== null && [1, 2, 3].includes(code)) return ["bi-cloud-sun", "WEATHER_CLOUDY"];
        if (code !== null && [45, 48].includes(code)) return ["bi-cloud-fog2", "WEATHER_FOG"];
        if (code !== null && [51, 53, 55, 56, 57].includes(code)) return ["bi-cloud-drizzle", "WEATHER_DRIZZLE"];
        if (code !== null && [61, 63, 65, 66, 67].includes(code)) return ["bi-cloud-rain", "WEATHER_RAIN"];
        if (code !== null && [71, 73, 75, 77, 85, 86].includes(code)) return ["bi-cloud-snow", "WEATHER_SNOW"];
        if (code !== null && [80, 81, 82].includes(code)) return ["bi-cloud-rain-heavy", "WEATHER_SHOWERS"];
        if (code !== null && [95, 96, 99].includes(code)) return ["bi-cloud-lightning-rain", "WEATHER_THUNDERSTORM"];
        return ["bi-question-circle", "WEATHER_UNKNOWN"];
    }

    private value(value: number | null, unit: string): string {
        return value == null ? "—" : `${value} ${unit}`;
    }

    private locationName(location: WeatherLocation, includeId: boolean = false): string {
        const parts = [location.name, location.region, location.countryCode].filter(part => part);
        return `${parts.join(", ")}${includeId ? ` (${location.id})` : ""}`;
    }
}
