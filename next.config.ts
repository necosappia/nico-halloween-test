import type { NextConfig } from 'next';
const nextConfig: NextConfig = {async rewrites(){return ['/test','/test/pregunta-:number','/mi-nivel','/registrar-datos','/diste-tu-primer-paso','/clase-gratuita-online'].map(source=>({source,destination:'/'}));}};
export default nextConfig;
