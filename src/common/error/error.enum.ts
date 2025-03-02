export enum ResponseCode {
  SUCCESS = 1000,
  INTERNAL_SERVER_ERROR = 1001,
  INVALID_USER_TOKEN = 1002,
  INVALID_TOKEN = 1003,
  UNAUTHORIZED = 1004,

  USER_NOT_VERIFIED = 2001,
  VERIFY_EMAIL_ERROR = 2002,
  RESET_PASSWORD_ERROR = 2003,
  CREDENTIAL_ERROR = 2004,
  USER_NOT_FOUND = 2005,
  SAME_EMAIL_ERROR = 2006,
  WRONG_PASSWORD = 2007,
  DUPLICATE_COURSE = 2008,
  DUPLICATE_CLASS = 2009,
  REGISTERED_COURSE = 2010,

  BILLING_ADD_AVAILABLE_ERROR = 3001,
}
