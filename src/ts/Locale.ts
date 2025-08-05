/**
 * Provides methods for managing locale and translations.
 */
export class Locale {

    private translationMap: Map<string, string> = new Map<string, string>();

    private language: string = window.localStorage.getItem("locale") || window.navigator.language;

    /**
     * Returns the currently set language code.
     * 
     * @returns the language code, e.g. "de" for German and "en" for English
     */
    public getLanguage(): string {
        return this.language;
    }

    /**
     * Sets the language code for translations and loads the corresponding locale data.
     * 
     * @param language the language code to set, e.g. "de" for German and "en" for English or undefined to use the current language
     */
    public async setLanguageAsync(language?: string): Promise<void> {
        if (language) {
            this.language = language;
            window.localStorage.setItem("locale", language);
        }
        const resp1: Response = await fetch(`/api/pwdman/locale/url/${this.getLanguage()}`);
        const url = await resp1.json();
        const resp2: Response = await fetch(url);
        const json = await resp2.json();
        this.translationMap.clear();
        Object.entries(json).forEach(([key, value]) => this.translationMap.set(key, value as string));
    }

    /**
     * Translates the specified key using the loaded locale data.
     * 
     * If the key contains parameters, they are processed and replaced in the translation string.
     * Parameters are defined as :param1, :param2, etc. in the translation string.
     * If no translation is found, the key itself is returned.
     * 
     * Backslashes in parameters are escaped with a double backslash and colons are escaped with a backslash semicolon.
     * 
     * @param key the key to translate
     * @returns the translated string or the key itself if no translation is found
     */
    public translate(key: string): string {
        const arr = key.split(":");
        if (arr.length > 1) {
            const params: (string | undefined)[] = arr.slice(1).map(p => {
                if (p.includes("\\")) {
                    return p.replaceAll("\\\\", "\\").replaceAll("\\;", ":");
                }
                return p;
            });
            return this.format(this.translate(arr[0]), params);
        }
        return this.translationMap.get(key) || key;
    }

    /**
     * Translates the specified key and formats it with additional arguments.
     * 
     * The arguments are used to replace placeholders in the translation string.
     * Placeholders are defined as {0}, {1}, etc. in the translation string.
     * 
     * This method is useful for translations that require dynamic content.
     * 
     * @param key the key to translate
     * @param restArgs optional additional arguments to format the translation
     * @returns the formatted translated string
     */
    public translateWithArgs(key: string, restArgs: string[]): string {
        return this.format(this.translate(key), restArgs);
    }

    /**
     * Translates an error message or an error object.
     * 
     * If the error is an instance of Error, its message is translated.
     * If the error is a string, it is translated directly.
     * If the error is neither, a generic error message is returned.
     * 
     * @param error the error to translate
     * @returns the translated error message
     */
    public translateError(error: Error | unknown): string {
        if (error instanceof Error) {
            return this.translate(error.message);
        }
        if (typeof error === "string") {
            return this.translate(error);
        }   
        return this.translate("An unknown error occurred");
    }

    private format(s: string, arr: (string | undefined)[]): string {
        for (let i: number = 0; i < arr.length; i++) {
            if (arr[i] === undefined) continue;
            const reg = new RegExp("\\{" + i + "\\}", "gm");
            s = s.replace(reg, arr[i]!);
        }
        return s;
    }
}