import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FileUpload from '@/components/demo/FileUpload';
import Dashboard from '@/components/demo/Dashboard';
import { AlertCircle, Sprout, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const Demo = () => {
    const [results, setResults] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const [fieldArea, setFieldArea] = useState('');
    const [fertilizerRate, setFertilizerRate] = useState('');

    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    const handleFileSelect = async (file) => {
        if (!fieldArea || !fertilizerRate) {
            setError(t('error_missing_fields'));
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setResults(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('field_area', fieldArea);
        formData.append('fertilizer_rate', fertilizerRate);

        try {
            const res = await api.post('/api/predict', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResults(res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to analyze image. Please ensure the backend is running.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (loading) return <div className="text-center text-white mt-20">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#030712] text-white py-20 font-sans relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-green-500/5 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" style={{ opacity: 0.3 }}></div>

            <div className="container px-4 mx-auto max-w-4xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                        {t('demo_title')}
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        {t('demo_subtitle')}
                    </p>
                </motion.div>

                {/* Input Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-2xl mx-auto mb-10"
                >
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                            <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{t('input_details')}</h3>
                                <p className="text-sm text-gray-400">{t('enter_field_data')}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">{t('field_area')}</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={fieldArea}
                                        onChange={(e) => setFieldArea(e.target.value)}
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition-all placeholder:text-gray-600"
                                        placeholder="e.g. 10"
                                    />
                                    <Sprout className="absolute right-3 top-3.5 w-5 h-5 text-gray-600" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">{t('fertilizer_rate')}</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={fertilizerRate}
                                        onChange={(e) => setFertilizerRate(e.target.value)}
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition-all placeholder:text-gray-600"
                                        placeholder="e.g. 25"
                                    />
                                    <span className="absolute right-3 top-3.5 text-gray-600 font-bold text-sm">₹/kg</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* File Upload Area */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <FileUpload onFileSelect={handleFileSelect} isAnalyzing={isAnalyzing} />
                </motion.div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="max-w-2xl mx-auto mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </motion.div>
                )}

                {results && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px bg-white/10 flex-grow" />
                            <h2 className="text-2xl font-bold text-center text-white">{t('prediction_results')}</h2>
                            <div className="h-px bg-white/10 flex-grow" />
                        </div>
                        <Dashboard results={results} />
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Demo;
