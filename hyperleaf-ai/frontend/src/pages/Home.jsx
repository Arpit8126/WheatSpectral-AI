
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { ArrowRight, ChevronDown, CheckCircle2, Sprout, FileText, BarChart3, Droplets, Sun } from 'lucide-react';
import Wheat3D from '@/components/Wheat3D';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-white/10 rounded-xl bg-white/5 overflow-hidden mb-4 transition-all hover:bg-white/10 hover:border-green-500/30">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
            >
                <span className="font-semibold text-lg text-white">{question}</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-green-400' : 'text-gray-400'}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 pt-0 text-gray-300 leading-relaxed border-t border-white/5 mt-2">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Home = () => {
    const { t } = useTranslation();

    return (
        <div className="bg-background text-foreground overflow-hidden font-sans">
            {/* --- HERO SECTION --- */}
            {/* FORCE DARK THEME FOR HERO to ensure "text-white" buttons and glowing effects work */}
            <section className="relative min-h-[95vh] flex flex-col justify-center pt-20 pb-16 bg-[#030712] text-white">

                {/* Background Pattern - Grid */}
                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" style={{ opacity: 0.3 }}></div>

                {/* Background Elements - Stronger Blobs */}
                <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-green-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

                <div className="container px-4 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-left"
                    >
                        <div className="inline-flex items-center space-x-2 bg-green-900/30 text-green-400 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-green-500/30 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span>{t('next_gen_agronomy')}</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8 leading-[1.1] text-white">
                            {t('hero_title_1')} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                                {t('hero_title_2')}
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 leading-relaxed max-w-xl mb-10">
                            {t('hero_desc')}
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link to="/signup">
                                <button className="h-14 px-8 rounded-lg bg-white text-black font-bold text-lg hover:bg-gray-200 transition-all flex items-center shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                                    {t('create_account')} <ArrowRight className="ml-2 w-5 h-5" />
                                </button>
                            </Link>
                            <Link to="/demo">
                                <button className="h-14 px-8 rounded-lg bg-transparent border border-white/20 text-white font-medium text-lg hover:bg-white/10 transition-all backdrop-blur-sm">
                                    {t('analyze_crop')}
                                </button>
                            </Link>
                        </div>
                        <div className="mt-12 flex items-center gap-8 text-sm text-gray-500 font-medium">
                            <span className="flex items-center text-gray-400"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> {t('validated')}</span>
                            <span className="flex items-center text-gray-400"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> {t('accuracy')}</span>
                        </div>
                    </motion.div>

                    <div className="h-[500px] w-full relative perspective-1000">
                        {/* Decorative Circle behind 3D model to fill space */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-tr from-green-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" />

                        {/* 3D Model Placeholder */}
                        <Wheat3D />
                        <div className="absolute -bottom-10 -right-10 bg-gray-900/90 backdrop-blur border border-gray-700 p-6 rounded-xl shadow-2xl max-w-xs transform rotate-3 hidden md:block">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="p-3 bg-green-500/20 rounded-lg text-green-400"><BarChart3 size={24} /></div>
                                <div>
                                    <h4 className="font-bold text-white">{t('live_insights')}</h4>
                                    <p className="text-xs text-gray-400">{t('processing_bands')}</p>
                                </div>
                            </div>
                            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div className="w-[88%] h-full bg-green-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- EDUCATIONAL: THE PROBLEM --- */}
            <section className="py-24 bg-white text-gray-900 relative">
                <div className="container px-4 mx-auto">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">{t('problem_title')}</h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            {t('problem_desc')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                        <div className="space-y-4 p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-4">
                                <Sprout size={24} />
                            </div>
                            <h3 className="text-2xl font-bold">{t('hidden_hunger')}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {t('hidden_hunger_desc')}
                            </p>
                        </div>
                        <div className="space-y-4 p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                                <FileText size={24} />
                            </div>
                            <h3 className="text-2xl font-bold">{t('cultivar_confusion')}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {t('cultivar_confusion_desc')}
                            </p>
                        </div>
                        <div className="space-y-4 p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                                <Droplets size={24} />
                            </div>
                            <h3 className="text-2xl font-bold">{t('fertilizer_waste')}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {t('fertilizer_waste_desc')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- EDUCATIONAL: THE SOLUTION (GLOSSARY) --- */}
            <section className="py-24 bg-gray-900 border-t border-gray-800">
                <div className="container px-4 mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <div>
                            <span className="text-green-400 font-bold tracking-wider uppercase text-sm mb-2 block">{t('our_tech')}</span>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{t('decoding_spectrum')}</h2>
                            <p className="text-gray-400 text-lg leading-relaxed mb-8">
                                <Trans i18nKey="decoding_desc" components={{ strong: <strong className="text-white" /> }} />
                            </p>

                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-white font-bold">1</div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white mb-2">{t('tech_1_title')}</h4>
                                        <p className="text-gray-400 leading-relaxed">{t('tech_1_desc')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-white font-bold">2</div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white mb-2">{t('tech_2_title')}</h4>
                                        <p className="text-gray-400 leading-relaxed">{t('tech_2_desc')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-white font-bold">3</div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white mb-2">{t('tech_3_title')}</h4>
                                        <p className="text-gray-400 leading-relaxed">{t('tech_3_desc')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative h-full min-h-[500px] rounded-2xl overflow-hidden border border-gray-800 bg-black/50">
                            {/* Decorative gradients mimicking spectral bands */}
                            <div className="absolute inset-0 flex flex-col opacity-50">
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <div key={i} className="flex-1 w-full" style={{
                                        backgroundColor: `hsl(${i * 15}, 70 %, 50 %)`,
                                        opacity: (i % 2 === 0) ? 0.8 : 0.4
                                    }} />
                                ))}
                            </div>
                            <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-8 text-center">
                                <div>
                                    <Sun className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                                    <h3 className="text-2xl font-bold text-white mb-4">{t('solar_digital')}</h3>
                                    <p className="text-gray-400">
                                        <Trans i18nKey="solar_desc" components={{ br: <br /> }} />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- WORKFLOW --- */}
            <section className="py-24 bg-white text-gray-900">
                <div className="container px-4 mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-16">{t('how_it_works')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gray-200 -z-10" />

                        {[
                            { num: "01", title: t('step_1_title'), desc: t('step_1_desc') },
                            { num: "02", title: t('step_2_title'), desc: t('step_2_desc') },
                            { num: "03", title: t('step_3_title'), desc: t('step_3_desc') },
                            { num: "04", title: t('step_4_title'), desc: t('step_4_desc') }
                        ].map((step, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl">
                                <div className="w-24 h-24 mx-auto bg-primary text-white text-3xl font-bold flex items-center justify-center rounded-full shadow-lg mb-6 border-4 border-white">
                                    {step.num}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FAQ SECTION --- */}
            <section className="py-24 bg-gray-900 border-t border-gray-800">
                <div className="container px-4 mx-auto max-w-4xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('faq_title')}</h2>
                        <p className="text-gray-400">{t('faq_subtitle')}</p>
                    </div>

                    <div className="space-y-4">
                        <FAQItem question={t('faq_1_q')} answer={t('faq_1_a')} />
                        <FAQItem question={t('faq_2_q')} answer={t('faq_2_a')} />
                        <FAQItem question={t('faq_3_q')} answer={t('faq_3_a')} />
                        <FAQItem question={t('faq_4_q')} answer={t('faq_4_a')} />
                        <FAQItem question={t('faq_5_q')} answer={t('faq_5_a')} />
                    </div>
                </div>
            </section>

            {/* --- CTA --- */}
            <section className="py-24 bg-gradient-to-b from-gray-900 to-green-950 text-white text-center border-t border-gray-800">
                <div className="container px-4 mx-auto">
                    <h2 className="text-4xl font-bold mb-6">{t('ready_optimize')}</h2>
                    <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto text-gray-300">
                        {t('join_farmers')}
                    </p>
                    <Link to="/signup">
                        <button className="px-10 py-4 bg-green-500 text-black font-bold text-xl rounded-full shadow-xl hover:bg-green-400 transition-transform hover:scale-105 border border-green-400/50">
                            {t('create_account')}
                        </button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;

