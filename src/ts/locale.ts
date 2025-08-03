/**
 * Provides functionality to load and manage locale data for translations.
 */
export class Locale {

    private translationMap: Map<string, string> = new Map<string, string>();

    /**
     * Loads the locale data from the server.
     * 
     * @param languageCode language code, e.g. "de" for German and "en" for English
     */
    public async load(languageCode: string): Promise<void> {
        if (languageCode != "en" && languageCode != "de") {
            languageCode = "en";
        }
        const resp1: Response = await fetch(`/api/pwdman/locale/url/${languageCode}`);
        const url = await resp1.json();
        const resp2: Response = await fetch(url);
        const json = await resp2.json();
        this.translationMap.clear();
        Object.entries(json).forEach(([key, value]) => this.addTranslation(key, value as string));
    }

    /**
     * Adds a translation to the translation map.
     * 
     * @param key the key to add to the translation map
     * @param value the translation value for the key
     */
    public addTranslation(key: string, value: string): void {
        this.translationMap.set(key, value);    
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
            const params: (string|undefined)[] = arr.slice(1).map(p => {
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

    private format(s: string, arr: (string|undefined)[]): string {
        for (let i: number = 0; i < arr.length; i++) {
            if (arr[i] === undefined) continue;
            const reg = new RegExp("\\{" + i + "\\}", "gm");
            s = s.replace(reg, arr[i]!);
        }
        return s;
    };

}