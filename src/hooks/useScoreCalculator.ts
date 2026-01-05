import { useMemo } from 'react';
import type { Discipline, ScoreResult } from '../types';

export interface SemesterScore {
    semester: string;
    score: number; // Score acumulado até este semestre (média aritmética dos semestres)
    hours: number;
    semesterScore: number; // Média ponderada deste semestre
    semesterHours: number;
    cumulativeWeightedScore: number; // Média ponderada cumulativa até este semestre
}

export interface CalculatorResult extends ScoreResult {
    semesterScores: SemesterScore[];
    pendingDisciplines: Discipline[];
    isComplete: boolean;
    approvedHours: number;
    cumulativeScore: number; // Score antigo: média ponderada cumulativa
}

// Status que não contam no cálculo do score
const EXCLUDED_FROM_SCORE = ['DP', 'TR'];

export const useScoreCalculator = (disciplines: Discipline[]): CalculatorResult => {
    return useMemo(() => {
        if (disciplines.length === 0) {
            return {
                officialScore: 0,
                exactScore: 0,
                totalHours: 0,
                approvedHours: 0,
                cumulativeScore: 0,
                filteredDisciplines: [],
                semesterScores: [],
                pendingDisciplines: [],
                isComplete: true
            };
        }

        // Verifica disciplinas pendentes (horas = 0), exceto DP/TR
        const pendingDisciplines = disciplines.filter(d =>
            d.hours <= 0 && !['DP', 'TR'].includes(d.status)
        );
        const isComplete = pendingDisciplines.length === 0;

        if (!isComplete) {
            return {
                officialScore: 0,
                exactScore: 0,
                totalHours: 0,
                approvedHours: 0,
                cumulativeScore: 0,
                filteredDisciplines: disciplines,
                semesterScores: [],
                pendingDisciplines,
                isComplete
            };
        }

        // Agrupa por semestre
        const semesterMap = new Map<string, Discipline[]>();
        disciplines.forEach(d => {
            const list = semesterMap.get(d.semester) || [];
            list.push(d);
            semesterMap.set(d.semester, list);
        });

        const sortedSemesters = Array.from(semesterMap.keys()).sort();

        const semesterScores: SemesterScore[] = [];
        let cumulativeHours = 0;
        let cumulativeWeightedSum = 0; // Para média ponderada cumulativa
        const semesterAverages: number[] = [];

        for (const semester of sortedSemesters) {
            const semesterDisciplines = semesterMap.get(semester) || [];

            let semesterHours = 0;
            let semesterWeightedSum = 0;

            semesterDisciplines.forEach(d => {
                // Só conta se NÃO for DP ou TR
                if (!EXCLUDED_FROM_SCORE.includes(d.status)) {
                    semesterHours += d.hours;
                    semesterWeightedSum += d.grade * d.hours;
                }
            });

            cumulativeHours += semesterHours;
            cumulativeWeightedSum += semesterWeightedSum;

            // Média ponderada deste semestre
            const semesterAverage = semesterHours > 0 ? semesterWeightedSum / semesterHours : 0;

            // Só adiciona se o semestre tem disciplinas válidas
            if (semesterHours > 0) {
                semesterAverages.push(semesterAverage);
            }

            // Score acumulado = média aritmética de todos os semestres até agora
            const accumulatedScore = semesterAverages.length > 0
                ? semesterAverages.reduce((a, b) => a + b, 0) / semesterAverages.length
                : 0;

            // Média ponderada cumulativa até este semestre
            const cumulativeWeightedScore = cumulativeHours > 0
                ? cumulativeWeightedSum / cumulativeHours
                : 0;

            semesterScores.push({
                semester,
                score: accumulatedScore,
                hours: cumulativeHours,
                semesterScore: semesterAverage,
                semesterHours,
                cumulativeWeightedScore
            });
        }

        // Score final = média aritmética das médias de cada semestre
        const exactScore = semesterAverages.length > 0
            ? semesterAverages.reduce((a, b) => a + b, 0) / semesterAverages.length
            : 0;

        // Horas aprovadas (exclui DP/TR)
        const approvedHours = disciplines
            .filter(d => !EXCLUDED_FROM_SCORE.includes(d.status))
            .reduce((sum, d) => sum + d.hours, 0);

        // Score antigo: média ponderada cumulativa (soma tudo e divide)
        let totalWeightedSum = 0;
        let totalValidHours = 0;
        disciplines.forEach(d => {
            if (!EXCLUDED_FROM_SCORE.includes(d.status)) {
                totalWeightedSum += d.grade * d.hours;
                totalValidHours += d.hours;
            }
        });
        const cumulativeScore = totalValidHours > 0 ? totalWeightedSum / totalValidHours : 0;

        return {
            officialScore: parseFloat(exactScore.toFixed(1)),
            exactScore,
            totalHours: cumulativeHours,
            approvedHours,
            cumulativeScore,
            filteredDisciplines: disciplines,
            semesterScores,
            pendingDisciplines: [],
            isComplete: true
        };
    }, [disciplines]);
};
