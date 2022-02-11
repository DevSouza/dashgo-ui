import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { setCookie, parseCookies, destroyCookie } from 'nookies';
import Router from 'next/router';
import { api } from "../services/apiClient";

type User = {
  email: string;
  username: string;
  roles: string[];
  permissions: string[];
}

type SignInCredentials = {
  username: string;
  password: string;
}

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  isAuthenticated: boolean;
  user: User | undefined;
}

type AuthProviderProps = {
  children: ReactNode;
}

const AuthContext = createContext({} as AuthContextData);

export function signOut() {
  destroyCookie(undefined, 'cadastro-usuario.tokenType');
  destroyCookie(undefined, 'cadastro-usuario.accessToken');
  destroyCookie(undefined, 'cadastro-usuario.refreshToken');

  Router.push('/');
}

export function AuthProvider({ children } : AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  useEffect(() => {
    const { 
      'cadastro-usuario.tokenType': tokenType,
      'cadastro-usuario.accessToken': accessToken,
      'cadastro-usuario.refreshToken': refreshToken
    } = parseCookies();

    if(accessToken) {
      api.get('auth/me').then(response => {
        const { username, email, roles, permissions } = response.data;

        setUser({ username, email, roles, permissions });
      })
      .catch(() => {
        signOut();
      });
    }
  }, []);

  async function signIn({username, password}: SignInCredentials){
    try {
      const response = await api.post('/auth/signin', {
        username,
        password
      });

      const {
        email, 
        tokenType,
        accessToken,
        refreshToken,
        roles,
        permissions
      } = response.data;
      
      setCookie(undefined, 'cadastro-usuario.tokenType', tokenType, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
      setCookie(undefined, 'cadastro-usuario.accessToken', accessToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
      setCookie(undefined, 'cadastro-usuario.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      setUser({
        email,
        username,
        roles,
        permissions
      });

      api.defaults.headers.common['Authorization'] = `${tokenType} ${accessToken}`;
      
      Router.push('/dashboard');
    } catch (err) {
      console.log(err);
    }
  }
  
  return (
    <AuthContext.Provider value={{signIn, isAuthenticated, user}}>
      { children }
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}