import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const LOCAL_ALLOWED_URLS_WILDCARDS = ['http://localhost:*'];

const ALLOWED_HEADERS = [
  'host',
  'user-agent',
  'accept',
  'accept-language',
  'accept-encoding',
  'content-type',
  'authorization',
  'content-length',
  'origin',
  'connection',
  'referer',
  'sec-fetch-dest',
  'sec-fetch-mode',
  'sec-fetch-site',
  'pragma',
  'cache-control',
  'access-control-request-headers',
  'access-control-request-method',
];

const ALLOWED_METHODS = [
  'GET',
  'HEAD',
  'PUT',
  'POST',
  'PATCH',
  'DELETE',
  'OPTIONS',
];

export function getCorsConfig(): CorsOptions {
  return {
    origin: getAllowedOrigins(),
    allowedHeaders: getAllowedHeaders(),
  };
}

export function getAllowedOrigins(): (
  origin: string,
  callback: (err: Error | null, allow?: boolean) => void,
) => void {
  const allowedOriginWildcards = getAllowedOriginWildcards();

  return (origin, callback) => {
    for (const allowedOriginWildcard of allowedOriginWildcards) {
      const regexPattern = new RegExp(
        '^' + allowedOriginWildcard.replace(/\*/g, '.*') + '$',
      );
      if (regexPattern.test(origin)) {
        callback(null, true);
        return;
      }
    }
    callback(null, false);
  };
}

export function getAllowedOriginWildcards(): string[] {
  const envStage = process.env.NODE_ENV;

  switch (envStage) {
    case 'local':
      return LOCAL_ALLOWED_URLS_WILDCARDS;

    case 'development':
      return LOCAL_ALLOWED_URLS_WILDCARDS;

    default:
      return [];
  }
}

export function getAllowedHeaders(): string[] {
  return ALLOWED_HEADERS;
}

export function getAllowedMethods(): string {
  return ALLOWED_METHODS.join(',');
}
