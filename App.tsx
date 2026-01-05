import React, { useState } from 'react';
import { UserProfile, GeneratedPlan, SwotAnalysis, EmploymentOutlook, SchoolStats } from './types';
import { generateBaoyanPlan } from './services/deepseek';
import { savePlanToKV } from './services/kv';
import { PRODUCTS } from './constants';
import { 
  BookOpen, Award, GraduationCap, Loader2, Sparkles, ChevronRight, FileText, 
  X, Zap, Globe, CheckCircle, ArrowRight, TrendingUp, ShieldAlert, 
  Target, Microscope, Briefcase, Trophy, Building2, Download, Phone, Stethoscope, BarChart3, PieChart
} from 'lucide-react';

export default function App() {
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    contact: '', 
    university: '',
    major: '',
    grade: '大二',
    rank: '',
    englishLevel: '',
    awards: '',
    research: '',
    targetDirection: '',
    confusion: '', 
    isNewEngineering: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<keyof typeof PRODUCTS | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPlan(null);

    try {
      const generatedPlan = await generateBaoyanPlan(formData);
      setPlan(generatedPlan);
      savePlanToKV(formData, generatedPlan);
    } catch (err: any) {
      setError(err.message || "生成规划时发生错误，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('pdf-content');
    if (!element) return;
    
    // @ts-ignore
    if (typeof window.html2pdf === 'undefined') {
        alert("PDF组件资源加载中，请稍后重试");
        return;
    }

    // html2canvas settings optimized for PDF export
    const opt = {
      margin: [10, 10, 10, 10], // top, left, bottom, right
      filename: `好保研规划_${formData.name}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff' // Ensure white background
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        // @ts-ignore
        await window.html2pdf().set(opt).from(element).save();
    } catch (e) {
        console.error("PDF Export Error:", e);
        alert("PDF导出失败，请尝试截图保存");
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative selection:bg-unipath-200">
      
      {/* Product Detail Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setActiveModal(null)}></div>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl relative z-10 overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className={`p-8 text-white bg-gradient-to-br ${PRODUCTS[activeModal].color} relative`}>
                    <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-white/70 hover:text-white transition bg-black/10 hover:bg-black/20 rounded-full p-1">
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                            {activeModal === 'SUNRISE' ? <Zap className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight">{PRODUCTS[activeModal].name}</h3>
                    </div>
                    <p className="text-white/90 font-medium text-lg">{PRODUCTS[activeModal].tagline}</p>
                </div>

                {/* Modal Body */}
                <div className="p-8 space-y-6 overflow-y-auto">
                    <div>
                        <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <span className="w-1 h-4 bg-unipath-500 rounded-full"></span>
                            项目介绍
                        </h4>
                        <p className="text-slate-600 leading-relaxed">
                            {PRODUCTS[activeModal].description}
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <span className="w-1 h-4 bg-unipath-500 rounded-full"></span>
                            核心权益
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                            {(activeModal === 'SUNRISE' ? [
                                'CCF-A/B类会议 & SCI期刊论文指导',
                                '清华/北大/中科院夏令营入营辅导',
                                'ACM/ICPC 金牌导师竞赛护航',
                                '新工科（CS/AI）博士团 1v1 定制'
                            ] : [
                                '全学科 10000+ 导师数据库精准匹配',
                                '个性化文书深度润色 (5轮+)',
                                '模拟面试 (单面/群面) 实战演练',
                                '跨专业保研特别辅导方案'
                            ]).map((item, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-unipath-200 transition-colors">
                                    <CheckCircle className="w-5 h-5 text-unipath-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-slate-700 text-sm font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <header className="glass-nav sticky top-0 z-50 border-b border-white/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setPlan(null)}>
                <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-br from-unipath-600 to-unipath-500 text-white px-3 py-1.5 font-bold text-xl rounded-lg shadow-lg shadow-unipath-200 transform group-hover:scale-105 transition-transform duration-300">
                        Unipath
                    </div>
                    <div className="flex flex-col">
                         <span className="text-slate-900 font-bold leading-tight">好保研</span>
                         <span className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">Smart Planner</span>
                    </div>
                </div>
                <div className="hidden md:block w-px h-8 bg-slate-200 mx-2"></div>
                <span className="hidden md:block text-unipath-600 font-semibold italic">好保研，保好研</span>
            </div>
            
            <nav className="flex items-center gap-1 sm:gap-2">
                <NavButton label="首页" onClick={() => setPlan(null)} />
                <NavButton label="破晓计划" onClick={() => setActiveModal('SUNRISE')} highlight />
                <NavButton label="桃李计划" onClick={() => setActiveModal('HARVEST')} highlight />
            </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
            
            {/* Hero Section */}
            {!plan && !isLoading && (
                <div className="text-center mb-16 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white/50 shadow-sm text-unipath-600 text-sm font-medium mb-6 backdrop-blur-sm">
                        <Sparkles size={16} />
                        <span>专注新工科保研 · 深度规划 · 锁定名校</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-unipath-700 via-purple-600 to-pink-600">好保研，保好研</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
                        基于 <span className="font-semibold text-slate-800">DeepSeek</span> 大模型与十年保研数据沉淀，
                        <br className="hidden md:block" />
                        为你生成一份价值百万的升学规划方案。
                    </p>
                </div>
            )}
            
            {/* Error Message */}
            {error && (
                <div className="max-w-2xl mx-auto mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm animate-fade-in-up">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <ShieldAlert className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                            <p className="text-xs text-red-500 mt-1">请检查网络连接或稍后重试。</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Input Form */}
                <div className={`lg:col-span-4 transition-all duration-500 ${plan ? 'hidden lg:block' : 'lg:col-start-3 lg:col-span-8'}`}>
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 border border-white p-6 md:p-8 relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-unipath-100/50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        <div className="flex items-center gap-3 mb-8 text-slate-800 relative z-10">
                            <div className="p-2 bg-unipath-50 rounded-lg text-unipath-600">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold">个人学术画像</h2>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                            <div className="grid grid-cols-2 gap-5">
                                <FormInput label="姓名" name="name" value={formData.name} onChange={handleInputChange} placeholder="你的名字" />
                                <FormInput label="联系方式 (电话/微信)" name="contact" value={formData.contact} onChange={handleInputChange} placeholder="以便于回传深度分析报告" />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <FormInput label="就读院校" name="university" value={formData.university} onChange={handleInputChange} placeholder="例如：上海交通大学" />
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">年级</label>
                                    <div className="relative">
                                        <select name="grade" value={formData.grade} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-unipath-500/20 focus:border-unipath-500 transition-all appearance-none font-medium text-slate-700">
                                            <option value="大一">大一</option>
                                            <option value="大二">大二</option>
                                            <option value="大三">大三</option>
                                            <option value="大四">大四</option>
                                        </select>
                                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <FormInput label="专业" name="major" value={formData.major} onChange={handleInputChange} placeholder="例如：计算机科学" />
                                <FormInput label="排名/绩点" name="rank" value={formData.rank} onChange={handleInputChange} placeholder="Top 5% 或 3.8/4.0" />
                            </div>

                            <FormInput label="英语水平" name="englishLevel" value={formData.englishLevel} onChange={handleInputChange} placeholder="例如：CET6 580" />

                            <FormTextArea label="竞赛奖项" name="awards" value={formData.awards} onChange={handleInputChange} placeholder="简述主要奖项，如：数模国二、互联网+银奖..." />
                            <FormTextArea label="科研/论文" name="research" value={formData.research} onChange={handleInputChange} placeholder="简述科研经历，如：发表一篇SCI三区一作..." />
                            <FormInput label="意向保研方向" name="targetDirection" value={formData.targetDirection} onChange={handleInputChange} placeholder="例如：人工智能、金融科技" />

                            {/* RE-ADDED Confusion Field */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 text-unipath-700">您主要想咨询的是？ <span className="text-xs text-red-400">*必填</span></label>
                                <textarea 
                                    required
                                    name="confusion"
                                    value={formData.confusion} 
                                    onChange={handleInputChange} 
                                    className="w-full px-4 py-3 bg-white border-2 border-unipath-100 rounded-xl outline-none focus:ring-2 focus:ring-unipath-500/20 focus:border-unipath-500 transition-all font-medium h-24 text-sm resize-none placeholder:text-slate-400" 
                                    placeholder="例如：大一很迷茫不知道怎么开始准备？我是家长，孩子想保外校有机会吗？" 
                                />
                            </div>

                            <div className="group flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 hover:border-blue-200 transition-colors cursor-pointer" onClick={() => setFormData(p => ({...p, isNewEngineering: !p.isNewEngineering}))}>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isNewEngineering ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                                    {formData.isNewEngineering && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-slate-800">属于新工科方向</div>
                                    <div className="text-xs text-slate-500">CS/AI/电子/通信等 (匹配破晓计划)</div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-unipath-600 to-purple-600 hover:from-unipath-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-unipath-500/30 transform transition-all hover:-translate-y-1 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>深度分析中...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                                        <span>立即生成规划方案</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Result Display */}
                {plan && (
                    <div className="lg:col-span-8 animate-fade-in-up space-y-6 pb-12 relative" id="pdf-root">
                        
                        {/* Download Button (Hidden in PDF) */}
                        <div className="absolute -top-12 right-0 flex gap-2" data-html2canvas-ignore="true">
                            <button 
                                onClick={handleDownloadPDF}
                                className="bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2 transition-all"
                            >
                                <Download className="w-4 h-4" />
                                下载 PDF 报告
                            </button>
                        </div>

                        {/* PDF Content Wrapper */}
                        <div id="pdf-content" className="space-y-6 p-2 bg-white rounded-xl shadow-sm">
                            
                            {/* Report Header (Visible mainly in PDF) */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-bold text-unipath-700 mb-2">深度保研规划报告</h1>
                                    <p className="text-slate-500">Generated by Unipath Smart Planner</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-slate-800">{formData.name}</div>
                                    <div className="text-slate-600">{formData.university} | {formData.grade}</div>
                                    <div className="text-slate-500 text-sm mt-1">{formData.contact || "未留联系方式"}</div>
                                </div>
                            </div>

                            {/* Expert Diagnosis (Confusion Answer) */}
                            <div className="bg-white rounded-2xl shadow-lg border-l-4 border-unipath-500 p-6 relative overflow-hidden">
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className="w-12 h-12 rounded-full bg-unipath-50 flex items-center justify-center shrink-0 border border-unipath-100">
                                        <Stethoscope className="w-6 h-6 text-unipath-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-slate-900 mb-1">专家诊疗室</h3>
                                        <div className="text-slate-500 text-sm mb-3 font-medium bg-slate-50 inline-block px-2 py-1 rounded">
                                            针对您咨询的问题：<span className="italic">"{formData.confusion}"</span>
                                        </div>
                                        <div className="text-slate-700 leading-relaxed space-y-2">
                                            {plan.confusionAnalysis?.content?.map((item, idx) => (
                                                <div key={idx} className="flex items-start gap-2">
                                                    <CheckCircle className="w-4 h-4 text-unipath-500 mt-1 shrink-0" />
                                                    <span>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Bar */}
                            <div className="bg-slate-900 text-white rounded-2xl shadow-xl p-6 flex justify-between items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-lg">
                                        <TrendingUp className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">保研成功率预估</h3>
                                        <p className="text-slate-400 text-sm">基于数万条历史数据匹配</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Analysis Card */}
                            {/* Replaced backdrop-blur with solid white for better PDF export */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 relative overflow-hidden pdf-page-break">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                <div className="flex items-center gap-3 mb-4">
                                    <FileText className="w-6 h-6 text-blue-500" />
                                    <h3 className="text-xl font-bold text-slate-900">{plan.analysis.title}</h3>
                                </div>
                                <div className="text-slate-700 leading-relaxed text-lg bg-slate-50 p-6 rounded-xl border border-slate-100 italic">
                                    "{plan.summary}"
                                </div>
                                <div className="mt-6 space-y-2">
                                    {plan.analysis.content.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 items-start">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2.5"></div>
                                            <p className="text-slate-600 leading-relaxed flex-1">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* NEW: School Data Visualization Section */}
                            {plan.schoolStats && <SchoolStatsSection stats={plan.schoolStats} />}

                            {/* SWOT Analysis Section */}
                            {plan.swot && <SwotSection swot={plan.swot} />}

                            {/* Three Pillars: Schools, Competitions, Research */}
                            <div className="grid grid-cols-1 gap-6">
                                {/* Target Schools */}
                                <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-sm border border-indigo-100 p-6 relative overflow-hidden">
                                    <div className="flex items-center gap-3 mb-6 relative z-10">
                                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                            <Target className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">{plan.targetSchools.title}</h3>
                                    </div>
                                    <div className="grid gap-3 relative z-10">
                                        {plan.targetSchools.content.map((item, idx) => (
                                            <div key={idx} className="bg-white p-4 rounded-xl border border-indigo-50 shadow-sm flex gap-4 items-center">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-slate-700 font-medium">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Competitions */}
                                <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl shadow-sm border border-amber-100 p-6 relative overflow-hidden">
                                    <div className="flex items-center gap-3 mb-6 relative z-10">
                                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                            <Award className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">{plan.competitionStrategy.title}</h3>
                                    </div>
                                    <div className="space-y-3 relative z-10">
                                        {plan.competitionStrategy.content.map((item, idx) => (
                                            <div key={idx} className="flex gap-3 items-start">
                                                <CheckCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                                <p className="text-slate-700">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Research */}
                                <div className="bg-gradient-to-br from-cyan-50 to-white rounded-2xl shadow-sm border border-cyan-100 p-6 relative overflow-hidden">
                                    <div className="flex items-center gap-3 mb-6 relative z-10">
                                        <div className="p-2 bg-cyan-100 text-cyan-600 rounded-lg">
                                            <BookOpen className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">{plan.researchStrategy.title}</h3>
                                    </div>
                                    <div className="space-y-3 relative z-10">
                                        {plan.researchStrategy.content.map((item, idx) => (
                                            <div key={idx} className="flex gap-3 items-start">
                                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2.5"></div>
                                                <p className="text-slate-700">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Career Outlook Section */}
                            <div className="pdf-page-break">
                                {plan.employment && <CareerSection employment={plan.employment} />}
                            </div>

                            {/* Timeline */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                    {plan.timeline.title}
                                </h3>
                                <div className="space-y-0 relative">
                                    <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100"></div>
                                    {plan.timeline.content.map((item, idx) => (
                                        <div key={idx} className="flex gap-6 relative pb-6 last:pb-0 group">
                                            <div className="relative z-10 flex-shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-white border-4 border-slate-50 shadow-sm flex items-center justify-center">
                                                    <div className="w-3 h-3 rounded-full bg-unipath-500"></div>
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 w-full">
                                                <p className="text-slate-700 font-medium">{item}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Product Recommendation Card */}
                            <div className={`rounded-2xl shadow-xl p-8 text-white bg-gradient-to-br ${plan.productRecommendation === 'Sunrise' ? PRODUCTS.SUNRISE.color : PRODUCTS.HARVEST.color} relative overflow-hidden group`}>
                                {/* Decorative Background Circles */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl shadow-inner">
                                            {plan.productRecommendation === 'Sunrise' ? <Zap className="w-8 h-8 text-white" /> : <GraduationCap className="w-8 h-8 text-white" />}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Unipath Selection</div>
                                            <h3 className="text-3xl font-bold tracking-tight">
                                                {plan.productRecommendation === 'Sunrise' ? PRODUCTS.SUNRISE.name : PRODUCTS.HARVEST.name}
                                            </h3>
                                        </div>
                                    </div>
                                    <p className="text-white/90 text-lg mb-6 max-w-2xl font-medium leading-relaxed">
                                        {plan.productRecommendation === 'Sunrise' ? PRODUCTS.SUNRISE.description : PRODUCTS.HARVEST.description}
                                    </p>
                                    <div className="flex gap-3 flex-wrap">
                                        {['官方数据支持', '名校导师1v1', '全流程陪伴', '结果保障'].map((tag, i) => (
                                            <span key={i} className="px-4 py-1.5 bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-sm font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
      </main>
      
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 text-center">
             <div className="flex items-center justify-center gap-2 mb-6 opacity-50">
                <div className="font-bold text-2xl tracking-tight text-slate-200">Unipath</div>
            </div>
            <p className="mb-4 text-slate-500">© 2024 好保研 Unipath. All rights reserved.</p>
            <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">数据来源：教育部官方平台及各高校研究生院官网。AI生成内容仅供参考。</p>
        </div>
      </footer>
    </div>
  );
}

// Subcomponents

const NavButton = ({ label, onClick, highlight }: { label: string, onClick: () => void, highlight?: boolean }) => (
    <button 
        onClick={onClick} 
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
            highlight 
            ? 'text-slate-600 hover:text-unipath-600 hover:bg-unipath-50' 
            : 'text-slate-500 hover:text-slate-800'
        }`}
    >
        {label}
    </button>
);

const FormInput = ({ label, name, value, onChange, placeholder }: any) => (
    <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
        <input 
            required 
            name={name} 
            value={value} 
            onChange={onChange} 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-unipath-500/20 focus:border-unipath-500 transition-all placeholder:text-slate-400 text-slate-800 font-medium" 
            placeholder={placeholder} 
        />
    </div>
);

const FormTextArea = ({ label, name, value, onChange, placeholder }: any) => (
    <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
        <textarea 
            name={name} 
            value={value} 
            onChange={onChange} 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-unipath-500/20 focus:border-unipath-500 transition-all placeholder:text-slate-400 text-slate-800 font-medium h-24 text-sm resize-none" 
            placeholder={placeholder} 
        />
    </div>
);

const SchoolStatsSection = ({ stats }: { stats: SchoolStats }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 pdf-page-break">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-slate-800 rounded-full"></span>
            本校保研大数据分析
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Rate Trend */}
            <div>
                 <div className="flex items-center gap-2 mb-3 text-slate-700 font-semibold">
                    <BarChart3 className="w-5 h-5 text-unipath-500" />
                    <h4>近三年保研率走势</h4>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-xl h-48 flex items-end justify-around gap-4 border border-slate-100">
                    {stats.rateTrend.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 w-full">
                            <div className="w-full bg-unipath-200 rounded-t-lg relative group h-32 flex items-end">
                                <div 
                                    className="w-full bg-unipath-500 rounded-t-lg transition-all duration-1000"
                                    style={{ height: item.rate.includes('%') ? item.rate : '50%' }}
                                ></div>
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {item.rate}
                                </span>
                            </div>
                            <span className="text-xs font-bold text-slate-600">{item.year}</span>
                            <span className="text-xs font-semibold text-unipath-600">{item.rate}</span>
                        </div>
                    ))}
                 </div>
            </div>

            {/* Destinations */}
            <div>
                 <div className="flex items-center gap-2 mb-3 text-slate-700 font-semibold">
                    <PieChart className="w-5 h-5 text-unipath-500" />
                    <h4>往届保研去向分布</h4>
                 </div>
                 <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-600 font-semibold">
                            <tr>
                                <th className="px-4 py-3">学校</th>
                                <th className="px-4 py-3 text-right">占比/人数</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {stats.destinations.map((d, i) => (
                                <tr key={i} className="bg-white">
                                    <td className="px-4 py-3 text-slate-800 font-medium">{d.school}</td>
                                    <td className="px-4 py-3 text-right text-slate-500">{d.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>

        {/* Bonus Policies Table */}
        <div className="mt-8">
            <div className="flex items-center gap-2 mb-3 text-slate-700 font-semibold">
                <FileText className="w-5 h-5 text-unipath-500" />
                <h4>保研加分政策摘要</h4>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-5 py-3 w-1/4">加分项</th>
                            <th className="px-5 py-3">政策内容详情</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {stats.bonusPolicies.map((policy, i) => (
                            <tr key={i} className="bg-white hover:bg-slate-50 transition-colors">
                                <td className="px-5 py-3 font-semibold text-unipath-600 bg-slate-50/50">{policy.category}</td>
                                <td className="px-5 py-3 text-slate-700">{policy.content}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const SwotSection = ({ swot }: { swot: SwotAnalysis }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-slate-800 rounded-full"></span>
            SWOT 核心竞争力分析
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SwotCard title="优势 (Strengths)" items={swot.strengths} type="strength" />
            <SwotCard title="劣势 (Weaknesses)" items={swot.weaknesses} type="weakness" />
            <SwotCard title="机会 (Opportunities)" items={swot.opportunities} type="opportunity" />
            <SwotCard title="威胁 (Threats)" items={swot.threats} type="threat" />
        </div>
    </div>
);

const SwotCard = ({ title, items, type }: { title: string, items: string[], type: 'strength' | 'weakness' | 'opportunity' | 'threat' }) => {
    const styles = {
        strength: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-800', icon: TrendingUp, iconColor: 'text-emerald-500' },
        weakness: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-800', icon: ShieldAlert, iconColor: 'text-rose-500' },
        opportunity: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-800', icon: Sparkles, iconColor: 'text-blue-500' },
        threat: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-800', icon: Target, iconColor: 'text-amber-500' },
    };
    const style = styles[type];
    const Icon = style.icon;

    return (
        <div className={`${style.bg} border ${style.border} p-5 rounded-xl`}>
            <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-5 h-5 ${style.iconColor}`} />
                <h4 className={`font-bold ${style.text}`}>{title}</h4>
            </div>
            <ul className="space-y-2">
                {items.map((item, i) => (
                    <li key={i} className="text-sm text-slate-600 flex gap-2 leading-relaxed">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 shrink-0"></span>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const CareerSection = ({ employment }: { employment: EmploymentOutlook }) => (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
            <div>
                <div className="flex items-center gap-3 mb-4 text-slate-300">
                    <Briefcase className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-wider text-sm">{employment.title}</h3>
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">
                        {employment.averageSalary}
                    </span>
                    <span className="text-slate-400">/ 年 (预估)</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {employment.roles.map((role, i) => (
                        <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/10">
                            {role}
                        </span>
                    ))}
                </div>
            </div>
            <div className="w-full md:w-auto bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur-sm min-w-[240px]">
                <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    重点就业去向
                </h4>
                <ul className="space-y-2">
                    {employment.topCompanies.map((company, i) => (
                        <li key={i} className="flex items-center justify-between text-sm">
                            <span className="font-medium">{company}</span>
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
);