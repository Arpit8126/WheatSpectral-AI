import React from 'react';
import { motion } from 'framer-motion';
import { FileText, GitBranch, Database, Layers, Activity, Cpu } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';

const Research = () => {
    const { t } = useTranslation();

    return (
        <div className="bg-background text-foreground min-h-screen py-20 font-sans">
            <div className="container px-4 mx-auto max-w-5xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                        {t('research_title')}
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        {t('research_subtitle')}
                    </p>
                </motion.div>

                {/* Architecture Section - REPLACED PLACEHOLDER */}
                <section className="mb-20">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-primary/10 rounded-lg text-primary">
                            <GitBranch className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-bold">{t('arch_overview')}</h2>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold">{t('arch_details_title')}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {t('arch_details_desc')}
                                </p>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
                                        <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                                            <Layers className="w-4 h-4" /> {t('comp_1_title')}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">{t('comp_1_desc')}</p>
                                    </div>
                                    <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
                                        <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                                            <Cpu className="w-4 h-4" /> {t('comp_2_title')}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">{t('comp_2_desc')}</p>
                                    </div>
                                    <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
                                        <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                                            <Activity className="w-4 h-4" /> {t('comp_3_title')}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">{t('comp_3_desc')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Abstract Visual Representation instead of Placeholder */}
                            <div className="relative aspect-square lg:aspect-auto h-full min-h-[400px] bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden shadow-2xl flex items-center justify-center p-8">
                                <div className="absolute inset-0 bg-[url('https://grain-autonomy.com/assets/grid.svg')] opacity-20"></div>
                                {/* Center Nodes */}
                                <div className="relative z-10 grid grid-cols-1 gap-8 w-full max-w-xs">
                                    <div className="bg-gray-800/80 backdrop-blur border border-green-500/30 p-4 rounded-lg text-center transform hover:scale-105 transition-transform duration-500">
                                        <span className="text-xs text-green-400 font-mono mb-1 block">INPUT</span>
                                        <span className="text-white font-bold">Hyperspectral Cube</span>
                                    </div>
                                    <div className="h-12 w-0.5 bg-green-500/30 mx-auto"></div>
                                    <div className="bg-gray-800/90 backdrop-blur border border-blue-500/30 p-6 rounded-lg text-center shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-400">
                                            <Cpu className="w-6 h-6 animate-pulse" />
                                        </div>
                                        <span className="text-white font-bold block">Axial Attention</span>
                                        <span className="text-xs text-blue-300">Row & Col Mixing</span>
                                    </div>
                                    <div className="h-12 w-0.5 bg-green-500/30 mx-auto"></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-800/80 backdrop-blur border border-purple-500/30 p-3 rounded-lg text-center">
                                            <span className="text-xs text-purple-400 font-bold block">CLASS</span>
                                            <span className="text-white text-xs">Cultivar</span>
                                        </div>
                                        <div className="bg-gray-800/80 backdrop-blur border border-yellow-500/30 p-3 rounded-lg text-center">
                                            <span className="text-xs text-yellow-400 font-bold block">REG</span>
                                            <span className="text-white text-xs">Traits</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Performance Section */}
                <section className="mb-20">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-primary/10 rounded-lg text-primary">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-bold">{t('perf_metrics')}</h2>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr className="text-left">
                                    <th className="py-4 px-6 font-bold text-muted-foreground">{t('metric_name')}</th>
                                    <th className="py-4 px-6 font-bold text-primary">{t('metric_value')}</th>
                                    <th className="py-4 px-6 font-bold text-muted-foreground">{t('metric_baseline')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-card">
                                {[
                                    { name: t('acc_p'), val: "88%", base: "94.5%" },
                                    { name: t('r2_gw'), val: "0.78", base: "0.55" },
                                    { name: t('inf_time'), val: "54ms", base: "120ms" },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                                        <td className="py-4 px-6 font-medium">{row.name}</td>
                                        <td className="py-4 px-6 text-green-600 font-bold text-lg">{row.val}</td>
                                        <td className="py-4 px-6 text-muted-foreground font-mono text-sm">{row.base}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Dataset & Methodology */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-primary/10 rounded-lg text-primary">
                            <Database className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-bold">{t('dataset_title')}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                            <h3 className="text-xl font-bold mb-4">{t('dataset_title')}</h3>
                            <p className="text-muted-foreground leading-relaxed mb-6">
                                {t('dataset_desc')}
                            </p>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 rounded-full bg-muted text-xs font-bold text-muted-foreground">4100 Images</span>
                                <span className="px-3 py-1 rounded-full bg-muted text-xs font-bold text-muted-foreground">204 Bands</span>
                                <span className="px-3 py-1 rounded-full bg-muted text-xs font-bold text-muted-foreground">4 Cultivars</span>
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                            <h3 className="text-xl font-bold mb-4">{t('methodology_title')}</h3>
                            <ul className="space-y-4">
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">1</span>
                                    <span className="text-muted-foreground text-sm">{t('methodology_step_1')}</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</span>
                                    <span className="text-muted-foreground text-sm">{t('methodology_step_2')}</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">3</span>
                                    <span className="text-muted-foreground text-sm">{t('methodology_step_3')}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Research;
