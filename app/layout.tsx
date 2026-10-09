import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Halloween sobre ruedas | Nico Sappia',description:'Descubrí tu nivel de patinaje y elegí tu próximo paso con Nico Sappia.'};
export default function Layout({children}:Readonly<{children:React.ReactNode}>){return <html lang="es"><body>{children}</body></html>}
