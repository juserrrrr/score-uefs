import React from 'react';
import { Trash2, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
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
            {/* Desktop View - Tabela Tradicional */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
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
                            const isMissingHours = item.hours <= 0 && !isExcluded;

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
                                                className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 w-full focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all"
                                            />
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        {isExcluded ? (
                                            <span className="text-sm text-slate-500">-</span>
                                        ) : (
                                            <div className="relative flex justify-center">
                                                <input
                                                    type="number"
                                                    value={item.hours || ''}
                                                    placeholder={isMissingHours ? "?" : ""}
                                                    onChange={(e) => onUpdate(item.id, 'hours', Number(e.target.value))}
                                                    title={isMissingHours ? "Digite a carga horária" : "Carga Horária"}
                                                    className={cn(
                                                        "rounded-lg px-2 py-2 text-sm w-20 text-center focus:outline-none transition-all font-medium",
                                                        isMissingHours
                                                            ? "bg-red-500/20 border-2 border-red-500 text-red-100 placeholder-red-300 animate-pulse focus:animate-none shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                                                            : "bg-slate-800/50 border border-slate-700 text-slate-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50"
                                                    )}
                                                />
                                                {isMissingHours && (
                                                    <span className="absolute -top-3 -right-2 flex h-3 w-3">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                                    </span>
                                                )}
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
                                                className="bg-slate-800/50 border border-slate-700 rounded-lg px-2 py-2 text-sm w-20 text-center font-bold text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all"
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

            {/* Mobile View - Lista de Cards */}
            <div className="md:hidden divide-y divide-slate-700/50">
                {sortedDisciplines.map((item) => {
                    const isExcluded = ['DP', 'TR'].includes(item.status);
                    const isFailed = ['RE', 'RF', 'RP'].includes(item.status);
                    const isApproved = ['AP', 'AF'].includes(item.status);
                    const isMissingHours = item.hours <= 0 && !isExcluded;

                    const getStatusTag = () => {
                        if (item.status === 'DP') return { text: 'Dispensa', color: 'bg-slate-700 text-slate-400' };
                        if (item.status === 'TR') return { text: 'Trancamento', color: 'bg-slate-700 text-slate-400' };
                        if (isFailed) return { text: 'Reprovado', color: 'bg-red-500/20 text-red-400' };
                        if (isApproved) return { text: 'Aprovado', color: 'bg-emerald-500/20 text-emerald-400' };
                        return null;
                    };
                    const statusTag = getStatusTag();

                    return (
                        <div key={item.id} className={`p-4 space-y-3 ${isExcluded ? 'opacity-50' : ''} active:bg-white/5`}>
                            {/* Cabeçalho do Card Mobile */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 text-slate-400 bg-slate-800/50 px-2 py-1 rounded text-xs font-medium">
                                        <Calendar className="w-3 h-3" />
                                        {item.semester}
                                    </div>
                                    <span className="text-xs font-mono text-violet-400">{item.code}</span>
                                </div>
                                {statusTag && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wide ${statusTag.color}`}>
                                        {statusTag.text}
                                    </span>
                                )}
                            </div>

                            {/* Nome da Disciplina */}
                            <div className="w-full">
                                {isExcluded ? (
                                    <span className="text-sm text-slate-400 block py-2">{item.name}</span>
                                ) : (
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all"
                                        placeholder="Nome da disciplina"
                                    />
                                )}
                            </div>

                            {/* Inputs de Valor (CH e Nota) e Delete */}
                            <div className="flex items-center gap-3">
                                {/* CH Input */}
                                <div className="flex-1 relative">
                                    <label className="text-[10px] text-slate-500 mb-1 block uppercase tracking-wider">Carga Horária</label>
                                    {isExcluded ? (
                                        <div className="h-9 flex items-center text-slate-500 text-sm">-</div>
                                    ) : (
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={item.hours || ''}
                                                placeholder={isMissingHours ? "?" : "CH"}
                                                onChange={(e) => onUpdate(item.id, 'hours', Number(e.target.value))}
                                                className={cn(
                                                    "w-full rounded-lg px-3 py-2 text-sm text-center font-bold focus:outline-none transition-all",
                                                    isMissingHours
                                                        ? "bg-red-500/20 border-2 border-red-500 text-red-100 placeholder-red-300 animate-pulse focus:animate-none"
                                                        : "bg-slate-800/50 border border-slate-700 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50"
                                                )}
                                            />
                                            {isMissingHours && (
                                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Nota Input */}
                                <div className="flex-1">
                                    <label className="text-[10px] text-slate-500 mb-1 block uppercase tracking-wider">Nota</label>
                                    {isExcluded ? (
                                        <div className="h-9 flex items-center text-slate-500 text-sm pl-2">-</div>
                                    ) : (
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="10"
                                            value={item.grade}
                                            onChange={(e) => onUpdate(item.id, 'grade', Number(e.target.value))}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-center font-bold text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all"
                                        />
                                    )}
                                </div>

                                {/* Botão Delete */}
                                <div className="pt-4">
                                    <button
                                        onClick={() => onDelete(item.id)}
                                        className="p-2.5 rounded-lg bg-slate-800 text-slate-500 hover:text-red-400 hover:bg-red-400/10 border border-slate-700 transition-colors"
                                        title="Remover disciplina"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
