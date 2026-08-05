import { api, setAccessToken } from "../lib/api";

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
