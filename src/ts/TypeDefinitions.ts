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
 * Store pwdman-state in session storage to use older applications and games if logged-in.
 */
export type PwdManState = {
  token: string;
  userName: string;
  requiresPass2: boolean;
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

export type AuditResult = {
  performedUtc: string,
  action: string
}

// contact types

export type ContactsResult = {
  nextId: number,
  version: number,
  items: ContactResult[]
}

export type ContactResult = {
  id?: number,
  name: string,
  address: string,
  phone: string,
  birthday: string,
  email: string,
  note: string,
  daysUntilBirthday?: number
}

// note types

export type NoteResult = {
  id?: number,
  title: string,
  content: string | null,
  lastModifiedUtc?: string,
}

// password types

export type PasswordItemsResult = {
  nextId: number,
  items: PasswordItemResult[]
}

export type PasswordItemResult = {
  id?: number,
  Description: string,
  Login: string,
  Name: string,
  Password: string,
  Url: string
}

// diary types

export type DiaryEntryResult = {
  date: string,
  entry: string
}

export type DayAndMonth = {
  day: number,
  month: number
}

export type MonthAndYear = {
  month: number,
  year: number
}

// document types

export type DocumentItemResult = {
  accessRole: string | null,
  children: number,
  id: number,
  name: string,
  parentId: number | null,
  size: number,
  type: DocumentItemType
}

export type DocumentItemType = "Document" | "Folder" | "Volume";

// appointment types

export type AppointmentBatchRequest = {
  Method: string,
  Uuid: string,
  accessToken: string
}

export type AppointmentResult = {
  uuid: string,
  createdUtc: Date,
  modifiedUtc: Date,
  ownerKey: string,
  definition?: AppointmentDefinition,
  votes?: AppointmentVote[],
  accessToken?: string
}

export type AppointmentDefinition = {
  description: string,
  options: AppointmentOption[],
  participants: AppointmentParticipant[],
}

export type AppointmentParticipant = {
  userUuid: string,
  username: string
}

export type AppointmentVote = {
  userUuid: string,
  accepted: AppointmentOption[]
}

export type AppointmentOption = {
  year: number,
  month: number,
  days: number[]
}

export type AppointmentUpdateDefinition = {
  Description: string,
  Options: AppointmentUpdateOption[],
  Participants: AppointmentUpdateParticipant[],
}

export type AppointmentUpdateParticipant = {
  UserUuid: string,
  Username: string
}

export type AppointmentUpdateOption = {
  Year: number,
  Month: number,
  Days: number[]
}

export type AppointmentUpdateVote = {
  UserUuid: string,
  Accepted: AppointmentUpdateOption[]
}

export type AppointmentUpdate = {
  OwnerKey: string,
  Definition: AppointmentUpdateDefinition
}

export type AppointmentBestVote = {
  year: number,
  month: number,
  day: number
}

// two factor

export type TwoFactorResult = {
  secretKey: string,
  issuer: string
}

// reset password

export type ResetPassword = {
  Email: string,
  Token: string,
  Password: string
}

// regiseter

export type RegisterInfo = {
  Username: string,
  Password: string,
  Email: string,
  Token: string
}

/**
 * Type representing the different pages in the application.
 */
export type PageType = "LOGIN_USERNAME_PASSWORD" | "LOGIN_PIN" | "LOGIN_PASS2" | "ABOUT" | "DESKTOP"
  | "DATA_PROTECTION" | "NAVIGATION_BAR" | "CONTACT_DETAIL" | "NOTE_DETAIL" | "PASSWORD_ITEM_DETAIL"
  | "DIARY_DETAIL" | "DOCUMENT_EDIT" | "DOCUMENT_MOVE" | "APPOINTMENT_DETAIL" | "APPOINTMENT_VOTE"
  | "SETTINGS" | "PIN_EDIT" | "PASSWORD_EDIT" | "TWO_FACTOR_EDIT" | "VIEW_MARKDOWN"
  | "REQUEST_RESET_PASSWORD" | "RESET_PASSWORD" | "REQUEST_REGISTER" | "REGISTER" | "GAMES";

export type DesktopTab = "BIRTHDAYS" | "CONTACTS" | "NOTES" | "PASSWORD_MANAGER" | "DIARY" | "DOCUMENTS" | "APPOINTMENTS";

export const Version: string = "1.5.2";