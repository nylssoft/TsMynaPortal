export type LoginState = {
  token: string;
  userName: string;
  requiresPass2: boolean;
}

export type ClientInfo = {
  uuid: string;
  name: string;
}

export type AuthResult = {
  requiresPin: boolean;
  token: string;
  username: string;
  requiresPass2: boolean;
  longLivedToken: string;
}

export type ErrorResult = {
  type: string,
  title: string,
  status: number,
  traceId: string
}