import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { AlertCircle, Check, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { generatePDF } from '@/lib/pdfGenerator';

const COLORS = ['#b09e5a', '#4ade80', '#60a5fa', '#f472b6'];

const Dashboard = ({ results }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('report');
    const [isDownloading, setIsDownloading] = useState(false);

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
        await generatePDF('pdf-report-content', `HyperLeaf_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        setIsDownloading(false);
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
                <div className="flex overflow-x-auto">
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
                                    <linearGradient id="colorSpectral" x1="0" y1="0" x2="0" y2="1">
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
                                <Area type="monotone" dataKey="value" stroke="#4ade80" fillOpacity={1} fill="url(#colorSpectral)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}
            </div>

            {/* Hidden PDF Template */}
            <div id="pdf-report-content" className="fixed left-[-1000vw] top-0 w-[210mm] min-h-[297mm] bg-[#030712] text-white p-12 space-y-8 font-sans">
                {/* PDF Header */}
                <div className="flex justify-between items-center border-b border-white/20 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-green-400">HyperLeaf AI</h1>
                        <p className="text-gray-400 text-sm mt-1">Hyperspectral Analysis Report</p>
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

                {/* PDF Section 4: Graph */}
                <div className="h-[300px]">
                    <h3 className="text-xl font-bold text-white mb-4">{t('spectral_tab')}</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={spectralData}>
                            <defs>
                                <linearGradient id="colorSpectralPDF" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="wavelength" stroke="#6b7280" fontSize={10} tickLine={false} />
                            <YAxis stroke="#6b7280" fontSize={10} tickLine={false} />
                            <Area type="monotone" dataKey="value" stroke="#4ade80" fillOpacity={1} fill="url(#colorSpectralPDF)" isAnimationActive={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
