import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Wheat, Layers, FlaskConical, Github, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const links = [
        { name: 'Home', path: '/', icon: Wheat, label: 'home' },
        { name: 'Demo', path: '/demo', icon: Layers, label: 'predict' },
        { name: 'Research', path: '/research', icon: FlaskConical, label: 'research' },
        // { name: 'Contact', path: '/contact', icon: Github, label: 'Contact' },
    ];

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'hi' : 'en';
        i18n.changeLanguage(newLang);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <Wheat className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-yellow-600">
                        HyperLeaf AI
                    </span>
                </Link>

                <div className="hidden md:flex items-center space-x-8">
                    {links.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={cn(
                                "relative text-sm font-medium transition-colors hover:text-primary",
                                location.pathname === link.path ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            {link.label === 'Research' ? 'Research' : t(link.label)}
                            {location.pathname === link.path && (
                                <motion.div
                                    layoutId="navbar-indicator"
                                    className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-primary"
                                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                />
                            )}
                        </Link>
                    ))}
                    {user && (
                        <Link
                            to="/dashboard"
                            className={cn(
                                "relative text-sm font-medium transition-colors hover:text-primary",
                                location.pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            {t('dashboard')}
                        </Link>
                    )}
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={toggleLanguage}
                        className="px-3 py-1 text-xs font-bold border border-gray-600 rounded hover:bg-gray-800 transition"
                    >
                        {i18n.language === 'en' ? 'हिन्दी' : 'English'}
                    </button>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-green-400">
                                {user.username}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition"
                                title={t('logout')}
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                            {t('login')}
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
