import { useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { Discipline } from '../types';

import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const usePDFParser = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const parsePDF = useCallback(async (file: File): Promise<Discipline[]> => {
        setIsLoading(true);
        setError(null);
        const disciplines: Discipline[] = [];

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

            let fullText = '';
            const headerPattern = 'UNIVERSIDADE ESTADUAL DE FEIRA DE SANTANA';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                let pageText = textContent.items.map((item: any) => item.str).join(' ');

                // Remove duplicação interna da página (corta na segunda ocorrência do header)
                const firstIndex = pageText.indexOf(headerPattern);
                const secondIndex = pageText.indexOf(headerPattern, firstIndex + headerPattern.length);
                if (secondIndex > 0) {
                    pageText = pageText.substring(0, secondIndex);
                }

                fullText += pageText + '\n';
            }

            // Remove NÃO MATRICULADO
            fullText = fullText.replace(/---\s*---\s*---\s*\d{4}\.\d[A-Z]?\s*---\s*NÃO MATRICULADO\s*-+/g, '');

            const validStatus = 'AP|AF|RE|RF|RP|DP|TR';

            const semesterRegex = /(\d{4}\.\d{1,2}[A-Z]?)\s+(?:AP|AF|RE|RF|RP|DP|TR|---)/g;
            const semesterPositions: { index: number; semester: string }[] = [];
            let semMatch;
            while ((semMatch = semesterRegex.exec(fullText)) !== null) {
                semesterPositions.push({ index: semMatch.index, semester: semMatch[1] });
            }

            // Regex que aceita nota como número OU --- (para DP/TR)
            // Também aceita múltiplos --- antes do status
            const regex = new RegExp(`(\\d{1,2}[.,]\\d|---)\\s+(\\d{2,3}|---)\\s+(?:---\\s*)*(\\d{4}\\.\\d{1,2}[A-Z]?)?\\s*(${validStatus})\\s+(.+?)\\s+([A-Z]{3}\\d{3})`, 'g');

            const seen = new Set<string>();
            let match;

            while ((match = regex.exec(fullText)) !== null) {
                const [, gradeStr, hoursStr, semesterMatch, status, name, code] = match;
                const matchIndex = match.index;

                let semester = 'Geral';
                if (semesterMatch) {
                    semester = semesterMatch;
                } else {
                    const prevSem = semesterPositions.filter(s => s.index < matchIndex).pop();
                    if (prevSem) semester = prevSem.semester;
                }

                const key = `${code}-${semester}`;
                if (seen.has(key)) continue;
                seen.add(key);

                const hours = hoursStr === '---' ? 0 : parseInt(hoursStr, 10);
                // Nota --- (para DP/TR) vira 0
                let grade = gradeStr === '---' ? 0 : parseFloat(gradeStr.replace(',', '.'));
                if (status === 'RF') grade = 0;
                if (isNaN(grade)) grade = 0;

                disciplines.push({
                    id: crypto.randomUUID(),
                    semester,
                    code,
                    name: name.trim(),
                    hours,
                    grade,
                    status: status as 'AP' | 'AF'
                });
            }

            disciplines.sort((a, b) => {
                if (a.semester !== b.semester) return a.semester.localeCompare(b.semester);
                return a.code.localeCompare(b.code);
            });

            if (disciplines.length === 0) {
                throw new Error("Nenhuma disciplina encontrada.");
            }

            return disciplines;

        } catch (err: any) {
            console.error(err);
            const msg = err instanceof Error ? err.message : 'Erro ao processar o PDF.';
            setError(msg);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { parsePDF, isLoading, error };
};
