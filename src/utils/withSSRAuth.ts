import decode from "jwt-decode";
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/AuthTokenError";
import { validateUserPermissions } from "./validateUserPermissions";

type WithSSRAuthOptions = {
  permissions?: string[];
  roles?: string[];
}

export function withSRRAuth<P>(fn: GetServerSideProps<P>, options?: WithSSRAuthOptions) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);
    const token = cookies['cadastro-usuario.accessToken'];

    if(!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        }
      }
    }

    if(options) {
      const user = decode<{ permissions: string[], roles: string[]}>(token);
      const { permissions, roles } = options;
  
      const userHasValidPermissions = validateUserPermissions({ 
        user,
        permissions,
        roles
      });

      if(!userHasValidPermissions) {
        return {
          redirect: {
            destination: '/',
            permanent: false,
          }
        }
      }
    }

    try {
      return await fn(ctx);
    } catch (err) {
      if(err instanceof AuthTokenError) {
        destroyCookie(ctx, 'cadastro-usuario.tokenType');
        destroyCookie(ctx, 'cadastro-usuario.accessToken');
        destroyCookie(ctx, 'cadastro-usuario.refreshToken');
  
        return {
          redirect: {
            destination: '/',
            permanent: false,
          }
        }
      }

      return Promise.reject(err);
    }
  }
}