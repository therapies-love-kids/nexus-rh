import { useEffect, useRef, useState, ReactNode } from 'react';
import Scrollbar from 'smooth-scrollbar';
import OverscrollPlugin from 'smooth-scrollbar/plugins/overscroll';
import { IoBrush, IoEnter, IoExit, IoMenu, IoMoon, IoSettings, IoSettingsOutline, IoSunny } from "react-icons/io5";
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

    const [theme, setTheme] = useState('OrbyLight');

    useEffect(() => {
        // Aplica o tema no root element
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const handleThemeToggle = () => {
        // Troca entre CustomLight e CustomDark
        setTheme((prevTheme) => (prevTheme === 'OrbyLight' ? 'OrbyDark' : 'OrbyLight'));
    };

    
    return (
        <div className='w-full h-full' ref={scrollbarRef}>
            <div>
                <div className='fixed right-0 z-10 flex gap-5 p-5'>

                    <Link to="/">
                        <button className='btn btn-circle btn-ghost'>
                            <IoEnter />
                        </button>
                    </Link>

                    <label className="swap swap-rotate btn btn-circle btn-ghost">
                        <input type="checkbox" className="theme-controller" onChange={handleThemeToggle} />
                        <IoSunny className='swap-on fill-current' />
                        <IoMoon className='swap-off fill-current' />
                    </label>
                </div>
                {children}
            </div>
        </div>
    );
}

export function LayoutDash({ children }: LayoutProps) {
    const scrollbarRef = useRef(null);
    const [scrollY, setScrollY] = useState(0);
    const [userImage, setUserImage] = useState<string | null>(null);
    const [nome, setNome] = useState<string | null>(null); // Novo estado para o nome
    const [departamento, setDepartamento] = useState<string | null>(null); // Novo estado para o nome

    useEffect(() => {
        // Pega o nome e a foto do profissional do localStorage
        const foto = localStorage.getItem('profissional_foto');
        const nomeProfissional = localStorage.getItem('profissional_nome'); // Buscar o nome do profissional
        const departamentoProfissional = localStorage.getItem('profissional_departamento'); // Buscar o nome do profissional
        
        if (foto) {
            // Busca a URL da imagem a partir do nome do arquivo
            fetchImageFromFtp(foto)
                .then((imageUrl) => setUserImage(imageUrl))
                .catch((err) => console.error('Erro ao buscar a imagem:', err));
        }
        
        if (nomeProfissional) {
            setNome(nomeProfissional); // Atualiza o estado do nome
        }
        if (departamentoProfissional) {
            setNome(departamentoProfissional); // Atualiza o estado do nome
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

    const [theme, setTheme] = useState('OrbyLight');

    useEffect(() => {
        // Aplica o tema no root element
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const handleThemeToggle = () => {
        // Troca entre CustomLight e CustomDark
        setTheme((prevTheme) => (prevTheme === 'OrbyLight' ? 'OrbyDark' : 'OrbyLight'));
    };

    return (
        <div>
            <div className={`navbar ${scrollY === 0 ? 'bg-transparent' : 'bg-base-100'} z-20 fixed flex items-center justify-between`}>
                <div className="flex-row">
                    
                    <div className="drawer">
                        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
                        <div className="drawer-content">
                            <label htmlFor="my-drawer" className="btn btn-ghost drawer-button text-xl ">
                                <IoMenu />
                            </label>
                        </div>
                        <div className="drawer-side">
                            <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay z-10"></label>
                            <ul className="menu bg-base-100 text-base-content min-h-full w-80 p-4 z-10 flex flex-col justify-between">
                                <div>
                                    <li>
                                        <Link to={"/"} className='text-xl my-5'>
                                            <img src="/particle.svg" alt="" className='h-11 mr-5' />
                                            <h2 className='text-xl font-semibold tracking-[10px]'>NEXUS</h2>
                                        </Link>
                                    </li>
                                    <li><Link to={""}>Agenda</Link></li>
                                    <li><Link to={"/funcoes"}>Funções</Link></li>
                                    <li><Link to={"/departamentos"}>Departamentos</Link></li>
                                    <li><Link to={"/empresas"}>Empresas</Link></li>
                                    <li><Link to={"/unidades"}>Unidades</Link></li>
                                    <li><Link to={"/profissionais"}>Profissionais</Link></li>
                                </div>

                                <div>
                                    <div className="divider"></div>
                                    
                                    <div className='flex gap-5 justify-between items-center'>
                                        <div className='flex gap-5 items-center'>
                                            <div className="w-10 rounded-full z-0">
                                                {userImage ? (
                                                    <img alt="Foto do profissional" src={userImage} />
                                                ) : (
                                                    <img alt="Avatar padrão" src="/default.png" />
                                                )}
                                            </div>
                                            <div>
                                                {nome ? (
                                                    <div className='text-sm font-medium'>{nome}</div>
                                                ) : (
                                                    <div className='text-sm font-medium'>Usuário</div>
                                                )}
                                                {departamento ? (
                                                    <div className='text-xs font-light'>{departamento}</div>
                                                ) : (
                                                    <div className='text-xs font-light'>Departamento</div>
                                                )}
                                            </div>
                                        </div>

                                        <details className="dropdown dropdown-top">
                                            <summary className="btn"><IoSettingsOutline /></summary>
                                            <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow mb-2 gap-2">
                                                <Link to={"/"} className='btn text-error'>
                                                    <IoExit /> Sair
                                                </Link>
                                                <label className="swap swap-rotate btn">
                                                    <input type="checkbox" className="theme-controller" onChange={handleThemeToggle} />
                                                    <IoSunny className='swap-on fill-current' />
                                                    <IoMoon className='swap-off fill-current' />
                                                </label>
                                            </ul>
                                        </details>
                                    </div>
                                </div>
                            </ul>

                        </div>
                    </div>

                    <Link to={"/"} className='btn btn-ghost text-center'>
                        <h2 className='text-xl ml-[10px] tracking-[10px] text-center'>NEXUS</h2>
                    </Link>
                </div>

            </div>
            <div className='w-screen h-screen bg-base-200' ref={scrollbarRef}>
                <div>
                    <div className='min-h-screen'>
                        {children}
                    </div>
                    <div className='text-neutral/50 flex justify-between px-8 w-full'>
                        <h6>© 2024 Therapies Love Kids. Todos os direitos reservados.</h6>
                        <h6>Desenvolvido por Pedro Laurenti</h6>
                    </div>
                </div>
            </div>
        </div>
    );
}
