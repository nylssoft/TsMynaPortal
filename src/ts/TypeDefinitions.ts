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