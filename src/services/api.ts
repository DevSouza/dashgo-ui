import axios, { AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../context/AuthContext';
import { AuthTokenError } from './errors/AuthTokenError';

type FailedRequestQueueProps = {
  onSuccess: (token: string) => void;
  onFailure: (err: AxiosError) => void;
};

let isRefreshing = false;
let failedRequestsQueue: FailedRequestQueueProps[] = [];

export function setupAPIClient(ctx: GetServerSidePropsContext | undefined = undefined) {
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  });
  
  if(!!cookies['cadastro-usuario.accessToken'] && !!cookies['cadastro-usuario.tokenType']) {
    api.defaults.headers.common['Authorization'] = `${cookies['cadastro-usuario.tokenType']} ${cookies['cadastro-usuario.accessToken']}`;
  }
  
  api.interceptors.response.use(response => {
    return response;
  }, (error : AxiosError) => {

    // TODO: alterar retorno quando o refresh token estiver expirado.
    if(error.response?.status === 401) {
      if(error.response?.data?.code === "token.expired") {
        cookies = parseCookies(ctx);
        const { 'cadastro-usuario.refreshToken': oldRefreshToken } = cookies;
        const originalConfig = error.config;
  
        if(!isRefreshing) {
          isRefreshing = true;
  
          api.post('/auth/refreshtoken', {
            refreshToken: oldRefreshToken
          }).then( response => {
            const { accessToken, refreshToken, tokenType } = response.data;
    
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
    
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            
            failedRequestsQueue.forEach(request => request.onSuccess(accessToken));
            failedRequestsQueue = [];
          })
          .catch(err => {
            failedRequestsQueue.forEach(request => request.onFailure(err));
            failedRequestsQueue = [];
  
            if(process.browser) {
              signOut();
            }
          })
          .finally(() => {
            isRefreshing = false;
          });
        }
  
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            onSuccess: (token: string) => {
              if(!originalConfig?.headers) {
                return;
              }
  
              originalConfig.headers['Authorization'] = `Bearer ${token}`;
  
              resolve(api(originalConfig));
            },
            onFailure: (err: AxiosError) => {
              reject(err);
            }
          })
        });
      } else {
        if(process.browser) {
          signOut();
        } else {
          return Promise.reject(new AuthTokenError());
        }
      }
    }
  
    return Promise.reject(error);
  });

  return api;
}