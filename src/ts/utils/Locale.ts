/**
 * Provides methods for managing locale and translations.
 */
export class Locale {

    private translationMap: Map<string, string> = new Map<string, string>();

    private language: string = window.localStorage.getItem("locale") || window.navigator.language.split("-")[0];

    private german = {
        "APP_NAME": "stockfleth.eu",
        "WELCOME_TITLE": "Dein persönliches Portal",
        "WELCOME_INTRO": "stockfleth.eu ist ein privates Portal für Familie und Freunde. Hier kannst du deinen Alltag organisieren und wichtige Informationen an einem Ort im Blick behalten.",
        "WELCOME_SIGN_IN": "Anmelden",
        "WELCOME_REQUEST_ACCOUNT": "Konto beantragen",
        "WELCOME_APPROVAL": "Kontoanträge müssen genehmigt werden.",
        "WELCOME_ORGANIZE_TITLE": "Informationen organisieren",
        "WELCOME_ORGANIZE_TEXT": "Halte Ideen in Notizen fest, führe ein Tagebuch und verwalte Kontakte, Dokumente und Passwörter.",
        "WELCOME_PLAN_TITLE": "Deinen Tag planen",
        "WELCOME_PLAN_TEXT": "Organisiere deine Termine und sieh dir die stündliche Wettervorhersage oder die Vorschau für sieben Tage an.",
        "WELCOME_BACKUP_TITLE": "Daten sichern und wiederherstellen",
        "WELCOME_BACKUP_TEXT": "Exportiere und importiere deine Daten als ZIP-Dateien. Passwortsicherungen kannst du ohne Anmeldung direkt im Browser lesen.",
        "MESSAGE_WELCOME_1_2_3": "Hallo {0}! Heute ist der {1}. Es ist {2}.",
        "MESSAGE_LAST_LOGIN_1": "Deine letzte Anmeldung war am {0}.",
        "LANGUAGE": "Sprache",
        "ABOUT": "Über",
        "ABOUT_API_VERSION_1": "API-Server: {0}",
        "ERROR_API_VERSION_1": "API-Server-Version konnte nicht geladen werden: {0}",
        "ERROR_API_VERSION_RESPONSE": "Ungültige Versionsantwort des API-Servers.",
        "INFO_ENTER_USERNAME": "Gib deinen Benutzernamen oder E-Mail-Adresse ein.",
        "INFO_ENTER_PASSWORD": "Gib dein Kennwort ein.",
        "INFO_ENTER_KEY": "Gib deinen Schlüssel zum Ver- und Entschlüsseln deiner Daten ein.",
        "DESKTOP": "Desktop",
        "DATA_PROTECTION": "Datenschutz",
        "DOCUMENTS_SELECT_ITEMS": "Elemente auswählen",
        "DOCUMENTS_CANCEL_SELECTION": "Auswahl beenden",
        "DOCUMENTS_SELECT_ALL": "Alle angezeigten Elemente auswählen oder abwählen",
        "DOCUMENTS_SELECT_ITEM_1": "{0} auswählen",
        "DOCUMENTS_VISIBILITY": "Ordnersichtbarkeit",
        "DOCUMENTS_PRIVATE": "Privat (nur Eigentümer)",
        "DOCUMENTS_FAMILY": "Familie",
        "DOCUMENTS_PUBLIC": "Öffentlich (ohne Anmeldung)",
        "DOCUMENTS_EDIT_CONTENT": "Markdown-Inhalt bearbeiten",
        "DOCUMENTS_CONTENT_SAVED": "Inhalt gespeichert.",
        "DOCUMENTS_ACCESS_WARNING": "Die Einstellung gilt für neue, direkt in diesen Ordner hochgeladene Dateien. Bestehende Dateien und Unterordner bleiben unverändert. Es werden keine Dateien ver- oder entschlüsselt. Neue Unterordner sind privat. Öffentliche Dateien sind ohne Anmeldung abrufbar; Familiendateien erfordern die Rolle Familie. Geteilte Dateien werden unverschlüsselt gespeichert.",
        "DOCUMENTS_SHARED_UPLOAD": "Neue Dateien in diesem Ordner werden unverschlüsselt mit dessen Sichtbarkeit gespeichert. Neue Unterordner bleiben privat.",
        "DOCUMENTS_MOVE_WARNING": "Verschieben ändert weder die Sichtbarkeit noch die Verschlüsselung der Dateien und Ordner.",
        "ERROR_DOCUMENT_UPDATE": "Die Änderung wurde nicht bestätigt. Bitte aktualisieren und vor einem erneuten Versuch prüfen.",
        "ERROR_DOCUMENT_ACCESS_ROLE": "Diese Ordnersichtbarkeit wird vom Client nicht unterstützt.",
        "ADMINISTRATION": "Verwaltung",
        "ERROR_ADMINISTRATION_ACCESS": "Für die Verwaltung sind Administratorrechte erforderlich.",
        "ADMIN_REGISTRATIONS": "Registrierungsanfragen",
        "ADMIN_REGISTRATION_EMPTY": "Keine offenen Registrierungsanfragen.",
        "ADMIN_REGISTRATION_DATE_UNKNOWN": "Datum nicht verfügbar",
        "ADMIN_REGISTRATION_NOTIFY": "Benachrichtigung per E-Mail senden",
        "ADMIN_REGISTRATION_APPROVE": "Bestätigen",
        "ADMIN_REGISTRATION_REJECT": "Ablehnen",
        "ADMIN_REGISTRATION_REFRESH": "Aktualisieren",
        "ADMIN_REGISTRATION_APPROVED_1_2": "{0}: Bestätigt. Registrierungscode: {1}",
        "ADMIN_REGISTRATION_REJECTED_1": "{0}: Abgelehnt.",
        "ADMIN_REGISTRATION_FAILED_1_2": "{0}: {1} Die Anfrage wurde möglicherweise bereits bearbeitet. Bitte vor einem erneuten Versuch prüfen.",
        "ERROR_REGISTRATION_RESPONSE": "Die Antwort zur Registrierungsanfrage ist ungültig.",
        "ADMIN_USERS": "Registrierte Benutzer",
        "ADMIN_USER_EMPTY": "Keine Benutzer gefunden.",
        "ADMIN_USER_SELECT_1": "{0} zum Löschen auswählen",
        "ADMIN_USER_LOCKED": "Gesperrt",
        "ADMIN_USER_LOGIN_DISABLED": "Anmeldung deaktiviert",
        "ADMIN_USER_SELF_DELETE": "Das eigene Konto kann in den Kontoeinstellungen gelöscht werden.",
        "ADMIN_USER_DELETE": "Ausgewählte Benutzer löschen",
        "ADMIN_USER_CONFIRM_DELETE_1": "Diese Konten und ihre Daten endgültig löschen: {0}?",
        "ADMIN_USER_DELETED_1": "{0}: Konto gelöscht.",
        "ADMIN_USER_DELETE_FAILED_1_2": "{0}: {1} Bitte den Kontostatus vor einem erneuten Versuch prüfen.",
        "ADMIN_USER_REFRESH": "Benutzer aktualisieren",
        "ADMIN_USER_EMAIL_1": "E-Mail: {0}",
        "ADMIN_USER_REGISTERED_1": "Registriert: {0}",
        "ADMIN_USER_LAST_LOGIN_1": "Letzte Anmeldung: {0}",
        "ADMIN_USER_STORAGE_USED_1": "Belegter Speicher: {0}",
        "ADMIN_USER_QUOTA": "Speicherlimit (MB)",
        "ADMIN_USER_SAVE_QUOTA": "Speicherlimit speichern",
        "ADMIN_USER_LOGIN_ENABLED": "Anmeldung erlauben",
        "ADMIN_USER_ROLES": "Rollen",
        "ADMIN_ROLE_USERMANAGER": "Administrator",
        "ADMIN_ROLE_FAMILY": "Familie",
        "ADMIN_ROLE_SKATADMIN": "Skat-Administrator",
        "ADMIN_USER_UNLOCK": "Konto entsperren",
        "ADMIN_USER_BACK": "Zur Benutzerliste",
        "ADMIN_USER_UPDATED": "Änderung gespeichert.",
        "ADMIN_USER_UPDATE_FAILED_1": "{0} Bitte den Benutzer vor einem erneuten Versuch aktualisieren.",
        "ERROR_ADMIN_USER_UNCHANGED": "Die Änderung wurde nicht durchgeführt. Der Benutzerstatus könnte sich geändert haben.",
        "ERROR_ADMIN_USER_RESPONSE": "Die Antwort zur Benutzerverwaltung ist ungültig.",
        "ERROR_ADMIN_USER_QUOTA": "Das Speicherlimit muss eine ganze Zahl zwischen 2 und 1000 MB und größer als der belegte Speicher sein.",
        "KEY_INFO": "Speichere deinen Schlüssel an einem sicheren Ort. Bei Verlust können die Daten nicht wiederhergestellt werden.",
        "STAY_SIGNED_IN": "Angemeldet bleiben",
        "BIRTHDAYS": "Geburtstage",
        "DAYS": "Tage",
        "TODAY": "Heute",
        "TOMORROW": "Morgen",
        "CONTACTS": "Kontakte",
        "NOTES": "Notizen",
        "PASSWORD_MANAGER": "Kennwörter",
        "DIARY": "Tagebuch",
        "SEARCH": "Suche:",
        "WEATHER": "Wetter",
        "WEATHER_CITY": "Stadt",
        "WEATHER_SEARCH": "Wetter anzeigen",
        "WEATHER_CITY_HINT": "Stadt eingeben, optional mit Land oder Region (z. B. Berlin, DE).",
        "WEATHER_CHOOSE": "Bitte wähle einen Ort:",
        "WEATHER_CREDIT": "Wetterdaten von Open-Meteo",
        "WEATHER_CURRENT": "Aktuell",
        "WEATHER_FORECAST": "24 Stunden",
        "WEATHER_DAILY": "7 Tage",
        "WEATHER_PERIOD": "Vorhersagezeitraum",
        "WEATHER_MIN_1": "Min.: {0}",
        "WEATHER_MAX_1": "Max.: {0}",
        "WEATHER_DAILY_WIND": "Maximale Windgeschwindigkeit",
        "WEATHER_TIME_ZONE_1": "Ortszeit: {0}",
        "WEATHER_OBSERVED_1": "Stand: {0}",
        "WEATHER_WIND_1": "Wind: {0}",
        "WEATHER_WIND_STRENGTH_1": "Windstärke: {0}",
        "WEATHER_WIND_CALM": "Windstill",
        "WEATHER_WIND_LIGHT": "Leicht",
        "WEATHER_WIND_MODERATE": "Mäßig",
        "WEATHER_WIND_FRESH": "Frisch",
        "WEATHER_WIND_STRONG": "Stark",
        "WEATHER_PRECIPITATION_1": "Niederschlagswahrscheinlichkeit: {0}",
        "WEATHER_PREVIOUS": "Frühere Vorhersage anzeigen",
        "WEATHER_NEXT": "Spätere Vorhersage anzeigen",
        "WEATHER_LOADING": "Wetter wird geladen...",
        "WEATHER_CLEAR": "Klar",
        "WEATHER_CLOUDY": "Bewölkt",
        "WEATHER_FOG": "Nebel",
        "WEATHER_DRIZZLE": "Nieselregen",
        "WEATHER_RAIN": "Regen",
        "WEATHER_SNOW": "Schnee",
        "WEATHER_SHOWERS": "Schauer",
        "WEATHER_THUNDERSTORM": "Gewitter",
        "WEATHER_UNKNOWN": "Wetterlage nicht verfügbar",
        "ERROR_WEATHER_LOCATION_NOT_FOUND": "Kein passender Ort gefunden.",
        "ERROR_WEATHER_PROVIDER": "Der Wetterdienst ist derzeit nicht verfügbar.",
        "ERROR_WEATHER_TIMEOUT": "Der Wetterdienst hat nicht rechtzeitig geantwortet.",
        "ERROR_WEATHER_RATE_LIMIT": "Zu viele Wetteranfragen. Bitte versuche es später erneut.",
        "ERROR_WEATHER_RESPONSE": "Die Antwort des Wetterdienstes ist ungültig.",
        "ERROR_WEATHER_STORAGE": "Der gespeicherte Wetterort konnte nicht gelesen oder gespeichert werden. Bitte suche den Ort erneut; prüfe bei Bedarf die Browsereinstellungen.",
        "COPIED_TO_CLIPBOARD": "In die Zwischenablage kopiert",
        "WEBSITE_INFO": "Dies ist eine private Website. Sie wird ausschließlich für persönliche oder familiäre Zwecke verwendet.",
        "CONFIRMATION_SAVE": "Die Änderungen wurden nicht gespeichert. Willst du die Seite wirklich verlassen?",
        "LABEL_DIARY_ENTRY": "Tagebucheintrag:",
        "INFO_REALLY_DELETE_CONTACT": "Willst du den Kontakt wirklich löschen?",
        "INFO_REALLY_DELETE_PASSWORD": "Willst du das Kennwort wirklich löschen?",
        "INFO_REALLY_REMOVE_PROFILE_PICTURE": "Willst du dein Profilbild wirklich entfernen?",
        "LABEL_DESTINATION_FOLDER": "Zielordner:",
        "FILE_DOWNLOADED_1": "Die Datei {0} wurde heruntergeladen.",
        "LABEL_DARK": "Dunkel",
        "LABEL_LIGHT": "Hell",
        "LABEL_GERMAN": "Deutsch",
        "LABEL_ENGLISH": "Englisch",
        "LABEL_LANGUAGE": "Sprache:",
        "LABEL_DESIGN": "Design:",
        "SETTINGS": "Einstellungen",
        "INFO_STORAGE_1_2": "Es werden {0} von {1} Cloud-Speicher verwendet.",
        "BUTTON_SET_PIN": "PIN festlegen",
        "INFO_PIN": "Lege eine 4-6 stellige PIN fest, um dich zukünftig schneller anzumelden.",
        "INFO_LOGOUT_SUCCESS": "Du wurdest erfolgreich abgemeldet.",
        "GAMES": "Spiele",
        "ARKANOID": "Arkanoid",
        "TETRIS": "Tetris (Classic)",
        "TETRIS_ARCADE": "Tetris (Arcade)",
        "CHESS": "Schach",
        "BACKGAMMON": "Backgammon",
        "SKAT": "Skat",
        "CARD_TITLE_PERSONAL": "Persönliches",
        "CAROUSEL_TITLE_RESTAURANTS": "Restaurants",
        "CAROUSEL_TEXT_RESTAURANTS": "Restaurants in München",
        "CAROUSEL_TITLE_IMAGE_GALLERY": "Bildergalerie",
        "CAROUSEL_TEXT_IMAGE_GALLERY": "Eine Diashow",
        "CAROUSEL_TITLE_CONCERTS": "Konzerte",
        "CAROUSEL_TEXT_CONCERTS": "Konzerte und Musikfestivals",
        "CAROUSEL_TITLE_PICTURE_FRAMES": "Fotos",
        "CAROUSEL_TEXT_PICTURE_FRAMES": "Digitale Bilderrahmen",
        "CAROUSEL_TITLE_PAINTER": "Bärbel Jentz",
        "CAROUSEL_TEXT_PAINTER": "Meine Schwägerin ist Hobby-Malerin",
        "INFO_LEGAL_NOTICE": "Impressum",
        "INFO_SOURCE_CODE": "Quellcode",
        "INFO_ACCOUNT_DELETED": "Dein Konto wurde erfolgreich gelöscht.",
        "OPTION_ALLOW_DELETE_ACCOUNT": "Konto löschen aktivieren",
        "GAMES_SKAT": "Skat",
        "GAMES_BACKGAMMON": "Backgammon",
        "GAMES_CHESS": "Schach",
        "GAMES_ARKANOID": "Arkanoid",
        "GAMES_TETRIS_ARCADE": "Tetris (Arcade)",
        "GAMES_TETRIS_CLASSIC": "Tetris (Classic)",
        "ATTENTION": "Achtung",
        "LOGOUT_IF_NOT_ACTIVE": "Du wirst automatisch abgemeldet, wenn du nicht aktiv bist.",
        "SECONDS_LEFT_1": "in {0} Sekunden...",
        "ACCOUNT_SETTINGS": "Kontoeinstellungen",
        "ACCOUNT_INFORMATION": "Kontoinformationen",
        "ACCOUNT_LAST_LOGIN_UNAVAILABLE": "Keine frühere Anmeldung verfügbar.",
        "ACCOUNT_EXPORT": "Daten exportieren",
        "ACCOUNT_EXPORT_TYPE": "Datentyp",
        "ACCOUNT_EXPORT_START": "Exportieren",
        "ACCOUNT_EXPORT_NOTES": "Notizen",
        "ACCOUNT_EXPORT_DIARY": "Tagebuch",
        "ACCOUNT_EXPORT_CONTACTS": "Kontakte",
        "ACCOUNT_EXPORT_PASSWORDS": "Passwörter",
        "ACCOUNT_EXPORT_DOCUMENTS": "Dokumente",
        "ACCOUNT_EXPORT_PASSPHRASE": "Neue Export-Passphrase (mindestens 12 Zeichen)",
        "ACCOUNT_EXPORT_CONFIRM": "Export-Passphrase wiederholen",
        "PASSWORD_BACKUP_OPEN": "Passwortsicherung öffnen",
        "ACCOUNT_EXPORT_PASSWORD_WARNING": "Passwörter werden als verschlüsselte JSON-Sicherung exportiert. Verwende eine neue Passphrase, nicht dein Kontopasswort. Bewahre sie sicher auf; ohne sie ist die Sicherung nicht lesbar.",
        "ACCOUNT_IMPORT": "Daten importieren",
        "ACCOUNT_IMPORT_WARNING": "Vorhandene Daten bleiben erhalten. Notizen, Kontakte und Passwörter werden hinzugefügt; erneute Importe können Duplikate erzeugen. Vorhandene Tagebucheinträge werden übersprungen. Notiz- und Dokumentnamen stammen aus dem bereinigten Export; Dokumente werden privat importiert und bei Namenskonflikten umbenannt. Ein Fehler kann einen Teilimport hinterlassen. ZIP und entpackte Daten sind auf jeweils 512 MiB begrenzt und benötigen Arbeitsspeicher.",
        "ACCOUNT_IMPORT_FILE": "Exportierte ZIP-Datei",
        "ACCOUNT_IMPORT_START": "Importieren",
        "ACCOUNT_IMPORT_PASSPHRASE": "Export-Passphrase",
        "ACCOUNT_IMPORT_CHECKING": "Daten und Archiv werden geprüft...",
        "ACCOUNT_IMPORT_CANCEL": "Abbrechen",
        "ACCOUNT_IMPORT_CONTINUE": "Importieren",
        "ACCOUNT_IMPORT_CONFIRM_EXISTING_1": "Für {0} sind bereits Daten vorhanden. Der Import kann Duplikate erzeugen. Möchtest du fortfahren?",
        "ACCOUNT_IMPORT_CONFIRM_DIARY": "Es sind bereits Tagebucheinträge vorhanden. Einträge für bereits vorhandene Tage werden übersprungen. Möchtest du fortfahren?",
        "ACCOUNT_IMPORT_PROGRESS_1_2": "{0} von {1} Schritten importiert...",
        "ACCOUNT_IMPORT_DONE": "Import abgeschlossen.",
        "ACCOUNT_IMPORT_DIARY_DONE": "Import abgeschlossen. Bereits vorhandene Tagebucheinträge werden beim Import übersprungen.",
        "ACCOUNT_IMPORT_PARTIAL_1": "Der Import wurde unterbrochen; Daten können bereits gespeichert sein. Prüfe den Bestand, bevor du es erneut versuchst. Fehler: {0}",
        "ERROR_IMPORT_FILE": "Wähle einen Datentyp und eine ZIP-Datei aus.",
        "ERROR_IMPORT_EXISTING": "Vorhandene Daten konnten nicht sicher für den Import gelesen werden.",
        "ERROR_IMPORT_TOO_LARGE": "Die zusammengeführten Daten überschreiten die erlaubte Größe.",
        "ERROR_IMPORT_ARCHIVE": "Die ZIP-Datei ist ungültig, zu groß oder passt nicht zum gewählten Datentyp.",
        "ERROR_IMPORT_PASSPHRASE": "Die Export-Passphrase ist falsch oder die Passwortsicherung ist beschädigt.",
        "ERROR_EXPORT_PASSPHRASE": "Gib eine Export-Passphrase mit mindestens 12 Zeichen ein und wiederhole sie identisch.",
        "ERROR_EXPORT_RESPONSE": "Ungültige oder fehlende Exportdaten. Der Export wurde abgebrochen; es wurde kein unvollständiges Archiv heruntergeladen.",
        "ACCOUNT_EXPORT_WARNING": "Die Daten werden im Browser entschlüsselt und als ZIP heruntergeladen. Nur die Passwortsicherung ist zusätzlich verschlüsselt. Bewahre Exporte sicher auf. Der Browser bestimmt den Speicherort. Große Dokumentexporte benötigen entsprechend viel Arbeitsspeicher.",
        "ACCOUNT_EXPORT_LOADING": "Daten werden geladen...",
        "ACCOUNT_EXPORT_BUSY": "Ein Export läuft bereits.",
        "ACCOUNT_EXPORT_PROGRESS_1_2": "{0} von {1} Einträgen exportiert...",
        "ACCOUNT_EXPORT_PACKAGING": "ZIP-Archiv wird erstellt...",
        "ACCOUNT_EXPORT_EMPTY": "Keine Daten dieses Typs zum Exportieren vorhanden.",
        "ACCOUNT_EXPORT_READY": "Export bereit. Falls der Download nicht startet, verwende den Link unten.",
        "ACCOUNT_EXPORT_DOWNLOAD": "Export-ZIP herunterladen",
        "ERROR_NOTES_EXPORT_RESPONSE": "Ungültige Notizdaten. Der Export wurde abgebrochen; es wurde kein unvollständiges Archiv heruntergeladen.",
        "VIEW_SETTINGS": "Anzeigeeinstellungen",
        "LABEL_APPLICATIONS": "Anwendungen:",

        "ERROR_FILE_TOO_LARGE_1_2": "Die Datei {0} ist zu groß. Die Dateigröße ist {1}, aber höchstens 20MB sind erlaubt.",
        "ERROR_WRONG_DATA_PROTECTION_KEY": "Der Schlüssel zum Entschlüsseln der Daten ist ungültig oder fehlt. Bitte überprüfe deinen Schlüssel auf der Seite 'Datenschutz'.",
        "ERROR_DESCRIPTION_MISSING": "Die Beschreibung fehlt.",
        "ERROR_PARTICIPANTS_MISSING": "Die Teilnehmer fehlen.",
        "ERROR_OPTIONS_MISSING": "Es wurden keine Tage ausgewählt.",
        "ERROR_CANNOT_REMOVE_PARTICIPANT_AS_VOTES_ALREADY_EXIST": "Teilnehmer können nicht entfernt werden, wenn schon abgestimmt wurde."
    }

    private englisch = {
        "APP_NAME": "stockfleth.eu",
        "WELCOME_TITLE": "Your personal portal",
        "WELCOME_INTRO": "stockfleth.eu is a private portal for family and friends. Here you can organize your day and keep important information in one place.",
        "WELCOME_SIGN_IN": "Sign in",
        "WELCOME_REQUEST_ACCOUNT": "Request an account",
        "WELCOME_APPROVAL": "Account requests require approval.",
        "WELCOME_ORGANIZE_TITLE": "Organize your information",
        "WELCOME_ORGANIZE_TEXT": "Capture ideas in notes, keep a diary, and manage your contacts, documents, and passwords.",
        "WELCOME_PLAN_TITLE": "Plan your day",
        "WELCOME_PLAN_TEXT": "Manage appointments and check the hourly or seven-day weather forecast.",
        "WELCOME_BACKUP_TITLE": "Back up and restore your data",
        "WELCOME_BACKUP_TEXT": "Export and import your data as ZIP files. Read password backups directly in your browser without signing in.",
        "MESSAGE_WELCOME_1_2_3": "Hello {0}! Today is {1}. It is {2}.",
        "MESSAGE_LAST_LOGIN_1": "Your last login was on {0}.",
        "LANGUAGE": "Language",
        "ABOUT": "About",
        "ABOUT_API_VERSION_1": "API server: {0}",
        "ERROR_API_VERSION_1": "Could not load API server version: {0}",
        "ERROR_API_VERSION_RESPONSE": "Invalid API server version response.",
        "INFO_ENTER_USERNAME": "Enter your username or email address.",
        "INFO_ENTER_PASSWORD": "Enter your password.",
        "INFO_ENTER_KEY": "Enter your key to encrypt and decrypt your data.",
        "DESKTOP": "Desktop",
        "DATA_PROTECTION": "Data Protection",
        "DOCUMENTS_SELECT_ITEMS": "Select items",
        "DOCUMENTS_CANCEL_SELECTION": "Cancel selection",
        "DOCUMENTS_SELECT_ALL": "Select or deselect all displayed items",
        "DOCUMENTS_SELECT_ITEM_1": "Select {0}",
        "DOCUMENTS_VISIBILITY": "Folder visibility",
        "DOCUMENTS_PRIVATE": "Private (owner only)",
        "DOCUMENTS_FAMILY": "Family",
        "DOCUMENTS_PUBLIC": "Public (no login required)",
        "DOCUMENTS_EDIT_CONTENT": "Edit Markdown content",
        "DOCUMENTS_CONTENT_SAVED": "Content saved.",
        "DOCUMENTS_ACCESS_WARNING": "This setting applies to new files uploaded directly into this folder. Existing files and subfolders are unchanged. No files are encrypted or decrypted. New subfolders are private. Public files can be downloaded without signing in; family files require the Family role. Shared files are stored unencrypted.",
        "DOCUMENTS_SHARED_UPLOAD": "New files in this folder are stored unencrypted with its visibility. New subfolders remain private.",
        "DOCUMENTS_MOVE_WARNING": "Moving files and folders changes neither their visibility nor their encryption.",
        "ERROR_DOCUMENT_UPDATE": "The change was not confirmed. Please refresh and check before retrying.",
        "ERROR_DOCUMENT_ACCESS_ROLE": "This folder visibility is not supported by the client.",
        "ADMINISTRATION": "Administration",
        "ERROR_ADMINISTRATION_ACCESS": "Administrator privileges are required for administration.",
        "ADMIN_REGISTRATIONS": "Registration requests",
        "ADMIN_REGISTRATION_EMPTY": "No outstanding registration requests.",
        "ADMIN_REGISTRATION_DATE_UNKNOWN": "Date unavailable",
        "ADMIN_REGISTRATION_NOTIFY": "Send email notification",
        "ADMIN_REGISTRATION_APPROVE": "Approve",
        "ADMIN_REGISTRATION_REJECT": "Reject",
        "ADMIN_REGISTRATION_REFRESH": "Refresh",
        "ADMIN_REGISTRATION_APPROVED_1_2": "{0}: Approved. Registration code: {1}",
        "ADMIN_REGISTRATION_REJECTED_1": "{0}: Rejected.",
        "ADMIN_REGISTRATION_FAILED_1_2": "{0}: {1} The request may already have been processed. Please check before retrying.",
        "ERROR_REGISTRATION_RESPONSE": "The registration request response is invalid.",
        "ADMIN_USERS": "Registered users",
        "ADMIN_USER_EMPTY": "No users found.",
        "ADMIN_USER_SELECT_1": "Select {0} for deletion",
        "ADMIN_USER_LOCKED": "Locked",
        "ADMIN_USER_LOGIN_DISABLED": "Login disabled",
        "ADMIN_USER_SELF_DELETE": "You can delete your own account in Account Settings.",
        "ADMIN_USER_DELETE": "Delete selected users",
        "ADMIN_USER_CONFIRM_DELETE_1": "Permanently delete these accounts and their data: {0}?",
        "ADMIN_USER_DELETED_1": "{0}: Account deleted.",
        "ADMIN_USER_DELETE_FAILED_1_2": "{0}: {1} Please check the account status before retrying.",
        "ADMIN_USER_REFRESH": "Refresh users",
        "ADMIN_USER_EMAIL_1": "Email: {0}",
        "ADMIN_USER_REGISTERED_1": "Registered: {0}",
        "ADMIN_USER_LAST_LOGIN_1": "Last login: {0}",
        "ADMIN_USER_STORAGE_USED_1": "Storage used: {0}",
        "ADMIN_USER_QUOTA": "Storage quota (MB)",
        "ADMIN_USER_SAVE_QUOTA": "Save quota",
        "ADMIN_USER_LOGIN_ENABLED": "Allow login",
        "ADMIN_USER_ROLES": "Roles",
        "ADMIN_ROLE_USERMANAGER": "Administrator",
        "ADMIN_ROLE_FAMILY": "Family",
        "ADMIN_ROLE_SKATADMIN": "Skat administrator",
        "ADMIN_USER_UNLOCK": "Unlock account",
        "ADMIN_USER_BACK": "Back to users",
        "ADMIN_USER_UPDATED": "Change saved.",
        "ADMIN_USER_UPDATE_FAILED_1": "{0} Please refresh the user before retrying.",
        "ERROR_ADMIN_USER_UNCHANGED": "The change was not made. The user status may have changed.",
        "ERROR_ADMIN_USER_RESPONSE": "The user management response is invalid.",
        "ERROR_ADMIN_USER_QUOTA": "The quota must be a whole number between 2 and 1000 MB and greater than the storage used.",
        "KEY_INFO": "Store your key in a safe place. If lost, the data cannot be recovered.",
        "STAY_SIGNED_IN": "Stay signed in",
        "BIRTHDAYS": "Birthdays",
        "DAYS": "days",
        "TODAY": "Today",
        "TOMORROW": "Tomorrow",
        "CONTACTS": "Contacts",
        "NOTES": "Notes",
        "PASSWORD_MANAGER": "Passwords",
        "DIARY": "Diary",
        "SEARCH": "Search:",
        "WEATHER": "Weather",
        "WEATHER_CITY": "City",
        "WEATHER_SEARCH": "Show weather",
        "WEATHER_CITY_HINT": "Enter a city, optionally followed by country or region (e.g. Berlin, DE).",
        "WEATHER_CHOOSE": "Choose a location:",
        "WEATHER_CREDIT": "Weather data by Open-Meteo",
        "WEATHER_CURRENT": "Current",
        "WEATHER_FORECAST": "24 hours",
        "WEATHER_DAILY": "7 days",
        "WEATHER_PERIOD": "Forecast period",
        "WEATHER_MIN_1": "Min: {0}",
        "WEATHER_MAX_1": "Max: {0}",
        "WEATHER_DAILY_WIND": "Maximum wind speed",
        "WEATHER_TIME_ZONE_1": "Local time: {0}",
        "WEATHER_OBSERVED_1": "As of: {0}",
        "WEATHER_WIND_1": "Wind: {0}",
        "WEATHER_WIND_STRENGTH_1": "Wind strength: {0}",
        "WEATHER_WIND_CALM": "Calm",
        "WEATHER_WIND_LIGHT": "Light",
        "WEATHER_WIND_MODERATE": "Moderate",
        "WEATHER_WIND_FRESH": "Fresh",
        "WEATHER_WIND_STRONG": "Strong",
        "WEATHER_PRECIPITATION_1": "Precipitation probability: {0}",
        "WEATHER_PREVIOUS": "Show earlier forecast",
        "WEATHER_NEXT": "Show later forecast",
        "WEATHER_LOADING": "Loading weather...",
        "WEATHER_CLEAR": "Clear",
        "WEATHER_CLOUDY": "Cloudy",
        "WEATHER_FOG": "Fog",
        "WEATHER_DRIZZLE": "Drizzle",
        "WEATHER_RAIN": "Rain",
        "WEATHER_SNOW": "Snow",
        "WEATHER_SHOWERS": "Showers",
        "WEATHER_THUNDERSTORM": "Thunderstorm",
        "WEATHER_UNKNOWN": "Weather condition unavailable",
        "ERROR_WEATHER_LOCATION_NOT_FOUND": "No matching location was found.",
        "ERROR_WEATHER_PROVIDER": "The weather service is currently unavailable.",
        "ERROR_WEATHER_TIMEOUT": "The weather service did not respond in time.",
        "ERROR_WEATHER_RATE_LIMIT": "Too many weather requests. Please try again later.",
        "ERROR_WEATHER_RESPONSE": "The weather service returned an invalid response.",
        "ERROR_WEATHER_STORAGE": "The saved weather location could not be read or stored. Please search again; check your browser settings if needed.",
        "COPIED_TO_CLIPBOARD": "Copied to the clipboard",
        "WEBSITE_INFO": "This is a private website. It is intended for personal or family use only.",
        "CONFIRMATION_SAVE": "The changes were not saved. Are you sure you want to leave the page?",
        "LABEL_DIARY_ENTRY": "Diary entry:",
        "INFO_REALLY_DELETE_CONTACT": "Do you really want to delete the contact?",
        "INFO_REALLY_DELETE_PASSWORD": "Do you really want to delete the password?",
        "INFO_REALLY_REMOVE_PROFILE_PICTURE": "Do you really want to remove your profile picture?",
        "LABEL_DESTINATION_FOLDER": "Destination folder:",
        "FILE_DOWNLOADED_1": "The file {0} has been downloaded.",
        "LABEL_DARK": "Dark",
        "LABEL_LIGHT": "Light",
        "LABEL_GERMAN": "German",
        "LABEL_ENGLISH": "English",
        "LABEL_LANGUAGE": "Language:",
        "LABEL_DESIGN": "Design:",
        "SETTINGS": "Settings",
        "INFO_STORAGE_1_2": "{0} of {1} cloud storage is used.",
        "BUTTON_SET_PIN": "Set PIN",
        "INFO_PIN": "Set a 4-6 digit PIN to log in faster in the future.",
        "INFO_LOGOUT_SUCCESS": "You have been logged out successfully.",
        "GAMES": "Games",
        "ARKANOID": "Arkanoid",
        "TETRIS": "Tetris (Classic)",
        "TETRIS_ARCADE": "Tetris (Arcade)",
        "CHESS": "Chess",
        "BACKGAMMON": "Backgammon",
        "SKAT": "Skat",
        "CARD_TITLE_PERSONAL": "Personal",
        "CAROUSEL_TITLE_RESTAURANTS": "Restaurants",
        "CAROUSEL_TEXT_RESTAURANTS": "Restaurants in Munich",
        "CAROUSEL_TITLE_IMAGE_GALLERY": "Image Gallery",
        "CAROUSEL_TEXT_IMAGE_GALLERY": "A slideshow",
        "CAROUSEL_TITLE_CONCERTS": "Concerts",
        "CAROUSEL_TEXT_CONCERTS": "Concerts and music festivals",
        "CAROUSEL_TITLE_PICTURE_FRAMES": "Photos",
        "CAROUSEL_TEXT_PICTURE_FRAMES": "Digital photo frames",
        "CAROUSEL_TITLE_PAINTER": "Bärbel Jentz",
        "CAROUSEL_TEXT_PAINTER": "My sister-in-law is a hobby painter",
        "INFO_LEGAL_NOTICE": "Legal Notice",
        "INFO_SOURCE_CODE": "Source Code",
        "INFO_ACCOUNT_DELETED": "Your account has been deleted successfully.",
        "OPTION_ALLOW_DELETE_ACCOUNT": "Activate account deletion",
        "GAMES_SKAT": "Skat",
        "GAMES_BACKGAMMON": "Backgammon",
        "GAMES_CHESS": "Chess",
        "GAMES_ARKANOID": "Arkanoid",
        "GAMES_TETRIS_ARCADE": "Tetris (Arcade)",
        "GAMES_TETRIS_CLASSIC": "Tetris (Classic)",
        "ATTENTION": "Attention",
        "LOGOUT_IF_NOT_ACTIVE": "You will be logged out automatically if you are not active.",
        "SECONDS_LEFT_1": "in {0} seconds...",
        "ACCOUNT_SETTINGS": "Account Settings",
        "ACCOUNT_INFORMATION": "Account information",
        "ACCOUNT_LAST_LOGIN_UNAVAILABLE": "No previous login available.",
        "ACCOUNT_EXPORT": "Export data",
        "ACCOUNT_EXPORT_TYPE": "Data type",
        "ACCOUNT_EXPORT_START": "Export",
        "ACCOUNT_EXPORT_NOTES": "Notes",
        "ACCOUNT_EXPORT_DIARY": "Diary",
        "ACCOUNT_EXPORT_CONTACTS": "Contacts",
        "ACCOUNT_EXPORT_PASSWORDS": "Passwords",
        "ACCOUNT_EXPORT_DOCUMENTS": "Documents",
        "ACCOUNT_EXPORT_PASSPHRASE": "New export passphrase (at least 12 characters)",
        "ACCOUNT_EXPORT_CONFIRM": "Repeat export passphrase",
        "PASSWORD_BACKUP_OPEN": "Open password backup",
        "ACCOUNT_EXPORT_PASSWORD_WARNING": "Passwords are exported as an encrypted JSON backup. Use a new passphrase, not your account password. Keep it safe: the backup cannot be read without it.",
        "ACCOUNT_IMPORT": "Import data",
        "ACCOUNT_IMPORT_WARNING": "Existing data is preserved. Notes, contacts and passwords are added; repeated imports can create duplicates. Existing diary dates are skipped. Note and document names use sanitized export names; documents are imported privately and renamed on conflicts. An error may leave a partial import. The ZIP and extracted data are each limited to 512 MiB and require browser memory.",
        "ACCOUNT_IMPORT_FILE": "Exported ZIP file",
        "ACCOUNT_IMPORT_START": "Import",
        "ACCOUNT_IMPORT_PASSPHRASE": "Export passphrase",
        "ACCOUNT_IMPORT_CHECKING": "Checking account and archive...",
        "ACCOUNT_IMPORT_CANCEL": "Cancel",
        "ACCOUNT_IMPORT_CONTINUE": "Import",
        "ACCOUNT_IMPORT_CONFIRM_EXISTING_1": "The account already has data for {0}. Importing may create duplicates. Do you want to continue?",
        "ACCOUNT_IMPORT_CONFIRM_DIARY": "The account already has diary entries. Entries for existing dates will be skipped. Do you want to continue?",
        "ACCOUNT_IMPORT_PROGRESS_1_2": "Imported {0} of {1} steps...",
        "ACCOUNT_IMPORT_DONE": "Import completed.",
        "ACCOUNT_IMPORT_DIARY_DONE": "Import completed. Existing diary entries, if any, were skipped.",
        "ACCOUNT_IMPORT_PARTIAL_1": "Import stopped; some data may already have been saved. Check your data before retrying. Error: {0}",
        "ERROR_IMPORT_FILE": "Choose a data type and ZIP file.",
        "ERROR_IMPORT_EXISTING": "Existing data could not be read safely for import.",
        "ERROR_IMPORT_TOO_LARGE": "The combined data exceeds the allowed size.",
        "ERROR_IMPORT_ARCHIVE": "The ZIP file is invalid, too large, or does not match the selected data type.",
        "ERROR_IMPORT_PASSPHRASE": "The export passphrase is incorrect or the password backup is damaged.",
        "ERROR_EXPORT_PASSPHRASE": "Enter an export passphrase of at least 12 characters and repeat it exactly.",
        "ERROR_EXPORT_RESPONSE": "Invalid or missing export data. Export stopped; no incomplete archive was downloaded.",
        "ACCOUNT_EXPORT_WARNING": "Data is decrypted in your browser and downloaded as a ZIP. Only the password backup is additionally encrypted. Store exports securely. Your browser controls the save location. Large document exports require corresponding browser memory.",
        "ACCOUNT_EXPORT_LOADING": "Loading data...",
        "ACCOUNT_EXPORT_BUSY": "An export is already running.",
        "ACCOUNT_EXPORT_PROGRESS_1_2": "Exported {0} of {1} items...",
        "ACCOUNT_EXPORT_PACKAGING": "Creating ZIP archive...",
        "ACCOUNT_EXPORT_EMPTY": "There is no data of this type to export.",
        "ACCOUNT_EXPORT_READY": "Export ready. If the download does not start, use the link below.",
        "ACCOUNT_EXPORT_DOWNLOAD": "Download export ZIP",
        "ERROR_NOTES_EXPORT_RESPONSE": "Invalid note data. Export stopped; no incomplete archive was downloaded.",
        "VIEW_SETTINGS": "View Settings",
        "LABEL_APPLICATIONS": "Applications:",

        "ERROR_FILE_TOO_LARGE_1_2": "The file {0} is too large. The file size is {1} but at most 20MB are allowed.",
        "ERROR_WRONG_DATA_PROTECTION_KEY": "The key to decrypt the data is invalid or missing. Please check your key on the 'Data Protection' page.",
        "ERROR_DESCRIPTION_MISSING": "The description is missing.",
        "ERROR_PARTICIPANTS_MISSING": "The participants are missing.",
        "ERROR_OPTIONS_MISSING": "No days have been selected.",
        "ERROR_CANNOT_REMOVE_PARTICIPANT_AS_VOTES_ALREADY_EXIST": "Participants cannot be removed if voting has already started."
    }

    /**
     * Returns the currently set language code.
     * 
     * @returns the language code, e.g. "de" for German and "en" for English
     */
    getLanguage(): string {
        return this.language;
    }

    /**
     * Sets the language code for translations and loads the corresponding locale data.
     * 
     * @param language the language code to set, e.g. "de" for German and "en" for English or undefined to use the current language
     */
    async setLanguageAsync(language?: string): Promise<void> {
        if (language) {
            this.language = language;
            window.localStorage.setItem("locale", language);
        }
        const resp1: Response = await fetch(`/api/pwdman/locale/url/${this.getLanguage()}`);
        const url: any = await resp1.json();
        const resp2: Response = await fetch(url);
        const json: any = await resp2.json();
        this.translationMap.clear();
        Object.entries(json).forEach(([key, value]) => this.translationMap.set(key, value as string));
        const contentLanguage = this.language === "de" ? "de" : "en";
        const texts = contentLanguage === "de" ? this.german : this.englisch;
        Object.entries(texts).forEach(([key, value]) => this.translationMap.set(key, value as string));
        document.documentElement.lang = contentLanguage;
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
    translate(key: string): string {
        const arr: string[] = key.split(":");
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
    translateWithArgs(key: string, restArgs: string[]): string {
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
    translateError(error: Error | unknown): string {
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
            const reg: RegExp = new RegExp("\\{" + i + "\\}", "gm");
            s = s.replace(reg, arr[i]!);
        }
        return s;
    }
}