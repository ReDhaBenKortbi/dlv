import { api } from "../lib/api";

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

const storeTokens = ({ accessToken, refreshToken }: TokenResponse) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
};

export const registerUser = async (email: string, password: string) => {
  const tokens = await api<TokenResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  storeTokens(tokens);
};

export const loginUser = async (email: string, password: string) => {
  const tokens = await api<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  storeTokens(tokens);
};
