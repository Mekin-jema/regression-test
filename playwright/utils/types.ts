export interface OtpOptions {
  subjectFilter?: string;
  senderFilter?: string;
  lookbackCount?: number;
  maxAgeMinutes?: number;
  waitMs?: number;
  pollMs?: number;
}

export interface ImapConfigEnv {
  GMAIL_USER?: string;
  GMAIL_APP_PASS?: string;
  IMAP_HOST?: string;
  IMAP_PORT?: string | number;
  IMAP_TLS?: string;
  IMAP_TLS_REJECT_UNAUTHORIZED?: string;
  GMAIL_SENDER_FILTER?: string;
  GMAIL_SUBJECT_FILTER?: string;
  OTP_LOOKBACK_COUNT?: string | number;
  OTP_MAX_AGE_MINUTES?: string | number;
  OTP_WAIT_MS?: string | number;
  OTP_POLL_INTERVAL_MS?: string | number;
}

export interface ResolvedOtpConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
  rejectUnauthorized: boolean;
  lookbackCount: number;
  maxAgeMinutes: number;
  waitMs: number;
  pollMs: number;
  senderFilter?: string;
  subjectFilter?: string;
}

export interface MailSearchFilters {
  senderFilter?: string;
  subjectFilter?: string;
}

export interface ImapMessage {
  attributes?: {
    uid?: number;
    date?: string | number | Date;
  };
  parts?: Array<{
    which?: string;
    body?: any;
  }>;
}

export interface ParsedMessageContext {
  from?: string;
  subject?: string;
  body: string;
  ageMinutes: number;
}
