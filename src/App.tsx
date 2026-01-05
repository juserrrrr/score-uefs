import { useState } from 'react';
import { Header } from './components/Header';
import { UploadArea } from './components/UploadArea';
import { Dashboard } from './components/Dashboard';
import { DisciplineTable } from './components/DisciplineTable';
import { usePDFParser } from './hooks/usePDFParser';
import { useScoreCalculator } from './hooks/useScoreCalculator';
import type { Discipline } from './types';
import { AlertCircle, ShieldCheck } from 'lucide-react';

function App() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const { parsePDF, isLoading, error } = usePDFParser();

  const scoreData = useScoreCalculator(disciplines);

  const handleUpload = async (file: File) => {
    const data = await parsePDF(file);
    if (data.length > 0) {
      setDisciplines(data);
    }
  };

  const handleUpdate = (id: string, field: keyof Discipline, value: any) => {
    setDisciplines(prev => prev.map(d =>
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const handleDelete = (id: string) => {
    setDisciplines(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary/30">
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <Header />

        <div className="mt-8 space-y-8">
          <section>
            <UploadArea onUpload={handleUpload} isLoading={isLoading} />
            {error && (
              <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
            {/* Aviso de privacidade */}
            <div className="flex items-center justify-center gap-2 mt-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <p className="text-xs text-emerald-300/80 text-center">
                <span className="font-medium">100% Privado:</span> Nenhum dado é armazenado ou enviado para servidores. Todo o processamento é feito localmente no seu navegador.
              </p>
            </div>
          </section>

          {disciplines.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
              <Dashboard data={scoreData} />

              <section>
                <div className="flex items-center justify-between mb-4 px-2">
                  <h2 className="text-lg font-semibold text-slate-200">
                    Disciplinas Contabilizadas
                  </h2>
                  <span className="text-xs font-mono text-slate-500 bg-surface/50 px-2 py-1 rounded">
                    {scoreData.filteredDisciplines.length} registros
                  </span>
                </div>
                <DisciplineTable
                  disciplines={scoreData.filteredDisciplines}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
