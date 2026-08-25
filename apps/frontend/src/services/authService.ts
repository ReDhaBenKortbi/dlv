import { api, setAccessToken } from "@/lib/api";

interface TokenResponse {
  accessToken: string;
}

export const registerUser = async (fullName: string, email: string, password: string) => {
  const { accessToken } = await api<TokenResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ fullName, email, password }),
  });
  setAccessToken(accessToken);
};

export const loginUser = async (email: string, password: string) => {
  const { accessToken } = await api<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setAccessToken(accessToken);
};

export const requestPasswordReset = async (email: string) => {
  await api("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const resetPassword = async (token: string, newPassword: string) => {
  await api("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
};
