import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies } from "nookies";

/* case user authenticated redirect to dashboard */
export function withSRRGuest<P>(fn: GetServerSideProps<P>) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);

    if(cookies['cadastro-usuario.accessToken']) {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false,
        }
      }
    }
    
    return fn(ctx);
  }
}