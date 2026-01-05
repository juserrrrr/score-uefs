import React from 'react';
import { Trash2, Calendar } from 'lucide-react';
import type { Discipline } from '../types';

interface DisciplineTableProps {
    disciplines: Discipline[];
    onUpdate: (id: string, field: keyof Discipline, value: any) => void;
    onDelete: (id: string) => void;
}

export const DisciplineTable: React.FC<DisciplineTableProps> = ({ disciplines, onUpdate, onDelete }) => {

    const sortedDisciplines = [...disciplines].sort((a, b) => {
        if (a.semester === b.semester) return a.code.localeCompare(b.code);
        return a.semester.localeCompare(b.semester);
    });

    if (disciplines.length === 0) return null;

    return (
        <div className="w-full overflow-hidden rounded-xl border border-slate-700 bg-surface/30 backdrop-blur-md shadow-xl">
            <style>{`
                input[type="number"]::-webkit-inner-spin-button,
                input[type="number"]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type="number"] {
                    -moz-appearance: textfield;
                }
            `}</style>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface/80 border-b border-slate-700 text-xs uppercase tracking-wider text-slate-400">
                            <th className="p-4 font-medium">Período</th>
                            <th className="p-4 font-medium">Código</th>
                            <th className="p-4 font-medium w-1/3">Disciplina</th>
                            <th className="p-4 font-medium text-center">CH</th>
                            <th className="p-4 font-medium text-center">Nota</th>
                            <th className="p-4 font-medium text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {sortedDisciplines.map((item) => {
                            const isExcluded = ['DP', 'TR'].includes(item.status);
                            const isFailed = ['RE', 'RF', 'RP'].includes(item.status);
                            const isApproved = ['AP', 'AF'].includes(item.status);

                            const getStatusTag = () => {
                                if (item.status === 'DP') return { text: 'Dispensa', color: 'bg-slate-700 text-slate-400' };
                                if (item.status === 'TR') return { text: 'Trancamento', color: 'bg-slate-700 text-slate-400' };
                                if (isFailed) return { text: 'Reprovado', color: 'bg-red-500/20 text-red-400' };
                                if (isApproved) return { text: 'Aprovado', color: 'bg-emerald-500/20 text-emerald-400' };
                                return null;
                            };
                            const statusTag = getStatusTag();

                            return (
                                <tr key={item.id} className={`group hover:bg-white/5 transition-colors ${isExcluded ? 'opacity-50' : ''}`}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-slate-400 group-hover:text-white transition-colors">
                                            <Calendar className="w-3 h-3" />
                                            <span className="text-sm font-medium">{item.semester}</span>
                                            {statusTag && (
                                                <span className={`text-xs px-1.5 py-0.5 rounded ${statusTag.color}`}>
                                                    {statusTag.text}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-mono text-violet-400">{item.code}</td>
                                    <td className="p-4">
                                        {isExcluded ? (
                                            <span className="text-sm text-slate-400">{item.name}</span>
                                        ) : (
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
                                                className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 w-full focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all"
                                            />
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        {isExcluded ? (
                                            <span className="text-sm text-slate-500">-</span>
                                        ) : (
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={item.hours || ''}
                                                    placeholder="?"
                                                    onChange={(e) => onUpdate(item.id, 'hours', Number(e.target.value))}
                                                    title={item.hours <= 0 ? "Carga horária não encontrada no PDF" : ""}
                                                    className={`rounded-lg px-2 py-1.5 text-sm w-16 text-center focus:outline-none transition-all ${item.hours <= 0
                                                        ? "bg-red-500/20 border-2 border-red-500 text-red-300 placeholder-red-400"
                                                        : "bg-slate-800/50 border border-slate-700 text-slate-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50"
                                                        }`}
                                                />
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        {isExcluded ? (
                                            <span className="text-sm text-slate-500">-</span>
                                        ) : (
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="10"
                                                value={item.grade}
                                                onChange={(e) => onUpdate(item.id, 'grade', Number(e.target.value))}
                                                className="bg-slate-800/50 border border-slate-700 rounded-lg px-2 py-1.5 text-sm w-16 text-center font-bold text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all"
                                            />
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => onDelete(item.id)}
                                            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                            title="Remover disciplina"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
