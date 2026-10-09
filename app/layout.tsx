import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Halloween sobre ruedas | Nico Sappia',icons:{icon:[{url:'/nm-halloween-icon.png',type:'image/png',sizes:'64x64'}],apple:'/nm-halloween-organizador.webp'},description:'Descubrí tu nivel de patinaje y elegí tu próximo paso con Nico Sappia.'};
export default function Layout({children}:Readonly<{children:React.ReactNode}>){return <html lang="es"><body>{children}</body></html>}
