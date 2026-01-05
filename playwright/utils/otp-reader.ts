import imaps, { ImapSimple, ImapSimpleOptions } from 'imap-simple';
import dns from 'dns';
import {
  ImapConfigEnv,
  ImapMessage,
  MailSearchFilters,
  OtpOptions,
  ParsedMessageContext,
  ResolvedOtpConfig,
} from './types';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

export class ImapOtpReader {
  private env: ImapConfigEnv;

  constructor(env: ImapConfigEnv = process.env as ImapConfigEnv) {
    this.env = env;
  }

  async getEmailOTP(opts: OtpOptions = {}): Promise<string> {
    const resolved = this.resolveConfig(opts);
    const imapOptions = this.createImapOptions(resolved);

    let connection: ImapSimple | undefined;
    try {
      connection = await imaps.connect(imapOptions);
      await connection.openBox('INBOX');

      const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: true };
      const started = Date.now();
      let otpValue: string | null = null;

      while (!otpValue && Date.now() - started < resolved.waitMs) {
        const messages = await this.searchMessages(connection, resolved, fetchOptions);

        if (messages.length === 0) {
          await this.delay(resolved.pollMs);
          continue;
        }

        for (const message of messages) {
          const context = this.parseMessageContext(message);
          if (context.ageMinutes > resolved.maxAgeMinutes) continue;
          if (!this.matchesFilters(context, resolved)) continue;

          const otp = this.extractOtp(context.body);
          if (otp) {
            otpValue = otp;
            break;
          }
        }

        if (!otpValue) {
          await this.delay(resolved.pollMs);
        }
      }

      if (!otpValue) {
        throw new Error('OTP not found within wait window');
      }
      return otpValue;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  private resolveConfig(opts: OtpOptions): ResolvedOtpConfig {
    const user = this.env.GMAIL_USER;
    const password = this.env.GMAIL_APP_PASS;

    if (!user || !password) {
      throw new Error('Missing env: set GMAIL_USER and GMAIL_APP_PASS');
    }

    return {
      user,
      password,
      host: this.env.IMAP_HOST || 'imap.gmail.com',
      port: Number(this.env.IMAP_PORT || 993),
      tls: String(this.env.IMAP_TLS || 'true').toLowerCase() !== 'false',
      rejectUnauthorized: String(this.env.IMAP_TLS_REJECT_UNAUTHORIZED ?? 'true')
        .toLowerCase() !== 'false',
      senderFilter: opts.senderFilter ?? this.env.GMAIL_SENDER_FILTER,
      subjectFilter: opts.subjectFilter ?? this.env.GMAIL_SUBJECT_FILTER,
      lookbackCount: Number(this.env.OTP_LOOKBACK_COUNT ?? opts.lookbackCount ?? 10),
      maxAgeMinutes: Number(this.env.OTP_MAX_AGE_MINUTES ?? opts.maxAgeMinutes ?? 30),
      waitMs: Number(this.env.OTP_WAIT_MS ?? opts.waitMs ?? 30000),
      pollMs: Number(this.env.OTP_POLL_INTERVAL_MS ?? opts.pollMs ?? 5000),
    };
  }

  private createImapOptions(config: ResolvedOtpConfig): ImapSimpleOptions {
    return {
      imap: {
        user: config.user,
        password: config.password,
        host: config.host,
        port: config.port,
        tls: config.tls,
        tlsOptions: {
          rejectUnauthorized: config.rejectUnauthorized,
          servername: config.host,
        },
        connTimeout: 10000,
        authTimeout: 15000,
      },
    };
  }

  private async searchMessages(
    connection: ImapSimple,
    config: ResolvedOtpConfig,
    fetchOptions: any
  ): Promise<ImapMessage[]> {
    const baseCriteria: any[] = ['UNSEEN'];
    if (config.senderFilter) baseCriteria.push(['FROM', config.senderFilter]);
    if (config.subjectFilter) baseCriteria.push(['SUBJECT', config.subjectFilter]);

    const recentMessages = await connection.search(baseCriteria, fetchOptions);
    const sortedRecent = this.sortMessagesNewToOld(recentMessages);

    if (sortedRecent.length) return sortedRecent.slice(0, config.lookbackCount);

    const fallbackUnseen = await connection.search(['UNSEEN'], fetchOptions);
    const sortedFallbackUnseen = this.sortMessagesNewToOld(fallbackUnseen);
    if (sortedFallbackUnseen.length) return sortedFallbackUnseen.slice(0, config.lookbackCount);

    const allMessages = await connection.search(['ALL'], fetchOptions);
    const sortedAll = this.sortMessagesNewToOld(allMessages);
    return sortedAll.slice(0, config.lookbackCount);
  }

  private sortMessagesNewToOld(arr: ImapMessage[]): ImapMessage[] {
    return [...arr].sort((a, b) => {
      const au = a.attributes?.uid ?? 0;
      const bu = b.attributes?.uid ?? 0;
      if (au && bu && au !== bu) return bu - au;
      const ad = new Date(a.attributes?.date || 0).getTime();
      const bd = new Date(b.attributes?.date || 0).getTime();
      return bd - ad;
    });
  }

  private parseMessageContext(message: ImapMessage): ParsedMessageContext {
    const headerPart = message.parts?.find((x) => x.which === 'HEADER');
    const headers = (headerPart as any)?.body || {};

    const getFirst = (value: any): string | undefined => {
      if (!value) return undefined;
      return Array.isArray(value) ? value[0] : value;
    };

    const fromHeader = getFirst(headers.from);
    const subjectHeader = getFirst(headers.subject);
    const body: string = (message.parts?.find((x) => x.which === 'TEXT') as any)?.body || '';
    const ageMinutes = this.computeAgeMinutes(message.attributes?.date);

    return {
      from: fromHeader,
      subject: subjectHeader,
      body,
      ageMinutes,
    };
  }

  private matchesFilters(context: ParsedMessageContext, filters: MailSearchFilters): boolean {
    const senderOk = filters.senderFilter
      ? this.includesCaseInsensitive(context.from, filters.senderFilter)
      : true;
    const subjectOk = filters.subjectFilter
      ? this.includesCaseInsensitive(context.subject, filters.subjectFilter)
      : true;
    return senderOk && subjectOk;
  }

  private extractOtp(body: string): string | null {
    const otpDivMatch = body.match(/<div[^>]*class=["']otp-code["'][^>]*>([\s\S]*?)<\/div>/i);
    if (otpDivMatch) {
      const otpText = otpDivMatch[1].replace(/[^0-9]/g, '');
      if (otpText.length >= 4 && otpText.length <= 8) {
        return otpText.slice(0, 8);
      }
    }

    const explicitMatch = body.match(/Your OTP is[:\s]*([0-9]{4,8})/i);
    if (explicitMatch?.[1]) return explicitMatch[1].slice(0, 8);

    const looseMatch = body.match(/OTP[^0-9]{0,10}([0-9]{4,8})/i);
    if (looseMatch?.[1]) return looseMatch[1].slice(0, 8);

    return null;
  }

  private computeAgeMinutes(dateInput?: string | number | Date): number {
    if (!dateInput) return Number.POSITIVE_INFINITY;
    const timestamp = new Date(dateInput).getTime();
    return (Date.now() - timestamp) / 60000;
  }

  private includesCaseInsensitive(source: string | undefined, needle: string): boolean {
    if (!source) return false;
    return source.toLowerCase().includes(needle.toLowerCase());
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const getEmailOTP = async (opts: OtpOptions = {}): Promise<string> => {
  const reader = new ImapOtpReader();
  return reader.getEmailOTP(opts);
};
