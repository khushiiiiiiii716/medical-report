import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  TrendingUp, 
  AlertCircle, 
  Download, 
  Search, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  Info,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

import RiskPredictor from './RiskPredictor';
import { MOCK_TRENDS } from '../utils/mockData';

const API_BASE_URL = 'http://localhost:5000/api';

function Dashboard({ report, reportsList, setActiveTab, setActiveReportIndex }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedBiomarker, setExpandedBiomarker] = useState(null);
  const [trendData, setTrendData] = useState(MOCK_TRENDS);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchTrendData();
  }, [reportsList]);

  const fetchTrendData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/trends`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setTrendData(data);
        }
      }
    } catch (e) {
      console.log("Could not load backend trend data. Using mock trends.", e);
    }
  };

  if (!report) {
    return (
      <div className="text-center py-16 glass-panel rounded-2xl border border-darkCardBorder max-w-lg mx-auto">
        <AlertCircle size={48} className="text-neonWarning mx-auto mb-4" />
        <h3 className="text-lg font-bold mb-2">No Reports Available</h3>
        <p className="text-sm text-slate-400 mb-6">
          Upload a medical report image or PDF using the button in the header to initialize health diagnostics.
        </p>
      </div>
    );
  }

  // Categories extraction
  const categories = ['All', ...new Set(report.biomarkers.map(b => b.category))];

  // Filters
  const filteredBiomarkers = report.biomarkers.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || b.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const abnormalitiesCount = report.biomarkers.filter(b => b.status !== 'Normal').length;
  
  // Health Score Circular Progress Ring Calculations
  const score = report.health_score;
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let scoreColor = '#10B981'; // Green (Excellent)
  let scoreText = 'Excellent';
  let scoreClass = 'text-neonTeal';
  if (score < 60) {
    scoreColor = '#EF4444'; // Red
    scoreText = 'Attention Required';
    scoreClass = 'text-neonCritical';
  } else if (score < 75) {
    scoreColor = '#F59E0B'; // Orange
    scoreText = 'Moderate';
    scoreClass = 'text-neonWarning';
  } else if (score < 90) {
    scoreColor = '#06B6D4'; // Cyan
    scoreText = 'Good';
    scoreClass = 'text-neonCyan';
  }

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/report/${report.id}/download`);
      if (response.ok) {
        // Trigger file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Health_Summary_${report.filename.replace(/\.[^/.]+$/, "")}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to download PDF summary report.");
      }
    } catch (e) {
      console.log(e);
      alert("Error downloading PDF report. Make sure backend is running.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Health Score Circular Indicator */}
        <div className="glass-panel p-6 rounded-2xl flex items-center space-x-6">
          <div className="relative flex items-center justify-center shrink-0">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
              <circle
                stroke="rgba(255, 255, 255, 0.05)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke={scoreColor}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                className="progress-ring-circle"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-extrabold text-white">{score}</span>
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Score</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Overall Diagnosis
            </span>
            <h4 className={`text-xl font-extrabold tracking-wide ${scoreClass}`}>
              {scoreText}
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Based on {report.biomarkers.length} extracted blood biomarkers.
            </p>
          </div>
        </div>

        {/* Card 2: Biomarker Quick Statistics */}
        <div className="glass-panel p-6 rounded-2xl flex items-center space-x-5">
          <div className="p-4 bg-neonWarning/10 text-neonWarning rounded-2xl border border-neonWarning/15 shadow-glow-indigo">
            <ShieldAlert size={28} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Biomarker Anomalies
            </span>
            <h4 className="text-2xl font-black text-white">
              {abnormalitiesCount} <span className="text-xs font-bold text-slate-400">/ {report.biomarkers.length} out of range</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {abnormalitiesCount > 0 
                ? `${abnormalitiesCount} health markers require dietary or lifestyle modifications.` 
                : 'Excellent! All lab values fall within standard healthy ranges.'}
            </p>
          </div>
        </div>

        {/* Card 3: Report Metadata Actions */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                Active Document
              </span>
              <h4 className="text-sm font-bold text-white truncate max-w-[200px] mb-0.5">
                {report.filename}
              </h4>
              <p className="text-[10px] text-slate-500 flex items-center space-x-1">
                <Calendar size={10} />
                <span>Uploaded on {new Date(report.upload_date).toLocaleDateString()}</span>
              </p>
            </div>
            <span className="bg-neonCyan/10 text-neonCyan font-bold text-[9px] px-2 py-0.5 rounded border border-neonCyan/15 uppercase tracking-widest shrink-0">
              Active
            </span>
          </div>

          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex-1 flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider"
            >
              {isDownloading ? (
                <span>Generating...</span>
              ) : (
                <>
                  <Download size={13} />
                  <span>Download Summary</span>
                </>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className="flex-1 bg-neonIndigo/20 hover:bg-neonIndigo/30 text-neonIndigo border border-neonIndigo/20 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider text-center"
            >
              Compare Trends
            </button>
          </div>
        </div>

      </div>

      {/* Disease Risk Predictions Dashboard */}
      <RiskPredictor risks={report.risks} />

      {/* Main Grid: Biomarkers & Trending */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Biomarkers Table */}
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-darkCardBorder">
            
            {/* Table Header Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  Laboratory Biomarkers Breakdown
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Extracted values compared with biological reference ranges.
                </p>
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search biomarker..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-darkBg border border-darkCardBorder rounded-xl pl-9 pr-4 py-2 text-xs w-full md:w-56 focus:outline-none focus:border-neonCyan"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-darkCardBorder">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    activeCategory === cat
                      ? 'bg-neonCyan/15 border-neonCyan/30 text-neonCyan'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Biomarkers Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-darkCardBorder text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Biomarker</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3 text-right">Value</th>
                    <th className="pb-3 pl-4">Unit</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3">Reference Range</th>
                    <th className="pb-3 pr-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-darkCardBorder">
                  {filteredBiomarkers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-xs text-slate-400">
                        No parameters found matching the search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBiomarkers.map((bio, index) => {
                      const isExpanded = expandedBiomarker === bio.name;
                      let badgeStyle = 'bg-neonTeal/10 text-neonTeal border-neonTeal/15'; // Normal
                      if (bio.status === 'High') badgeStyle = 'bg-neonCritical/10 text-neonCritical border-neonCritical/15';
                      if (bio.status === 'Low') badgeStyle = 'bg-blue-500/10 text-blue-400 border-blue-500/15';
                      if (bio.status === 'Borderline') badgeStyle = 'bg-neonWarning/10 text-neonWarning border-neonWarning/15';

                      return (
                        <React.Fragment key={bio.name}>
                          <tr 
                            onClick={() => setExpandedBiomarker(isExpanded ? null : bio.name)}
                            className="text-xs hover:bg-white/5 cursor-pointer transition-colors"
                          >
                            <td className="py-4 pl-2 font-bold text-white flex items-center space-x-1.5">
                              <span>{bio.name}</span>
                              <Info size={11} className="text-slate-500 cursor-help" />
                            </td>
                            <td className="py-4 text-slate-400 text-[11px]">{bio.category}</td>
                            <td className="py-4 text-right font-black text-white">{bio.value}</td>
                            <td className="py-4 pl-4 text-slate-400 text-[11px]">{bio.unit}</td>
                            <td className="py-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${badgeStyle}`}>
                                {bio.status}
                              </span>
                            </td>
                            <td className="py-4 text-slate-400 font-mono text-[11px]">{bio.reference_range}</td>
                            <td className="py-4 pr-2 text-right text-slate-500">
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </td>
                          </tr>
                          
                          {/* Expanded Explanation Row */}
                          {isExpanded && (
                            <tr>
                              <td colSpan="7" className="bg-[#111827]/40 p-4 border-l-4 border-neonCyan">
                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-slate-300">Biomarker Explanation:</p>
                                  <p className="text-xs text-slate-400 leading-relaxed">
                                    {bio.description}
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Right 1 Column: Trends Charts */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-darkCardBorder h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Historical Biomarker Trends
                </h3>
                <TrendingUp size={16} className="text-neonCyan" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Visualizing laboratory biomarker fluctuations over time from past medical history reports.
              </p>
            </div>

            {/* Line Chart */}
            <div className="h-64 mt-4 shrink-0">
              {trendData.length < 2 ? (
                <div className="h-full flex flex-col items-center justify-center border border-dashed border-darkCardBorder rounded-xl p-4 text-center">
                  <Activity size={24} className="text-slate-500 mb-2" />
                  <p className="text-[11px] font-bold text-slate-400">Multiple Reports Needed</p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">
                    Upload subsequent diagnostic reports to construct linear trends.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748B" 
                      fontSize={10} 
                      dy={10}
                    />
                    <YAxis stroke="#64748B" fontSize={10} />
                    <ChartTooltip 
                      contentStyle={{ 
                        backgroundColor: '#151C2C', 
                        borderColor: 'rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        fontSize: '11px'
                      }} 
                    />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="Fasting Glucose" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      activeDot={{ r: 6 }} 
                      name="Glucose"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Hemoglobin" 
                      stroke="#06B6D4" 
                      strokeWidth={2}
                      name="Hemoglobin"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Total Cholesterol" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      name="Cholesterol"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="mt-6 p-4 bg-white/5 border border-white/5 rounded-xl">
              <div className="flex items-center space-x-2 text-neonCyan mb-1.5">
                <Sparkles size={14} />
                <span className="text-[11px] font-bold uppercase tracking-wider">Clinical Insight</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Evaluating the chronological trend shows your **Hemoglobin** levels have decreased and **Fasting Glucose** has increased between your records. Review the diet recommendations tab.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;
