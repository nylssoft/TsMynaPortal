export type ClientInfo = {
  uuid: string;
  name: string;
}

export type AuthResult = {
  requiresPin: boolean;
  token: string | null;
  username: string | null;
  requiresPass2: boolean;
  longLivedToken: string | null;
}

export type ErrorResult = {
  type: string | null,
  title: string | null,
  status: number,
  traceId: string | null
}

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