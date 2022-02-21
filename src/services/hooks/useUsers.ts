import { useQuery, UseQueryOptions, UseQueryResult } from "react-query";
import { setupAPIClient } from "../api";

type User = {
  userId: number;
  username: string;
  email: string;
  createdAt: string;
}

type GetUsersResponse = {
  size: number;
  totalElements: number;
  users: User[];
}

export async function getUsers(p: number) : Promise<GetUsersResponse> {
  const api = setupAPIClient();

  const page = p - 1;
  const { data, headers } = await api.get('users', { 
    params:{ 
      page,
      size: 5
    }
  });

  const totalElements = data.totalElements;
  const size = data.size;

  const users = data.content.map(user => ({
    userId: user.userId,
    username: user.username,
    email: user.email,
    createdAt: new Date(user.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }),
  }));

  return { 
    users, 
    totalElements,
    size
  };
}

export function useUsers(page: number, options: UseQueryOptions) {
  return useQuery(['users', page], () => getUsers(page), {
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  }) as UseQueryResult<GetUsersResponse, unknown>;
}