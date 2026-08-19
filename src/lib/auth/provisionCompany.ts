import { waterproApiFetch } from "@/lib/backend/waterproApi";

type RegisterStatus = {
  registered: boolean;
};

type RegisterResponse = {
  companyId: string;
  alreadyRegistered: boolean;
};

export async function provisionCompanyIfNeeded(token: string, companyName: string) {
  const status = await waterproApiFetch<RegisterStatus>("/api/v1/auth/register/status", {
    method: "GET",
    token,
  });

  if (status.registered) return { provisioned: false as const };

  await waterproApiFetch<RegisterResponse>("/api/v1/auth/register", {
    method: "POST",
    token,
    body: { companyName },
  });

  return { provisioned: true as const };
}
