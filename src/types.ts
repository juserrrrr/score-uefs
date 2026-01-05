export interface Discipline {
    id: string;
    semester: string;
    code: string;
    name: string;
    hours: number;
    grade: number;
    status: 'AP' | 'AF' | 'DP' | 'RE' | 'RF' | 'RP' | 'TR';
}

export interface ScoreResult {
    officialScore: number;
    exactScore: number;
    totalHours: number;
    filteredDisciplines: Discipline[];
}
