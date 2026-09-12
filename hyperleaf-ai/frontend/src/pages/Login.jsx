import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            console.error("Login error:", err);
            if (err.message?.toLowerCase().includes("email not confirmed")) {
                setError("Email not confirmed. Please enter the verification OTP sent to your email during signup.");
            } else if (err.message?.toLowerCase().includes("invalid login credentials")) {
                setError(t('invalid_credentials') || "Invalid email or password.");
            } else {
                setError(err.message || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-background">
            {/* Left Side - Brand/Image */}
            <div className="hidden lg:flex w-1/2 bg-gray-900 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 to-black z-10" />
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-green-500/10 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-20 text-white max-w-lg">
                    <h1 className="text-5xl font-extrabold tracking-tight mb-6">WheatSpectral AI</h1>
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
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">{t('email')}</label>
                            <input
                                type="email"
                                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium leading-none">{t('password')}</label>
                            </div>
                            <input
                                type="password"
                                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 w-full disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : t('login')}
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
