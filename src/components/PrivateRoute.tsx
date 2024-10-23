import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
    children: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const profissionalId = localStorage.getItem('profissional_id');

    if (!profissionalId) {
        return <Navigate to="/" />;
    }

    return children;
};

export default PrivateRoute;
