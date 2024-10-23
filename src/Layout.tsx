import { useEffect, useRef, useState, ReactNode } from 'react';
import Scrollbar from 'smooth-scrollbar';
import OverscrollPlugin from 'smooth-scrollbar/plugins/overscroll';
import { IoClose, IoDownloadOutline, IoCalendar, IoChatbox, IoEnter, IoExit, IoHome, IoMenu, IoMoon, IoNotifications, IoPerson, IoSettingsOutline, IoSunny, IoTrophy, IoStatsChart, IoSettings } from "react-icons/io5";
import { Link } from 'react-router-dom';
import { DownloadImageFtp } from './hooks/hookFTP';
import { Update, Notification, Breadcrumbs, Modal } from './components';
import config from '../package.json';

Scrollbar.use(OverscrollPlugin);

interface LayoutProps {
    children: ReactNode;
}

const getStoredTheme = () => {
    return localStorage.getItem('theme') || 'OrbyLight';
};

const setStoredTheme = (theme: string) => {
    localStorage.setItem('theme', theme);
};

export function Layout({ children }: LayoutProps) {
    const scrollbarRef = useRef(null);
    const [theme, setTheme] = useState(getStoredTheme());

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

    useEffect(() => {
        // Aplica o tema no root element
        document.documentElement.setAttribute('data-theme', theme);
        setStoredTheme(theme);
    }, [theme]);

    const handleThemeToggle = () => {
        // Troca entre CustomLight e CustomDark
        setTheme((prevTheme) => (prevTheme === 'OrbyLight' ? 'OrbyDark' : 'OrbyLight'));
    };

    
    return (
        <div className='w-full h-full' ref={scrollbarRef}>
            <div>
                <div className='fixed right-0 z-10 flex gap-5 p-5'>

                    <Link className='btn btn-circle' to={"/inicio"}><IoEnter /></Link>

                    <div className="tooltip tooltip-bottom" data-tip="Buscar atualização"> 
                        <Update>
                            <button className="btn btn-circle">
                                <IoDownloadOutline />
                            </button>
                        </Update>
                    </div>

                    <div className="tooltip tooltip-bottom" data-tip="Trocar tema">    
                        <label className="swap btn btn-circle" >
                            <input type="checkbox" className="theme-controller" onChange={handleThemeToggle}/>
                            <IoSunny className='swap-off fill-current' />
                            <IoMoon className='swap-on fill-current' />
                        </label>
                    </div>
                    
                    <div className="tooltip tooltip-bottom" data-tip="Fechar">
                        <button
                            className='btn btn-circle'
                            onClick={() => window.ipcRenderer.invoke('app-close')}>
                            <IoClose />
                        </button>    
                    </div>

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
    const [theme, setTheme] = useState(getStoredTheme);

    useEffect(() => {
        // Pega o nome e a foto do profissional do localStorage
        const foto = localStorage.getItem('profissional_foto');
        const nomeProfissional = localStorage.getItem('profissional_nome'); // Buscar o nome do profissional
        const departamentoProfissional = localStorage.getItem('profissional_departamento'); // Buscar o nome do profissional
        
        if (foto) {
            // Busca a URL da imagem a partir do nome do arquivo
            DownloadImageFtp('profissionais/fotos',foto)
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

    useEffect(() => {
        // Aplica o tema no root element
        document.documentElement.setAttribute('data-theme', theme);
        setStoredTheme(theme);
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
                            <label htmlFor="my-drawer" className="btn btn-ghost drawer-button text-xl">
                                <IoMenu />
                            </label>
                        </div>
                        <div className="drawer-side">
                            <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay z-10"></label>
                            <ul className="menu bg-base-100 text-base-content min-h-full w-80 p-4 z-10 flex flex-col justify-between">
                                <div>
                                    <li>
                                        <Link to={"/inicio"} className='text-xl mt-5'>
                                            <img src="particle.svg" alt="" className='h-8 mr-5' />
                                            <h2 className='text-xl font-semibold tracking-[10px]'>NEXUS</h2>
                                        </Link>
                                    </li>
                                    <div className="divider"></div>
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
                                        <Link to={"/social"} className='w-full p-2 rounded-lg flex gap-5 items-center hover:bg-base-200'>
                                            <div className="avatar">
                                                <div className="w-10 rounded-full z-0">
                                                    {userImage ? (
                                                        <img alt="Foto do profissional" src={userImage} />
                                                    ) : (
                                                        <img alt="Avatar padrão" src="default.png" />
                                                    )}
                                                </div>
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
                                        </Link>
                                        <div className="dropdown dropdown-top">
                                            <div tabIndex={4} role="button" className="btn m-1"><IoSettingsOutline /></div>
                                            <ul tabIndex={4} className="dropdown-content menu bg-base-100 rounded-box z-[1] shadow flex-row p-2 gap-2">
                                                
                                                <Update>
                                                    <button className="btn tooltip tooltip-left" data-tip="Buscar atualização">
                                                        <IoDownloadOutline />
                                                    </button>
                                                </Update>
                                                
                                                <li className='tooltip tooltip-left' data-tip="Trocar tema">
                                                    <label className="swap swap-rotate btn">
                                                        <input type="checkbox" className="theme-controller" onChange={handleThemeToggle} />
                                                        <IoSunny className='swap-on fill-current' />
                                                        <IoMoon className='swap-off fill-current' />
                                                    </label>
                                                </li>
                                                
                                                <li className='tooltip tooltip-left' data-tip="Sair">
                                                    <Link to={"/"} className='btn text-error'>
                                                        <IoExit />
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </ul>

                        </div>
                    </div>

                    <Link to={"/inicio"} className='btn btn-ghost text-center'>
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
                        <h6>© 2024 Therapies Love Kids</h6>
                        <h6>Desenvolvido por Pedro Laurenti</h6>
                        <h6>v. {config.version}</h6>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface LayoutDashTableProps {
    children: ReactNode;
    notification?: { type: 'info' | 'success' | 'error'; message: string } | null;
    onCloseNotification?: () => void | null; // Esta linha deve ser assim
    modal?: { type: 'info' | 'success' | 'error'; message: string; onClose: () => void } | null;
    cardtitle?: string
}

export function LayoutDashTable({
    children,
    notification,
    onCloseNotification,
    modal,
    cardtitle,
}: LayoutDashTableProps) {
    return (
        <div className='bg-base-200 min-h-screen'>
            <Breadcrumbs />

            <div className="mt-10 px-24 rounded">
                <div className='card bg-base-100 shadow-xl w-full mb-10'>
                    <div className="card-body">

                        <div className=' flex flex-row items-center gap-2'>
                            <p className="card-title m-0 p-0">
                                {cardtitle}
                            </p>
                        </div>

                        {children}
                    </div>
                </div>
            </div>

            {notification && (
                <Notification 
                    type={notification.type} 
                    message={notification.message} 
                    onClose={onCloseNotification || (() => {})} // Fallback para uma função vazia se `onCloseNotification` for null
                />
            )}

            {/* Renderiza o modal se for fornecido */}
            {modal && (
                <Modal 
                    type={modal.type} 
                    message={modal.message} 
                    onClose={modal.onClose}
                >
                    <p>{modal.message}</p>
                </Modal>
            )}
        </div>
    );
}

export function LayoutDashFixed({ children }: LayoutProps) {
    const [userImage, setUserImage] = useState<string | null>(null);
    const [nome, setNome] = useState<string | null>(null);
    const [theme, setTheme] = useState(getStoredTheme);

    useEffect(() => {
        // Pega o nome e a foto do profissional do localStorage
        const foto = localStorage.getItem('profissional_foto');
        const nomeProfissional = localStorage.getItem('profissional_nome'); // Buscar o nome do profissional
        const departamentoProfissional = localStorage.getItem('profissional_departamento'); // Buscar o nome do profissional
        
        if (foto) {
            // Busca a URL da imagem a partir do nome do arquivo
            DownloadImageFtp('profissionais/fotos',foto)
                .then((imageUrl) => setUserImage(imageUrl))
                .catch((err) => console.log('Erro ao buscar a imagem:', err));
        }
        
        if (nomeProfissional) {
            setNome(nomeProfissional); // Atualiza o estado do nome
        }
        if (departamentoProfissional) {
            setNome(departamentoProfissional); // Atualiza o estado do nome
        }
        
    }, []);

    useEffect(() => {
        // Aplica o tema no root element
        document.documentElement.setAttribute('data-theme', theme);
        setStoredTheme(theme);
    }, [theme]);

    const handleThemeToggle = () => {
        // Troca entre CustomLight e CustomDark
        setTheme((prevTheme) => (prevTheme === 'OrbyLight' ? 'OrbyDark' : 'OrbyLight'));
    };

    return (
        <div className='flex flex-row w-screen h-screen'>
            <div className="p-3 border-r border-r-base-300 bg-base-100 flex flex-col items-center justify-between">
                <div className='flex flex-col'>
                                        
                    <div className="tooltip tooltip-right" data-tip="Dashboard">
                        <Link to={"/social"} className='btn btn-ghost'>
                            <IoStatsChart />
                        </Link>
                    </div>

                    <div className="tooltip tooltip-right" data-tip="Perfil">
                        <Link to={"/social/perfil"} className='btn btn-ghost'>
                            <IoPerson />
                        </Link>
                    </div>

                    <div className="tooltip tooltip-right" data-tip="Tarefas">
                        <Link to={"/social/tarefas"} className='btn btn-ghost'>
                            <IoCalendar />
                        </Link>
                    </div>

                    <div className="tooltip tooltip-right" data-tip="Mensagens">
                        <Link to={""} className='btn btn-ghost'>
                            <IoChatbox />
                        </Link>
                    </div>

                    <div className="tooltip tooltip-right" data-tip="Notificações">
                        <Link to={""} className='btn btn-ghost'>
                            <IoNotifications />
                        </Link>
                    </div>

                    <div className="tooltip tooltip-right" data-tip="Conquistas">
                        <Link to={""} className='btn btn-ghost'>
                            <IoTrophy />
                        </Link>
                    </div>

                </div>
                <div className='flex flex-col'>
                    <div className='dropdown dropdown-top'>

                        <div className='tooltip tooltip-right' data-tip="Configurações">
                            <div tabIndex={4} role="button" className="btn btn-ghost">
                                <IoSettings />
                            </div>
                        </div>

                        <ul tabIndex={4} className="dropdown-content menu bg-base-100 rounded-box flex-row p-0 my-2 gap-2">
                            
                        <Update>
                            <button className="btn tooltip tooltip-right" data-tip="Buscar atualização">
                                <IoDownloadOutline />
                            </button>
                        </Update>
                        
                        <li className='tooltip tooltip-right' data-tip="Trocar tema">
                            <label className="swap swap-rotate btn">
                                <input type="checkbox" className="theme-controller" onChange={handleThemeToggle} />
                                <IoSunny className='swap-on fill-current' />
                                <IoMoon className='swap-off fill-current' />
                            </label>
                        </li>
                        
                        <li className='tooltip tooltip-right' data-tip="Sair">
                            <Link to={"/"} className='btn text-error'>
                                <IoExit />
                            </Link>
                        </li>
                        </ul>
                    </div>
                    <div className='tooltip tooltip-right' data-tip="Página Inicial">
                        <Link to={"/inicio"} className='btn btn-ghost'>
                            <IoHome />
                        </Link>
                    </div>
                </div>
            </div>
            <div className='w-full h-full bg-base-200 flex flex-col justify-between'>
                <div className=''>
                    {children}
                </div>
                <div className='text-neutral/50 flex justify-between px-8 w-full'>
                    <h6>© 2024 Therapies Love Kids</h6>
                    <h6>Desenvolvido por Pedro Laurenti</h6>
                    <h6>v. {config.version}</h6>
                </div>
            </div>
        </div>
    );
}

