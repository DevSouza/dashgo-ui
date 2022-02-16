import { useQuery, UseQueryOptions, UseQueryResult } from "react-query";
import { setupAPIClient } from "../api";

type User = {
  userId: string;
  username: string;
  email: string;
  createdAt: string;
}

export async function getUser(userId: number) : Promise<User> {
  const api = setupAPIClient();
  const { data } = await api.get(`users/${userId}`);

  return {
    userId: data.userId,
    username: data.username,
    email: data.email,
    createdAt: new Date(data.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  };
}

export function useUser(userId: number) {
  return useQuery(['user', userId], () => getUser(userId), {
    staleTime: 1000 * 60 * 10, // 10 minutes
  }) as UseQueryResult<User, unknown>;
}