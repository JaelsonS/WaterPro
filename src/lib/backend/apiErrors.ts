export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "MFA_ENROLLMENT_REQUIRED"
  | "MFA_STEP_UP_REQUIRED"
  | "INTERNAL_ERROR";

export class WaterProApiError extends Error {
  readonly status: number;
  readonly code?: ApiErrorCode;

  constructor(message: string, status: number, code?: ApiErrorCode) {
    super(message);
    this.name = "WaterProApiError";
    this.status = status;
    this.code = code;
  }
}

const STATUS_MESSAGES: Record<number, string> = {
  400: "Pedido inválido. Verifique os dados e tente novamente.",
  401: "Seu acesso expirou. Entre novamente.",
  403: "Você não tem permissão para executar esta ação.",
  404: "Não foi possível encontrar este recurso.",
  409: "Esta operação já está em andamento.",
  429: "Você fez muitas tentativas. Aguarde um momento.",
  500: "Ocorreu um erro inesperado. Tente novamente.",
};

const CODE_MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  CONFLICT: "Esta operação já está em andamento.",
  NOT_FOUND: "Não foi possível encontrar este recurso.",
  MFA_ENROLLMENT_REQUIRED: "Configure autenticação de dois fatores para continuar.",
  MFA_STEP_UP_REQUIRED: "Verificação de segurança necessária para executar esta ação.",
};

export function mapApiErrorToUserMessage(error: unknown, fallback = "Ocorreu um erro. Tente novamente."): string {
  if (error instanceof WaterProApiError) {
    if (error.code && CODE_MESSAGES[error.code]) return CODE_MESSAGES[error.code]!;
    if (STATUS_MESSAGES[error.status]) return STATUS_MESSAGES[error.status]!;
    return error.message || fallback;
  }

  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("failed to fetch") || error.message.toLowerCase().includes("network")) {
      return "Não foi possível contactar o servidor. Verifique a ligação e tente novamente.";
    }
    return error.message || fallback;
  }

  return fallback;
}

export function isAuthError(error: unknown): boolean {
  return error instanceof WaterProApiError && (error.status === 401 || error.status === 403);
}
