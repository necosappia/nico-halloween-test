import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  distDir: process.env.NODE_ENV !== 'production' && process.env.HALLOWEEN_ADMIN_LOCAL_CHECK === '1' ? '.next-admin-check' : '.next',
  async headers() { return ['/admin/:path*', '/api/admin/:path*'].map(source => ({ source, headers: [
    {key:'Cache-Control',value:'private, no-store, max-age=0'},
    {key:'X-Robots-Tag',value:'noindex, nofollow, noarchive'},
    {key:'Referrer-Policy',value:'no-referrer'},
    {key:'X-Frame-Options',value:'DENY'},
    {key:'Content-Security-Policy',value:"frame-ancestors 'none'; object-src 'none'; base-uri 'self'"},
  ] })); },
  async rewrites(){return ['/test','/test/pregunta-:number','/mi-nivel','/registrar-datos','/diste-tu-primer-paso','/clase-gratuita-online'].map(source=>({source,destination:'/'}));}
};
export default nextConfig;
