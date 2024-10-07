import { Link, useLocation } from 'react-router-dom';

export default function Breadcrumbs() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // O título será o último breadcrumb no caminho
    const currentTitle = pathnames[pathnames.length - 1] || "Início";

    return (
        <div className="breadcrumbs text-sm bg-base-300 flex flex-col items-center py-10">
            <h2 className='text-4xl capitalize mt-10 mb-5'>{currentTitle}</h2>
            <ul>
                <li>
                    <Link to="/inicio">Início</Link>
                </li>
                {pathnames.map((value, index) => {
                    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1;
                    return isLast ? (
                        <li key={routeTo} className="capitalize">{value}</li>
                    ) : (
                        <li key={routeTo} className="capitalize">
                            <Link to={routeTo}>{value}</Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}