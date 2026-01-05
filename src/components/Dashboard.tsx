import React, { useState } from 'react';
import { Calculator, Sigma, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import type { CalculatorResult } from '../hooks/useScoreCalculator';
import {
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Area,
    ComposedChart,
    Bar
} from 'recharts';

interface DashboardProps {
    data: CalculatorResult;
}

type ScoreType = 'weighted' | 'arithmetic';

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
    const [scoreType, setScoreType] = useState<ScoreType>('weighted');
    const [showTooltip, setShowTooltip] = useState(false);

    // Valores baseados no tipo selecionado
    const displayScoreRounded = scoreType === 'weighted'
        ? parseFloat(data.cumulativeScore.toFixed(1))
        : data.officialScore;
    const scoreName = scoreType === 'weighted' ? 'Média Ponderada' : 'Média dos Semestres';
    const scoreFormula = scoreType === 'weighted'
        ? 'Σ(nota × CH) / Σ(CH)'
        : 'Média aritmética das médias semestrais';
    // Mostra aviso se há disciplinas pendentes
    if (!data.isComplete) {
        return (
            <div className="mb-8 p-6 rounded-2xl border border-amber-500/50 bg-amber-500/10">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-amber-500/20">
                        <AlertTriangle className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-amber-300 mb-2">
                            Preencha a Carga Horária
                        </h3>
                        <p className="text-sm text-amber-200/80 mb-3">
                            A carga horária de {data.pendingDisciplines.length} disciplina(s) não foi encontrada no PDF:
                        </p>
                        <ul className="space-y-1">
                            {data.pendingDisciplines.map(d => (
                                <li key={d.id} className="text-sm text-amber-100/70">
                                    • <span className="font-mono text-amber-300">{d.code}</span> - {d.name} ({d.semester})
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 mb-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative h-full">
                    <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-surface/80 to-surface/40 border border-slate-700/50 backdrop-blur-xl shadow-xl hover:border-slate-600/50 transition-all overflow-hidden flex flex-col justify-between">
                        <div className={cn("absolute top-0 left-0 w-full h-1 bg-gradient-to-r",
                            scoreType === 'weighted' ? 'from-orange-500 to-amber-500' : 'from-emerald-500 to-teal-500')} />
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-medium text-slate-400">{scoreName}</h3>
                                    <button
                                        className="w-4 h-4 rounded-full bg-slate-700 text-slate-400 text-xs hover:bg-slate-600 hover:text-white transition-colors flex items-center justify-center"
                                        onMouseEnter={() => setShowTooltip(true)}
                                        onMouseLeave={() => setShowTooltip(false)}
                                    >
                                        ?
                                    </button>
                                </div>
                                <div className={cn("p-2 rounded-xl bg-gradient-to-br text-white",
                                    scoreType === 'weighted' ? 'from-orange-500 to-amber-500' : 'from-emerald-500 to-teal-500')}>
                                    <Activity className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-white tracking-tight">{displayScoreRounded.toFixed(1)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            <button
                                onClick={() => setScoreType('weighted')}
                                className={cn("px-3 py-1.5 text-xs rounded-lg transition-all",
                                    scoreType === 'weighted'
                                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                                        : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                                )}
                            >
                                Ponderada
                            </button>
                            <button
                                onClick={() => setScoreType('arithmetic')}
                                className={cn("px-3 py-1.5 text-xs rounded-lg transition-all",
                                    scoreType === 'arithmetic'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                                        : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                                )}
                            >
                                Semestral
                            </button>
                        </div>
                    </div>
                    {/* Tooltip - aparece APENAS ao hover no ? */}
                    <div
                        className={cn(
                            "absolute left-20 top-12 w-80 p-3 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 transition-all",
                            showTooltip ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                        )}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                    >
                        <p className="text-xs text-slate-300 font-medium mb-2">
                            {scoreType === 'weighted' ? 'Média Ponderada:' : 'Média dos Semestres:'}
                        </p>
                        <p className="text-xs font-mono text-emerald-400 mb-2">{scoreFormula}</p>
                        {scoreType === 'weighted' ? (
                            <p className="text-xs text-slate-400 mb-2">
                                Soma (nota × CH) de todas as disciplinas e divide pelo total de CH.
                            </p>
                        ) : (
                            <p className="text-xs text-slate-400 mb-2">
                                Calcula a média ponderada de cada semestre, depois faz a média aritmética de todas.
                            </p>
                        )}
                        <p className="text-xs text-slate-500 pt-2 border-t border-slate-700">
                            DP/TR ignorados • RF = nota 0
                        </p>
                        <p className="text-xs text-amber-400 mt-2">
                            💡 Para Eng. Computação UEFS, recomenda-se usar a Média Ponderada.
                        </p>
                    </div>
                </div>
                <Card
                    title="Precisão"
                    value={scoreType === 'weighted' ? data.cumulativeScore.toFixed(4) : data.exactScore.toFixed(4)}
                    icon={<Calculator className="w-5 h-5" />}
                    gradient="from-blue-500 to-cyan-500"
                    subtext="4 Casas Decimais"
                />
                <Card
                    title="Carga Horária"
                    value={`${data.approvedHours}h`}
                    icon={<Sigma className="w-5 h-5" />}
                    gradient="from-violet-500 to-purple-500"
                    subtext={
                        <>
                            Total Aprovado
                            <span className="block text-center text-[10px] text-slate-300/80 mt-1 font-medium bg-slate-800/20 py-0.5 px-2 rounded-md border border-slate-700/30">
                                Sem carga horária de dispensas/trancamentos
                            </span>
                        </>
                    }
                />
            </div>

            {/* Recharts Line Chart */}
            {data.semesterScores.length > 1 && (
                <div className="p-6 rounded-2xl border border-slate-700/50 bg-gradient-to-br from-surface/80 to-surface/40 backdrop-blur-xl shadow-2xl overflow-hidden">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                            <TrendingUp className="w-5 h-5 text-violet-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Evolução do Desempenho</h3>
                    </div>

                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={data.semesterScores}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis
                                dataKey="semester"
                                stroke="#94a3b8"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                                interval="preserveStartEnd"
                                minTickGap={20}
                            />
                            <YAxis
                                yAxisId="left"
                                stroke="#94a3b8"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                domain={[0, 10]}
                                width={30}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#94a3b8"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                width={30}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                                }}
                                itemStyle={{ padding: 0 }}
                                labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '8px' }}
                                formatter={(value, name) => {
                                    const numValue = typeof value === 'number' ? value : 0;
                                    const isScoreLine = name === 'Score Oficial' || name === 'Média Ponderada';
                                    return [
                                        <span className="font-mono font-bold ml-2">
                                            {isScoreLine ? numValue.toFixed(4) : numValue}
                                        </span>,
                                        name
                                    ];
                                }}
                            />
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="circle"
                                formatter={(value) => <span className="text-[10px] md:text-sm font-medium text-slate-300">{value}</span>}
                            />
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="score"
                                stroke="transparent"
                                fill="url(#colorScore)"
                                strokeWidth={0}
                                legendType="none"
                                tooltipType="none"
                            />
                            <Bar
                                yAxisId="right"
                                dataKey="semesterHours"
                                name="CH Semestral"
                                fill="#06b6d4"
                                opacity={0.3}
                                radius={[4, 4, 0, 0]}
                                maxBarSize={50}
                            />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey={scoreType === 'weighted' ? 'cumulativeWeightedScore' : 'score'}
                                name={scoreName}
                                stroke={scoreType === 'weighted' ? '#f97316' : '#8b5cf6'}
                                strokeWidth={3}
                                dot={{ fill: scoreType === 'weighted' ? '#f97316' : '#8b5cf6', strokeWidth: 2, r: 3, stroke: '#fff' }}
                                activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

const Card: React.FC<{ title: string; value: string; icon: React.ReactNode; gradient: string; subtext: React.ReactNode }> = ({
    title, value, icon, gradient, subtext
}) => (
    <div className="relative p-6 rounded-2xl bg-gradient-to-br from-surface/80 to-surface/40 border border-slate-700/50 backdrop-blur-xl shadow-xl overflow-hidden group hover:border-slate-600/50 transition-all h-full flex flex-col justify-between">
        <div className={cn("absolute top-0 left-0 w-full h-1 bg-gradient-to-r", gradient)} />
        <div>
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-400">{title}</h3>
                <div className={cn("p-2 rounded-xl bg-gradient-to-br text-white", gradient)}>{icon}</div>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white tracking-tight">{value}</span>
            </div>
        </div>
        <div className="text-xs text-slate-500 mt-3">{subtext}</div>
    </div>
);
