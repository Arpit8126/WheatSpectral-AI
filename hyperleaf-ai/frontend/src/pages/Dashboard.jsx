import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import AnalysisResults from '../components/demo/Dashboard';
import { ArrowLeft } from 'lucide-react';

const Dashboard = () => {
    const [history, setHistory] = useState([]);
    const [selectedPrediction, setSelectedPrediction] = useState(null);
    const [farmers, setFarmers] = useState([]);
    const [selectedFarmerId, setSelectedFarmerId] = useState(null);
    const { t } = useTranslation();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    // Initial Fetch
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                // 1. Fetch default history (ALL for admin, own for user)
                const res = await api.get('/api/dashboard');
                setHistory(res.data);

                // 2. If Admin, fetch list of farmers
                if (user?.role === 'admin') {
                    const userRes = await api.get('/api/admin/users');
                    setFarmers(userRes.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data");
            } finally {
                setLoading(false);
            }
        };
        if (user) loadInitialData();
    }, [user]);

    // Admin Filter Fetch
    const handleFarmerSelect = async (farmerId) => {
        setSelectedFarmerId(farmerId);
        setSelectedPrediction(null); // Reset detail view if open
        setLoading(true);
        try {
            // Fetch history specific to that user
            const url = farmerId ? `/api/dashboard?user_id=${farmerId}` : '/api/dashboard';
            const res = await api.get(url);
            setHistory(res.data);
        } catch (error) {
            console.error("Failed to filter history");
        } finally {
            setLoading(false);
        }
    };

    if (loading && history.length === 0) return <div className="text-center text-white mt-20">{t('processing')}</div>;

    if (selectedPrediction) {
        return (
            <div className="min-h-screen bg-[#030712] text-white py-20 font-sans relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-green-500/5 rounded-full blur-[150px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" style={{ opacity: 0.3 }}></div>

                <div className="container px-4 mx-auto max-w-6xl relative z-10">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => setSelectedPrediction(null)}
                        className="mb-8 flex items-center text-green-400 font-bold hover:text-green-300 transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10"
                    >
                        <ArrowLeft className="mr-2 h-5 w-5" /> {t('back_to_dashboard') || "Back to Dashboard"}
                    </motion.button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px bg-white/10 flex-grow" />
                            <h2 className="text-2xl font-bold text-center text-white">{t('prediction_results')}</h2>
                            <div className="h-px bg-white/10 flex-grow" />
                        </div>
                        <AnalysisResults results={selectedPrediction} />
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex">

            {/* Admin Sidebar */}
            {user?.role === 'admin' && (
                <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 flex flex-col shrink-0">
                    <h2 className="text-lg font-bold text-green-400 mb-4 px-2">Farmers List</h2>
                    <div className="space-y-1 overflow-y-auto">
                        <button
                            onClick={() => handleFarmerSelect(null)}
                            className={`w-full text-left px-3 py-2 rounded text-sm ${!selectedFarmerId ? 'bg-green-500/20 text-green-300' : 'text-gray-400 hover:bg-gray-700'}`}
                        >
                            All Farmers
                        </button>
                        {farmers.map(farmer => (
                            <button
                                key={farmer.id}
                                onClick={() => handleFarmerSelect(farmer.id)}
                                className={`w-full text-left px-3 py-2 rounded text-sm truncate ${selectedFarmerId === farmer.id ? 'bg-green-500/20 text-green-300' : 'text-gray-400 hover:bg-gray-700'}`}
                            >
                                <div className="font-medium">{farmer.username}</div>
                                <div className="text-xs opacity-60 truncate">{farmer.email}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto h-screen">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-green-400">{t('dashboard')}</h1>
                            {user?.role === 'admin' && (
                                <p className="text-gray-400 text-sm mt-1">
                                    {selectedFarmerId
                                        ? `Viewing data for: ${farmers.find(f => f.id === selectedFarmerId)?.username}`
                                        : "Viewing all predictions"
                                    }
                                </p>
                            )}
                        </div>
                        <Link to="/demo" className="px-4 py-2 bg-green-500 text-black font-bold rounded hover:bg-green-400">
                            + New Analysis
                        </Link>
                    </div>

                    {history.length === 0 ? (
                        <p className="text-gray-400">No analysis history found.</p>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedPrediction(item)}
                                    className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg hover:border-green-500 transition cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold text-green-300">{item.cultivar_prediction}</h3>
                                        <span className="text-sm text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="space-y-2 text-sm text-gray-300">
                                        <div className="flex justify-between">
                                            <span>{t('confidence')}:</span>
                                            <span className="font-mono text-white">{(item.confidence * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{t('est_production')}:</span>
                                            <span className="font-mono text-white">{item.total_production_quintals.toFixed(2)} Q</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{t('urea_needed')}:</span>
                                            <span className="font-mono text-white">{item.urea_required_kg.toFixed(0)} kg</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{t('est_cost')}:</span>
                                            <span className="font-mono text-white">₹{item.fertilizer_cost_inr.toFixed(0)}</span>
                                        </div>
                                        {/* Added detailed traits as requested */}
                                        <div className="pt-2 border-t border-gray-700 mt-2 space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span>Grain Weight:</span>
                                                <span className="text-gray-400">{item.grain_weight} mg</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span>GSW:</span>
                                                <span className="text-gray-400">{item.gsw}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span>PhiPS2:</span>
                                                <span className="text-gray-400">{item.phips2}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span>Fertilizer Score:</span>
                                                <span className="text-gray-400">{item.fertilizer_score}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Area: {item.field_area_acres} Acres</span>
                                            <span>Rate: ₹{item.fertilizer_rate_inr}/kg</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
