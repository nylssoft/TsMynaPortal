/**
 * ClientInfo represents information about a client.
 * It includes properties such as uuid and name.
 * This type is used to manage client-related data in the application.
 */
export type ClientInfo = {
  uuid: string;
  name: string;
}

/**
 * AuthResult represents the result of an authentication attempt.
 * It includes properties such as requiresPin, token, username,
 * requiresPass2, and longLivedToken.
 * This type is used to handle authentication responses in the application.
 */
export type AuthResult = {
  requiresPin: boolean;
  token: string | null;
  username: string | null;
  requiresPass2: boolean;
  longLivedToken: string | null;
}

/**
 * ErrorResult represents an error response from the API.
 * It includes properties such as type, title, status, and traceId.
 * This type is used to handle errors in the application.
 */
export type ErrorResult = {
  type: string | null,
  title: string | null,
  status: number,
  traceId: string | null
}

/**
 * UserInfoResult represents the user information returned by the API.
 * It includes various properties such as user ID, name, email, roles, and security key.
 * This type is used to manage user-related data in the application.
 */
export type UserInfoResult = {
  id: number,
  name: string,
  email: string,
  requires2FA: boolean,
  useLongLivedToken: boolean,
  usePin: boolean,
  allowResetPassword: boolean,
  lastLoginUtc: string | null,
  registeredUtc: string,
  roles: string[],
  passwordManagerSalt: string,
  accountLocked: boolean,
  photo: string | null,
  storageQuota: number,
  usedStorage: number,
  loginEnabled: boolean,
  hasContacts: boolean,
  hasDiary: boolean,
  hasDocuments: boolean,
  hasNotes: boolean,
  hasPasswordManagerFile: boolean,
  secKey: string | null
}

/**
 * ContactsResult represents the result of fetching contacts.
 * It includes properties such as nextId, version, and items.
 * This type is used to manage the contacts data in the application.
 */
export type ContactsResult = {
  nextId: number,
  version: number,
  items: ContactResult[]
}

/**
 * ContactResult represents a single contact's information.
 * It includes properties such as id, name, address, phone, birthday, email, note, and optionally daysUntilBirthday.
 * This type is used to manage individual contact data in the application.
 */
export type ContactResult = {
  id: number,
  name: string,
  address: string,
  phone: string,
  birthday: string,
  email: string,
  note: string,
  daysUntilBirthday: number | null
}

/**
 * NoteResult represents a single note's information.
 * It includes properties such as id, title, lastModifiedUtc, and content.
 * This type is used to manage individual note data in the application.
 */
export type NoteResult = {
  id: number,
  title: string,
  lastModifiedUtc: string,
  content: string | null
}