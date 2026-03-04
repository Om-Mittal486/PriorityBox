import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
    const { loginWithToken } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            navigate('/login?error=' + error, { replace: true });
            return;
        }

        if (token) {
            loginWithToken(token).then(() => {
                navigate('/dashboard', { replace: true });
            });
        } else {
            navigate('/login', { replace: true });
        }
    }, [searchParams, loginWithToken, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-dark-500 dark:text-dark-400 text-lg">Signing you in...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
