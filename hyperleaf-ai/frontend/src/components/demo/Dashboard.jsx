import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { AlertCircle, Check, Download, TrendingUp, MapPin, Loader2, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { generatePDF } from '@/lib/pdfGenerator';
import api from '../../services/api';

const COLORS = ['#b09e5a', '#4ade80', '#60a5fa', '#f472b6'];

const Dashboard = ({ results }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('report');
    const [isDownloading, setIsDownloading] = useState(false);

    // Market Linkage State
    const [marketStrategy, setMarketStrategy] = useState(null);
    const [loadingMarket, setLoadingMarket] = useState(false);
    const [marketError, setMarketError] = useState(null);

    // Support both old and new response structures gracefully
    const spectralData = results.spectral_data ? results.spectral_data.map((val, idx) => ({
        wavelength: idx,
        value: val
    })) : [];

    const cultivarNames = ["Heerup", "Kvium", "Rembrandt", "Sheriff"];
    const cultivarProbs = results.cultivar_probs || [0, 0, 0, 0];
    const cultivarData = cultivarNames.map((name, idx) => ({
        name,
        prob: cultivarProbs[idx]
    }));

    const tabs = [
        { id: 'report', label: t('report_tab') },
        { id: 'market', label: 'Market opportunities' },
        { id: 'classification', label: t('class_tab') },
        { id: 'regression', label: t('traits_tab') },
        { id: 'spectral', label: t('spectral_tab') },
    ];

    // Calculated values
    const totalProduction = results.total_production_quintals;
    const ureaRequired = results.urea_required_kg;
    const fertilizerCost = results.fertilizer_cost_inr;

    const handleDownload = async () => {
        setIsDownloading(true);
        // Pass array of IDs for multi-page PDF
        await generatePDF(['pdf-page-1', 'pdf-page-2', 'pdf-page-3'], `WheatSpectral_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        setIsDownloading(false);
    };

    const fetchMarketStrategy = async () => {
        setLoadingMarket(true);
        setMarketError(null);

        if (!navigator.geolocation) {
            setMarketError("Geolocation is not supported by your browser.");
            setLoadingMarket(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;

                    // Create Form Data to send lat/lon
                    const formData = new FormData();
                    formData.append('lat', latitude);
                    formData.append('lon', longitude);

                    const res = await api.post(`/api/market/strategy?prediction_id=${results.id}`, formData);
                    setMarketStrategy(res.data);
                } catch (err) {
                    console.error("Market API Error:", err);
                    setMarketError("Failed to fetch market data. Please try again.");
                } finally {
                    setLoadingMarket(false);
                }
            },
            async (error) => {
                console.warn("Location permission denied or unavailable, using defaults.", error);

                // Fallback call without location (Backend uses default)
                try {
                    const res = await api.post(`/api/market/strategy?prediction_id=${results.id}`);
                    setMarketStrategy(res.data);
                } catch (err) {
                    console.error("Market API Error:", err);
                    setMarketError("Failed to fetch market data.");
                } finally {
                    setLoadingMarket(false);
                }
            }
        );
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 text-white font-sans">

            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-sm flex items-center justify-between backdrop-blur-sm">
                    <div>
                        <p className="text-sm text-gray-400">{t('cultivar')}</p>
                        <h3 className="text-3xl font-black text-green-400 mt-1">{results.cultivar_pred || results.cultivar_prediction}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                        <Check className="w-6 h-6 text-green-500" />
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-sm flex items-center justify-between backdrop-blur-sm">
                    <div>
                        <p className="text-sm text-gray-400">{t('confidence')}</p>
                        <h3 className="text-3xl font-black text-white mt-1">{(results.confidence * 100).toFixed(1)}%</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <AlertCircle className="w-6 h-6 text-blue-500" />
                    </div>
                </div>
            </div>

            {/* Tabs & Download */}
            <div className="flex flex-wrap items-center justify-between border-b border-white/10 gap-4">
                <div className="flex overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "px-6 py-3 text-sm font-medium transition-colors relative whitespace-nowrap",
                                activeTab === tab.id ? "text-green-400" : "text-gray-400 hover:text-white"
                            )}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400" />
                            )}
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold transition-all disabled:opacity-50 mb-2 md:mb-0"
                >
                    <Download className="w-4 h-4" />
                    {isDownloading ? t('generating_pdf') : t('download_report')}
                </button>
            </div>

            {/* Content */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 min-h-[400px] backdrop-blur-sm">

                {activeTab === 'report' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <h4 className="font-bold mb-6 text-xl text-white">{t('farming_report_title')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 rounded-lg bg-black/40 border border-white/5 text-center">
                                <p className="text-gray-400 text-sm uppercase tracking-wider">{t('est_production')}</p>
                                <p className="text-4xl font-bold mt-2 text-white">{totalProduction?.toFixed(2) || "N/A"}</p>
                                <p className="text-sm text-gray-500 mt-1">{t('unit_quintals')}</p>
                            </div>
                            <div className="p-6 rounded-lg bg-black/40 border border-white/5 text-center">
                                <p className="text-gray-400 text-sm uppercase tracking-wider">{t('urea_needed')}</p>
                                <p className="text-4xl font-bold mt-2 text-white">{ureaRequired?.toFixed(0) || "0"}</p>
                                <p className="text-sm text-gray-500 mt-1">{t('unit_kg')}</p>
                            </div>
                            <div className="p-6 rounded-lg bg-green-900/10 border border-green-500/20 text-center">
                                <p className="text-green-400 text-sm uppercase tracking-wider">{t('est_cost')}</p>
                                <p className="text-4xl font-bold mt-2 text-green-500">₹{fertilizerCost?.toFixed(0) || "0"}</p>
                                <p className="text-sm text-green-500/60 mt-1">{t('unit_inr')}</p>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <h5 className="font-bold text-blue-400 mb-2">{t('recommendation_title')}</h5>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {t('rec_text_1')} ({results.fertilizer_score}) {t('rec_text_2')} ({results.field_area_acres} acres),
                                {t('rec_text_3')} <span className="text-white font-bold">{ureaRequired?.toFixed(0)} {t('unit_kg')}</span> {t('rec_text_4')} <span className="text-white font-bold">{totalProduction?.toFixed(2)} {t('unit_quintals')}</span>.
                            </p>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'market' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h4 className="font-bold text-xl text-white">Market Opportunities</h4>
                                <p className="text-sm text-gray-400">Find the best mandi to sell your produce based on live Agmarknet prices.</p>
                            </div>
                            {!marketStrategy && (
                                <button
                                    onClick={fetchMarketStrategy}
                                    disabled={loadingMarket}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loadingMarket ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                                    Find Best Mandi via GPS
                                </button>
                            )}
                        </div>

                        {marketError && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-center gap-3 mb-6">
                                <AlertCircle className="w-5 h-5" />
                                <p>{marketError}</p>
                            </div>
                        )}

                        {marketStrategy && (
                            <div className="space-y-6">
                                {/* Profit Highlight */}
                                <div className="p-6 bg-gradient-to-r from-emerald-900/30 to-green-900/10 border border-emerald-500/30 rounded-2xl relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <TrendingUp className="w-6 h-6 text-emerald-400" />
                                            <h5 className="font-bold text-lg text-emerald-300">Recommended Strategy</h5>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                                            <div>
                                                <p className="text-gray-400 text-sm">Best Mandi</p>
                                                <p className="text-2xl font-bold text-white mt-1">{marketStrategy.recommended_market}</p>
                                                <p className="text-emerald-400 mt-1 text-sm bg-emerald-900/40 inline-block px-2 py-0.5 rounded">
                                                    ₹{marketStrategy.recommended_price}/q
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Est. Net Profit</p>
                                                <p className="text-3xl font-black text-white mt-1">₹{marketStrategy.net_profit?.toLocaleString()}</p>
                                                <p className="text-gray-500 text-xs mt-1">After transport & input costs</p>
                                            </div>
                                        </div>
                                        <p className="mt-6 text-gray-300 text-sm italic bg-black/20 p-3 rounded-lg border border-white/5">
                                            "{marketStrategy.recommendation_text}"
                                        </p>
                                    </div>
                                    <div className="absolute right-0 top-0 h-full w-1/3 bg-emerald-500/5 blur-3xl" />
                                </div>

                                {/* Comparison Table */}
                                <div>
                                    <h5 className="font-bold text-white mb-4">Nearby Alternative Markets</h5>
                                    <div className="overflow-x-auto rounded-xl border border-white/10">
                                        <table className="w-full text-left text-sm text-gray-400">
                                            <thead className="bg-white/5 text-gray-200 uppercase text-xs font-bold">
                                                <tr>
                                                    <th className="px-4 py-3">Mandi / District</th>
                                                    <th className="px-4 py-3">Distance</th>
                                                    <th className="px-4 py-3 text-right">Price (/q)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {marketStrategy.alternative_markets?.slice(0, 5).map((m, i) => (
                                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium text-white">{m.market}</div>
                                                            <div className="text-xs">{m.district}, {m.state}</div>
                                                        </td>
                                                        <td className="px-4 py-3">{m.distance_km} km</td>
                                                        <td className="px-4 py-3 text-right font-bold text-green-400">₹{m.modal_price}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!marketStrategy && !loadingMarket && (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500 border-2 border-dashed border-white/10 rounded-xl">
                                <IndianRupee className="w-12 h-12 mb-3 opacity-20" />
                                <p>Click the button above to find the best selling price near you.</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'classification' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    >
                        <div className="h-[300px]">
                            <h4 className="font-bold mb-4 text-white">{t('prob_dist_title')}</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cultivarData} layout="vertical" margin={{ left: 40 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="prob" radius={[0, 4, 4, 0]}>
                                        {cultivarData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'regression' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <h4 className="font-bold mb-6 text-white">{t('phys_ind_title')}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: t('grain_weight'), value: results.grain_weight, unit: "mg" },
                                { label: t('gsw'), value: results.gsw, unit: "g" },
                                { label: t('phips2'), value: results.phips2, unit: "ratio" },
                                { label: t('fertilizer_score'), value: results.fertilizer_score, unit: "index" },
                            ].map((item, i) => (
                                <div key={i} className="p-4 rounded-lg bg-black/40 border border-white/5 text-center hover:bg-white/5 transition-colors">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider h-8 flex items-center justify-center">{item.label}</p>
                                    <p className="text-2xl font-black mt-2 text-white">{typeof item.value === 'number' ? item.value.toFixed(4) : item.value}</p>
                                    <p className="text-xs text-gray-500 mt-1">{item.unit}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'spectral' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={spectralData}>
                                <defs>
                                    <linearGradient id="colorSpectralPDF" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="wavelength" stroke="#6b7280" fontSize={12} tickLine={false} />
                                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#4ade80" fillOpacity={1} fill="url(#colorSpectralPDF)" isAnimationActive={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}
            </div>

            {/* Hidden PDF Template - PAGE 1 */}
            <div id="pdf-page-1" className="fixed left-[-1000vw] top-0 w-[210mm] min-h-[297mm] bg-[#030712] text-white p-12 space-y-8 font-sans">
                {/* PDF Header */}
                <div className="flex justify-between items-center border-b border-white/20 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-green-400">WheatSpectral AI</h1>
                        <p className="text-gray-400 text-sm mt-1">Hyperspectral Analysis Report (Page 1/2)</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-bold">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* PDF Section 1: Summary */}
                <div className="grid grid-cols-2 gap-8">
                    <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-sm text-gray-400 uppercase tracking-wider">{t('cultivar')}</p>
                        <p className="text-3xl font-black text-white mt-2">{results.cultivar_pred || results.cultivar_prediction}</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-sm text-gray-400 uppercase tracking-wider">{t('confidence')}</p>
                        <p className="text-3xl font-black text-white mt-2">{(results.confidence * 100).toFixed(1)}%</p>
                    </div>
                </div>

                {/* PDF Section 2: Farming Report */}
                <div>
                    <h3 className="text-xl font-bold text-green-400 mb-4">{t('farming_report_title')}</h3>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="p-4 bg-black/40 rounded-lg border border-white/10 text-center">
                            <p className="text-xs text-gray-400 uppercase">{t('est_production')}</p>
                            <p className="text-2xl font-bold py-2">{totalProduction?.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">{t('unit_quintals')}</p>
                        </div>
                        <div className="p-4 bg-black/40 rounded-lg border border-white/10 text-center">
                            <p className="text-xs text-gray-400 uppercase">{t('urea_needed')}</p>
                            <p className="text-2xl font-bold py-2">{ureaRequired?.toFixed(0)}</p>
                            <p className="text-xs text-gray-500">{t('unit_kg')}</p>
                        </div>
                        <div className="p-4 bg-green-900/10 rounded-lg border border-green-500/20 text-center">
                            <p className="text-xs text-green-400 uppercase">{t('est_cost')}</p>
                            <p className="text-2xl font-bold py-2 text-green-500">₹{fertilizerCost?.toFixed(0)}</p>
                            <p className="text-xs text-green-500/60">{t('unit_inr')}</p>
                        </div>
                    </div>
                    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-sm text-gray-300">
                            {t('rec_text_1')} ({results.fertilizer_score}) {t('rec_text_2')} ({results.field_area_acres} acres).
                        </p>
                    </div>
                </div>

                {/* PDF Section 3: Traits */}
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">{t('phys_ind_title')}</h3>
                    <div className="grid grid-cols-4 gap-4">
                        {[
                            { label: t('grain_weight'), value: results.grain_weight, unit: "mg" },
                            { label: t('gsw'), value: results.gsw, unit: "g" },
                            { label: t('phips2'), value: results.phips2, unit: "ratio" },
                            { label: t('fertilizer_score'), value: results.fertilizer_score, unit: "index" },
                        ].map((item, i) => (
                            <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                                <p className="text-[10px] text-gray-400 uppercase h-8 flex items-center justify-center">{item.label}</p>
                                <p className="text-xl font-bold mt-1 text-white">{typeof item.value === 'number' ? item.value.toFixed(4) : item.value}</p>
                                <p className="text-[10px] text-gray-500 mt-1">{item.unit}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hidden PDF Template - PAGE 2 */}
            <div id="pdf-page-2" className="fixed left-[-1000vw] top-0 w-[210mm] min-h-[297mm] bg-[#030712] text-white p-12 space-y-8 font-sans">
                {/* PDF Header Page 2 */}
                <div className="flex justify-between items-center border-b border-white/20 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-green-400">WheatSpectral AI</h1>
                        <p className="text-gray-400 text-sm mt-1">Hyperspectral Analysis Report (Page 2/2)</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-bold">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* PDF Section 4: Market Strategy (If Available) */}
                {(results.recommended_market || marketStrategy) ? (
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-white mb-4">Market Strategy & Profitability</h3>
                        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                            <div className="grid grid-cols-2 gap-8 mb-4">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase">Recommended Mandi</p>
                                    <p className="text-2xl font-bold text-white mt-1">
                                        {results.recommended_market || marketStrategy?.recommended_market}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase">Est. Net Profit</p>
                                    <p className="text-2xl font-bold text-green-400 mt-1">
                                        ₹{(results.net_profit || marketStrategy?.net_profit)?.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
                                <div>
                                    <p className="text-[10px] text-gray-400">Market Price</p>
                                    <p className="font-semibold">₹{results.market_price || marketStrategy?.recommended_price}/q</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400">Transport Cost</p>
                                    <p className="font-semibold">₹{(results.transport_cost || marketStrategy?.transport_cost)?.toFixed(0)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400">Distance</p>
                                    <p className="font-semibold">{results.mandi_distance || "N/A"} km</p>
                                </div>
                            </div>
                        </div>

                        {/* PDF: Alternative Markets Table */}
                        {(marketStrategy?.alternative_markets) && (
                            <div className="mt-8">
                                <h5 className="font-bold text-white mb-4">Nearby Alternative Markets</h5>
                                <div className="rounded-xl border border-white/10 overflow-hidden">
                                    <table className="w-full text-left text-sm text-gray-400">
                                        <thead className="bg-white/5 text-gray-200 uppercase text-xs font-bold">
                                            <tr>
                                                <th className="px-4 py-3">Mandi / District</th>
                                                <th className="px-4 py-3">Distance</th>
                                                <th className="px-4 py-3 text-right">Price (/q)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {marketStrategy.alternative_markets.slice(0, 8).map((m, i) => (
                                                <tr key={i} className="border-b border-white/5 last:border-0">
                                                    <td className="px-4 py-3 text-white">
                                                        <span className="font-bold">{m.market}</span>
                                                        <span className="block text-[10px] text-gray-500">{m.district}, {m.state}</span>
                                                    </td>
                                                    <td className="px-4 py-3">{m.distance_km} km</td>
                                                    <td className="px-4 py-3 text-right font-bold text-green-400">₹{m.modal_price}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-center text-gray-500">
                        <p>Market analysis data not available for this report.</p>
                    </div>
                )}
            </div>

            {/* Hidden PDF Template - PAGE 3 */}
            <div id="pdf-page-3" className="fixed left-[-1000vw] top-0 w-[210mm] min-h-[297mm] bg-[#030712] text-white p-12 space-y-8 font-sans">
                {/* PDF Header Page 3 */}
                <div className="flex justify-between items-center border-b border-white/20 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-green-400">WheatSpectral AI</h1>
                        <p className="text-gray-400 text-sm mt-1">Hyperspectral Analysis Report (Page 3/3)</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-bold">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* PDF Section 5: Graph */}
                <div className="h-[500px]">
                    <h3 className="text-xl font-bold text-white mb-4">{t('spectral_tab')}</h3>
                    <p className="text-gray-400 text-sm mb-6">
                        This graph shows the spectral reflectance signature of the crop.
                        Distinct features in the NIR region correlate with chlorophyll content and nitrogen levels.
                    </p>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={spectralData}>
                            <defs>
                                <linearGradient id="colorSpectralPDF3" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="wavelength" stroke="#6b7280" fontSize={10} tickLine={false} label={{ value: 'Wavelength (nm)', position: 'insideBottom', offset: -5, fill: '#6b7280' }} />
                            <YAxis stroke="#6b7280" fontSize={10} tickLine={false} label={{ value: 'Reflectance', angle: -90, position: 'insideLeft', fill: '#6b7280' }} />
                            <Area type="monotone" dataKey="value" stroke="#4ade80" fillOpacity={1} fill="url(#colorSpectralPDF3)" isAnimationActive={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
