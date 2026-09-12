import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';

const Signup = () => {
    const [step, setStep] = useState('form'); // 'form' or 'otp'
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // 8 separate boxes for OTP
    const [otp, setOtp] = useState(Array(8).fill(''));
    const inputRefs = useRef([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [infoMessage, setInfoMessage] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    const { register, verifyOtp, resendOtp } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    // Handle individual box change & auto-focus next
    const handleOtpChange = (index, value) => {
        // Only accept numbers
        const char = value.replace(/[^0-9]/g, '').slice(-1);
        const newOtp = [...otp];
        newOtp[index] = char;
        setOtp(newOtp);

        // Auto-focus next box if digit entered
        if (char && index < 7) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle Backspace navigation
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle pasting 8-digit code
    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
        if (!pasteData) return;

        const newOtp = [...otp];
        for (let i = 0; i < 8; i++) {
            if (i < pasteData.length) {
                newOtp[i] = pasteData[i];
            }
        }
        setOtp(newOtp);
        const nextIndex = Math.min(pasteData.length, 7);
        inputRefs.current[nextIndex]?.focus();
    };

    // Handle Step 1: Registration
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setInfoMessage('');
        setLoading(true);

        try {
            const data = await register(username, email, password, 'farmer');
            
            // If user registered and requires verification
            if (data?.user && !data?.session) {
                setStep('otp');
                setInfoMessage(`We sent an 8-digit verification code to ${email}. Please check your inbox.`);
                setResendCooldown(30);
            } else if (data?.session) {
                // Auto confirmed
                navigate('/dashboard');
            } else {
                setStep('otp');
                setInfoMessage(`Verification code sent to ${email}`);
            }
        } catch (err) {
            console.error("Signup error:", err);
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle Step 2: 8-digit OTP Verification (Confirm Signup)
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');

        const token = otp.join('');
        if (token.length < 8) {
            setError('Please enter all 8 digits of the verification code.');
            return;
        }

        setLoading(true);
        try {
            await verifyOtp(email, token);
            navigate('/dashboard');
        } catch (err) {
            console.error("OTP verification error:", err);
            setError(err.message || 'Invalid or expired OTP code. Please check and try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle Resend OTP
    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        setError('');
        setInfoMessage('');
        try {
            await resendOtp(email);
            setInfoMessage('A new 8-digit verification code has been sent to your email.');
            setResendCooldown(45);
        } catch (err) {
            setError(err.message || 'Failed to resend OTP. Please wait a moment.');
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
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight">
                            {step === 'form' ? t('signup') : 'Verify Your Email'}
                        </h2>
                        <p className="text-muted-foreground mt-2">
                            {step === 'form' 
                                ? t('signup_subtitle') 
                                : `Enter the 8-digit verification code sent to ${email}`}
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {infoMessage && (
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm font-medium">
                            {infoMessage}
                        </div>
                    )}

                    {/* Step 1: Registration Form */}
                    {step === 'form' ? (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">{t('username')}</label>
                                <input
                                    type="text"
                                    className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    placeholder={t('choose_username')}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
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
                                <label className="text-sm font-medium leading-none">{t('password')}</label>
                                <input
                                    type="password"
                                    className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    placeholder={t('create_password')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 w-full mt-4 disabled:opacity-50"
                            >
                                {loading ? 'Creating Account...' : t('signup')}
                            </button>
                        </form>
                    ) : (
                        /* Step 2: 8 Separate OTP Input Boxes */
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-medium leading-none block text-center">
                                    Enter 8-Digit Code
                                </label>
                                
                                {/* 8 Individual Input Boxes */}
                                <div className="flex justify-center gap-1.5 sm:gap-2" onPaste={handlePaste}>
                                    {otp.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            ref={(el) => (inputRefs.current[idx] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(idx, e)}
                                            className="w-10 h-12 sm:w-11 sm:h-14 text-center text-xl font-bold font-mono rounded-lg border-2 border-input bg-background shadow-sm transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
                                            autoFocus={idx === 0}
                                        />
                                    ))}
                                </div>

                                <p className="text-xs text-muted-foreground text-center pt-1">
                                    Check your email inbox or spam folder for the 8-digit code.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.join('').length < 8}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-green-600 text-white shadow hover:bg-green-700 h-12 w-full disabled:opacity-50 font-semibold"
                            >
                                {loading ? 'Verifying OTP...' : 'Confirm & Complete Signup'}
                            </button>

                            <div className="flex items-center justify-between pt-2 text-sm">
                                <button
                                    type="button"
                                    onClick={() => { setStep('form'); setOtp(Array(8).fill('')); setError(''); }}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                    ← Edit Details
                                </button>
                                <button
                                    type="button"
                                    disabled={resendCooldown > 0}
                                    onClick={handleResendOtp}
                                    className="text-primary hover:underline disabled:text-muted-foreground disabled:no-underline font-medium"
                                >
                                    {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Code'}
                                </button>
                            </div>
                        </form>
                    )}

                    <p className="text-center text-sm text-muted-foreground">
                        {t('has_account')} <Link to="/login" className="text-primary hover:underline font-medium">{t('login')}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
