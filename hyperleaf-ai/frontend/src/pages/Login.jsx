import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(username, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="flex min-h-screen bg-background">
            {/* Left Side - Brand/Image */}
            <div className="hidden lg:flex w-1/2 bg-gray-900 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 to-black z-10" />
                {/* Abstract background elements */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-green-500/10 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-20 text-white max-w-lg">
                    <h1 className="text-5xl font-extrabold tracking-tight mb-6">HyperLeaf AI</h1>
                    <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                        {t('empowering_ag')}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-900" />
                            ))}
                        </div>
                        <span>{t('trusted_by')}</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight">{t('login_title')}</h2>
                        <p className="text-muted-foreground mt-2">{t('login_subtitle')}</p>
                    </div>

                    {error && (
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                            {t('invalid_credentials')}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('email')}</label>
                            <input
                                type="email"
                                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="name@example.com"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('password')}</label>
                                <a href="#" className="text-sm font-medium text-primary hover:text-primary/80">{t('forgot_password')}</a>
                            </div>
                            <input
                                type="password"
                                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 w-full"
                        >
                            {t('login')}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">{t('or_continue')}</span>
                        </div>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                        {t('no_account')} <Link to="/signup" className="text-primary hover:underline font-medium">{t('register')}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
