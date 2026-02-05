import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(username, email, password, "farmer");
            navigate('/login');
        } catch (err) {
            setError('Registration failed. Username might be taken.');
        }
    };

    return (
        <div className="flex min-h-screen bg-background">
            {/* Left Side - Brand/Image */}
            <div className="hidden lg:flex w-1/2 bg-gray-900 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tl from-green-900/40 to-black z-10" />
                <div className="absolute top-0 right-0 w-full h-full">
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-20 text-white max-w-lg">
                    <h1 className="text-4xl font-bold mb-6">
                        <Trans i18nKey="signup_title" components={{ br: <br /> }} />
                    </h1>
                    <ul className="space-y-4 text-lg text-gray-300">
                        <li className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-3 text-sm">✓</div>
                            {t('benefit_1')}
                        </li>
                        <li className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-3 text-sm">✓</div>
                            {t('benefit_2')}
                        </li>
                        <li className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mr-3 text-sm">✓</div>
                            {t('benefit_3')}
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight">{t('signup')}</h2>
                        <p className="text-muted-foreground mt-2">{t('signup_subtitle')}</p>
                    </div>

                    {error && (
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                            {t('registration_failed')}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('username')}</label>
                            <input
                                type="text"
                                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder={t('choose_username')}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('email')}</label>
                            <input
                                type="email"
                                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('password')}</label>
                            <input
                                type="password"
                                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder={t('create_password')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 w-full mt-4"
                        >
                            {t('signup')}
                        </button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        {t('has_account')} <Link to="/login" className="text-primary hover:underline font-medium">{t('login')}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
