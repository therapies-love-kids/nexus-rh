import { useEffect, useRef, useState, ReactNode } from 'react';
import Scrollbar from 'smooth-scrollbar';
import OverscrollPlugin from 'smooth-scrollbar/plugins/overscroll';
import { IoBrush, IoEnter, IoMenu, IoMoon, IoSunny } from "react-icons/io5";
import { Link } from 'react-router-dom';
import { fetchImageFromFtp } from './utils/imageUtils';

// Register the overscroll plugin
Scrollbar.use(OverscrollPlugin);

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const scrollbarRef = useRef(null);

    useEffect(() => {
        let scrollbarInstance: Scrollbar;
    
        if (scrollbarRef.current) {
            scrollbarInstance = Scrollbar.init(scrollbarRef.current, {
                plugins: {
                    overscroll: {
                        effect: "bounce",
                    },
                },
            });
        }
    
        return () => {
            if (scrollbarInstance) {
                scrollbarInstance.destroy();
            }
        };
    }, []);
    
    return (
        <div className='w-full h-full' ref={scrollbarRef}>
            <div>
                <Link to="/style">
                    <button className='btn btn-circle btn-ghost fixed right-0 z-10'>
                        <IoBrush />
                    </button>
                </Link>
                <Link to="/inicio">
                    <button className='btn btn-circle btn-ghost fixed right-20 z-10'>
                        <IoEnter />
                    </button>
                </Link>
                {children}
            </div>
        </div>
    );
}

export function LayoutDash({ children }: LayoutProps) {
    const scrollbarRef = useRef(null);
    const [scrollY, setScrollY] = useState(0);
    const [userImage, setUserImage] = useState<string | null>(null);

    useEffect(() => {
        // Pega o nome do arquivo da foto do profissional do localStorage
        const foto = localStorage.getItem('profissional_foto');
        
        if (foto) {
            // Busca a URL da imagem a partir do nome do arquivo
            fetchImageFromFtp(foto)
                .then((imageUrl) => setUserImage(imageUrl))
                .catch((err) => console.error('Erro ao buscar a imagem:', err));
        }

        let scrollbarInstance: Scrollbar;
        
        if (scrollbarRef.current) {
            scrollbarInstance = Scrollbar.init(scrollbarRef.current, {
                plugins: {
                    overscroll: {
                        effect: 'bounce',
                    },
                },
            });

            scrollbarInstance.addListener((status) => {
                setScrollY(status.offset.y);
            });
        }

        return () => {
            if (scrollbarInstance) {
                scrollbarInstance.destroy();
            }
        };
    }, []);

    return (
        <div>
            <div className={`navbar ${scrollY === 0 ? 'bg-transparent' : 'bg-base-100'} z-20 fixed`}>
                <div className="flex-1">
                    <div className="drawer">
                        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
                        <div className="drawer-content">
                            <label htmlFor="my-drawer" className="btn btn-ghost drawer-button text-xl">
                                <IoMenu />
                            </label>
                            <Link to={"/"} className='btn btn-ghost text-xl'>
                                <img src="/particle.svg" alt="" className='h-2/3' />
                            </Link>
                        </div>
                        <div className="drawer-side">
                            <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay z-10"></label>
                            <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4 z-10">
                                <li>
                                    <Link to={"/"} className='text-xl my-5'>
                                        <img src="/logo.svg" alt="" className='w-2/3' />
                                    </Link>
                                </li>
                                <li><Link to={""}>Agenda</Link></li>
                                <li><Link to={"/funcoes"}>Funções</Link></li>
                                <li><Link to={"/departamentos"}>Departamentos</Link></li>
                                <li><Link to={"/empresas"}>Empresas</Link></li>
                                <li><Link to={"/unidades"}>Unidades</Link></li>
                                <li><Link to={"/profissionais"}>Profissionais</Link></li>
                                <div className="divider"></div>
                                <li><Link to={"/style"}>Estilo</Link></li>
                                <li><Link to={"/"}>Login</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="flex-none">
                    <div className="dropdown dropdown-end relative">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar z-0">
                            <div className="w-10 rounded-full z-0">
                                {userImage ? (
                                    <img alt="Foto do profissional" src={userImage} />
                                ) : (
                                    <img
                                        alt="Avatar padrão"
                                        src="/default.png"
                                    />
                                )}
                            </div>
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-100 rounded-box mt-3 w-52 p-2 shadow">
                            <li><Link to={"/"}>Sair</Link></li>
                            <li>
                                <label className="swap swap-rotate">
                                    <input type="checkbox" className="theme-controller" value="OrbyDark" />
                                    <IoSunny className='swap-on h-8 w-8 fill-current'/>
                                    <IoMoon className='swap-off h-8 w-8 fill-current'/>
                                </label>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className='w-screen h-screen bg-base-200' ref={scrollbarRef}>
                <div>
                    {children}
                    <div className='text-neutral/50 flex justify-between px-8 w-full'>
                        <h6>© 2024 Therapies Love Kids. Todos os direitos reservados.</h6>
                        <h6>Desenvolvido por Pedro Laurenti</h6>
                    </div>
                </div>
            </div>
        </div>
    );
}
