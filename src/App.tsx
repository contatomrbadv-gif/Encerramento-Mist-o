import React from 'react';
import { Dupla, TournamentState } from './types';
import {
  createDefaultDuplas,
  saveTournamentToLocalStorage,
  loadTournamentFromLocalStorage,
  INITIAL_TEAM_A_NAME,
  INITIAL_TEAM_B_NAME,
} from './utils';
import { TeamRegistration } from './components/TeamRegistration';
import { MatchEntry } from './components/MatchEntry';
import { Leaderboard } from './components/Leaderboard';
import {
  Trophy,
  Users,
  CalendarCheck,
  Award,
  RefreshCw,
  Download,
  Upload,
  Info,
  Flame,
} from 'lucide-react';
import { motion } from 'motion/react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const getInitialTournamentId = (): string => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const sala = params.get('sala');
    if (sala) {
      return sala.toLowerCase().replace(/[^a-z0-9-_]/g, '');
    }
  }
  return 'geral';
};

export default function App() {
  const [equipeANome, setEquipeANome] = React.useState<string>(INITIAL_TEAM_A_NAME);
  const [equipeBNome, setEquipeBNome] = React.useState<string>(INITIAL_TEAM_B_NAME);
  const [duplasA, setDuplasA] = React.useState<Dupla[]>([]);
  const [duplasB, setDuplasB] = React.useState<Dupla[]>([]);
  const [currentTab, setCurrentTab] = React.useState<'cadastro' | 'jogos' | 'ranking'>('cadastro');
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [tournamentId, setTournamentId] = React.useState<string>(getInitialTournamentId);
  const [isFirebaseSyncing, setIsFirebaseSyncing] = React.useState(true);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync tournamentId to URL query parameters
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (tournamentId === 'geral') {
        params.delete('sala');
      } else {
        params.set('sala', tournamentId);
      }
      const newQuery = params.toString() ? '?' + params.toString() : '';
      const newRelativePathQuery = window.location.pathname + newQuery;
      window.history.replaceState({}, '', newRelativePathQuery);
    }
  }, [tournamentId]);

  // Synchronize with Firebase
  React.useEffect(() => {
    if (!tournamentId) return;

    setIsFirebaseSyncing(true);
    const docRef = doc(db, 'tournaments', tournamentId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      // If the change has pending writes (local changes), do not overwrite state to avoid cursor jump
      if (docSnap.metadata.hasPendingWrites) {
        setIsFirebaseSyncing(false);
        return;
      }

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.equipeANome !== undefined) setEquipeANome(data.equipeANome);
        if (data.equipeBNome !== undefined) setEquipeBNome(data.equipeBNome);
        if (data.duplasA !== undefined) setDuplasA(data.duplasA);
        if (data.duplasB !== undefined) setDuplasB(data.duplasB);
      } else {
        // Document doesn't exist, migrate from LocalStorage or create defaults
        const saved = loadTournamentFromLocalStorage();
        const initialA = saved?.duplasA || createDefaultDuplas('A');
        const initialB = saved?.duplasB || createDefaultDuplas('B');
        const nameA = saved?.equipeANome || INITIAL_TEAM_A_NAME;
        const nameB = saved?.equipeBNome || INITIAL_TEAM_B_NAME;

        setEquipeANome(nameA);
        setEquipeBNome(nameB);
        setDuplasA(initialA);
        setDuplasB(initialB);

        // Save to firestore
        setDoc(docRef, {
          equipeANome: nameA,
          equipeBNome: nameB,
          duplasA: initialA,
          duplasB: initialB,
        });
      }
      setIsLoaded(true);
      setIsFirebaseSyncing(false);
    }, (error) => {
      console.error("Erro ao sincronizar com o Firebase:", error);
      // Fallback to local storage if offline/error
      const saved = loadTournamentFromLocalStorage();
      if (saved) {
        setEquipeANome(saved.equipeANome || INITIAL_TEAM_A_NAME);
        setEquipeBNome(saved.equipeBNome || INITIAL_TEAM_B_NAME);
        setDuplasA(saved.duplasA || createDefaultDuplas('A'));
        setDuplasB(saved.duplasB || createDefaultDuplas('B'));
      } else {
        setDuplasA(createDefaultDuplas('A'));
        setDuplasB(createDefaultDuplas('B'));
      }
      setIsLoaded(true);
      setIsFirebaseSyncing(false);
    });

    return () => unsubscribe();
  }, [tournamentId]);

  // Save to LocalStorage and Firestore when state changes
  React.useEffect(() => {
    if (!isLoaded || !tournamentId) return;

    // Always save to LocalStorage instantly
    saveTournamentToLocalStorage(equipeANome, equipeBNome, duplasA, duplasB);

    // Debounce saving to Firestore (800ms)
    const timer = setTimeout(async () => {
      try {
        const docRef = doc(db, 'tournaments', tournamentId);
        await setDoc(docRef, {
          equipeANome,
          equipeBNome,
          duplasA,
          duplasB,
        }, { merge: true });
      } catch (error) {
        console.error("Erro ao salvar no Firestore:", error);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [equipeANome, equipeBNome, duplasA, duplasB, tournamentId, isLoaded]);

  // Total tournament progress tracking
  const getTournamentProgress = () => {
    let playedCount = 0;
    const totalCount = 80; // 10 pairs * 4 games * 2 teams

    duplasA.forEach((dupla) => {
      dupla.jogos.forEach((j) => {
        if (j.played) playedCount++;
      });
    });

    duplasB.forEach((dupla) => {
      dupla.jogos.forEach((j) => {
        if (j.played) playedCount++;
      });
    });

    const percent = totalCount > 0 ? Math.round((playedCount / totalCount) * 100) : 0;
    return { played: playedCount, total: totalCount, percent };
  };

  const progress = getTournamentProgress();

  const handleResetTournament = () => {
    if (
      window.confirm(
        'ATENÇÃO: Deseja realmente reiniciar o torneio? Isso irá apagar todos os placares inseridos e nomes de jogadores!'
      )
    ) {
      setEquipeANome(INITIAL_TEAM_A_NAME);
      setEquipeBNome(INITIAL_TEAM_B_NAME);
      setDuplasA(createDefaultDuplas('A'));
      setDuplasB(createDefaultDuplas('B'));
      setCurrentTab('cadastro');
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({
      equipeANome,
      equipeBNome,
      duplasA,
      duplasB,
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `torneio_beach_tennis_${new Date().toISOString().slice(0,10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const parsed = JSON.parse(result);
          if (parsed.duplasA && parsed.duplasB) {
            setEquipeANome(parsed.equipeANome || INITIAL_TEAM_A_NAME);
            setEquipeBNome(parsed.equipeBNome || INITIAL_TEAM_B_NAME);
            setDuplasA(parsed.duplasA);
            setDuplasB(parsed.duplasB);
            alert('Torneio importado com sucesso!');
          } else {
            alert('Formato de arquivo inválido. Dados do torneio não encontrados.');
          }
        }
      } catch (err) {
        alert('Erro ao ler arquivo. Certifique-se de que é um JSON válido.');
      }
    };
    reader.readAsText(file);
  };

  if (!isLoaded) {
    return (
      <div id="loading-spinner" className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
          <span className="text-sm font-semibold text-stone-500">Carregando Torneio...</span>
        </div>
      </div>
    );
  }

  return (
    <div id="app-wrapper" className="min-h-screen bg-natural-bg text-natural-text flex flex-col font-sans antialiased">
      {/* Top Banner Navigation/Header */}
      <header id="main-header" className="bg-natural-header border-b border-natural-border sticky top-0 z-30 shadow-xs px-2 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-20 sm:h-24">
            {/* Brand Logo & Name */}
            <div id="brand-logo-section" className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-natural-green-soft flex items-center justify-center text-white shadow-xs">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h1 id="app-title" className="text-xl sm:text-2xl font-bold tracking-tight text-natural-dark">
                  Torneio Beach Tennis <span className="font-light opacity-60 italic">Equipes</span>
                </h1>
                <p id="app-subtitle" className="text-[10px] sm:text-xs opacity-70 uppercase tracking-widest font-semibold mt-0.5">
                  Gestão de Confronto Direto
                </p>
              </div>
            </div>

            {/* Top Right Quick Actions (Import/Export/Reset) */}
            <div id="quick-actions-bar" className="flex items-center gap-1.5 sm:gap-2">
              <button
                id="btn-quick-export"
                onClick={handleExportData}
                title="Exportar dados do torneio"
                className="p-2 hover:bg-white/50 rounded-xl text-natural-text hover:text-natural-dark transition-colors cursor-pointer border border-transparent hover:border-natural-border/30"
              >
                <Download className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
              <button
                id="btn-quick-import"
                onClick={() => fileInputRef.current?.click()}
                title="Importar torneio salvo"
                className="p-2 hover:bg-white/50 rounded-xl text-natural-text hover:text-natural-dark transition-colors cursor-pointer border border-transparent hover:border-natural-border/30"
              >
                <Upload className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
              <input
                id="hidden-file-input"
                type="file"
                ref={fileInputRef}
                onChange={handleImportData}
                accept=".json"
                className="hidden"
              />
              <div className="w-px h-5 bg-natural-border/60 mx-1"></div>
              <button
                id="btn-quick-reset"
                onClick={handleResetTournament}
                title="Reiniciar torneio inteiro"
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50/50 rounded-xl transition-all border border-rose-200/50 hover:border-rose-300 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reiniciar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main id="main-content-layout" className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Firebase Real-time Sync Banner */}
        <div id="firebase-sync-banner" className="bg-emerald-50/70 border border-emerald-200/60 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="relative flex h-3 w-3 mt-1 sm:mt-0 shrink-0">
              {isFirebaseSyncing ? (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 animate-pulse"></span>
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </>
              )}
            </div>
            <div>
              <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                Sincronização em Nuvem Ativa
                {isFirebaseSyncing && (
                  <span className="text-[10px] font-normal text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Sincronizando...
                  </span>
                )}
              </p>
              <p className="text-emerald-800/80 text-[11px] mt-0.5 leading-relaxed">
                Os dados são salvos no Firestore automaticamente para garantir que você não perca nada. 
                Compartilhe o link com outras pessoas para visualização e edição simultânea em tempo real!
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center bg-white border border-emerald-200/80 px-3 py-2 rounded-2xl shadow-xs shrink-0">
            <span className="font-bold text-emerald-800 text-[10px] uppercase tracking-wider">Código da Sala:</span>
            <input
              type="text"
              value={tournamentId}
              onChange={(e) => {
                const val = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '');
                setTournamentId(val || 'geral');
              }}
              placeholder="geral"
              className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 font-mono font-bold text-stone-700 w-28 text-center focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
              title="Digite um código de sala customizado para separar os torneios"
            />
            <button
              onClick={() => {
                const shareUrl = `${window.location.origin}${window.location.pathname}?sala=${tournamentId}`;
                navigator.clipboard.writeText(shareUrl);
                alert('Link da sala copiado para a área de transferência!');
              }}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-[10px] uppercase tracking-wider cursor-pointer shadow-2xs"
              title="Copiar link de compartilhamento"
            >
              Compartilhar Link
            </button>
          </div>
        </div>

        {/* Tournament Progress Dashboard HUD */}
        <div id="progress-hud-card" className="bg-white rounded-3xl p-5 shadow-xs border border-natural-border flex flex-col md:flex-row gap-5 items-center justify-between">
          <div id="hud-team-pairing" className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-9 h-9 rounded-full bg-natural-accent-a border-2 border-white flex items-center justify-center text-xs font-black text-white shadow-xs">
                A
              </div>
              <div className="w-9 h-9 rounded-full bg-natural-accent-b border-2 border-white flex items-center justify-center text-xs font-black text-white shadow-xs">
                B
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-natural-dark">
                {equipeANome} <span className="text-natural-text/50 font-normal italic">contra</span> {equipeBNome}
              </p>
              <p className="text-[10px] opacity-60 uppercase tracking-widest font-semibold">
                Status do Confronto Geral
              </p>
            </div>
          </div>

          <div id="hud-progress-bar-container" className="flex-grow max-w-md w-full space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-natural-text/60 uppercase tracking-wider">
              <span>Andamento dos Jogos</span>
              <span>{progress.percent}%</span>
            </div>
            <div className="w-full bg-natural-bg rounded-full h-2.5 overflow-hidden border border-natural-border/40">
              <div
                id="hud-progress-bar-fill"
                className="bg-natural-accent-a h-full rounded-full transition-all duration-500"
                style={{ width: `${progress.percent}%` }}
              ></div>
            </div>
          </div>

          <div id="hud-stats-count" className="text-xs text-natural-text font-medium bg-natural-light-bg/50 px-4 py-2 rounded-xl border border-natural-border/30">
            <strong className="text-natural-dark font-bold">{progress.played}</strong> de {progress.total} placares registrados
          </div>
        </div>

        {/* Primary Page-level Tabs Navigation */}
        <div id="page-level-navigation" className="flex border-b border-natural-border gap-2 overflow-x-auto scrollbar-none pb-[1px]">
          <button
            id="nav-tab-cadastro"
            onClick={() => setCurrentTab('cadastro')}
            className={`pb-3.5 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'cadastro'
                ? 'border-natural-accent-b text-natural-dark font-black'
                : 'border-transparent text-natural-text/60 hover:text-natural-dark'
            }`}
          >
            <Users className="w-4 h-4" />
            1. Cadastro de Duplas
          </button>
          <button
            id="nav-tab-jogos"
            onClick={() => setCurrentTab('jogos')}
            className={`pb-3.5 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'jogos'
                ? 'border-natural-accent-b text-natural-dark font-black'
                : 'border-transparent text-natural-text/60 hover:text-natural-dark'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            2. Lançamento de Jogos
          </button>
          <button
            id="nav-tab-ranking"
            onClick={() => setCurrentTab('ranking')}
            className={`pb-3.5 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'ranking'
                ? 'border-natural-accent-b text-natural-dark font-black'
                : 'border-transparent text-natural-text/60 hover:text-natural-dark'
            }`}
          >
            <Trophy className="w-4 h-4" />
            3. Classificação & Resultados
          </button>
        </div>

        {/* Tab View Switcher */}
        <div id="tab-views-renderer" className="min-h-[400px]">
          {currentTab === 'cadastro' && (
            <TeamRegistration
              equipeANome={equipeANome}
              setEquipeANome={setEquipeANome}
              equipeBNome={equipeBNome}
              setEquipeBNome={setEquipeBNome}
              duplasA={duplasA}
              setDuplasA={setDuplasA}
              duplasB={duplasB}
              setDuplasB={setDuplasB}
              onNext={() => setCurrentTab('jogos')}
            />
          )}

          {currentTab === 'jogos' && (
            <MatchEntry
              equipeANome={equipeANome}
              equipeBNome={equipeBNome}
              duplasA={duplasA}
              setDuplasA={setDuplasA}
              duplasB={duplasB}
              setDuplasB={setDuplasB}
              onNext={() => setCurrentTab('ranking')}
            />
          )}

          {currentTab === 'ranking' && (
            <Leaderboard
              equipeANome={equipeANome}
              equipeBNome={equipeBNome}
              duplasA={duplasA}
              duplasB={duplasB}
            />
          )}
        </div>
      </main>

      {/* Humble Footer */}
      <footer id="app-footer" className="bg-[#4A453E] text-white/50 border-t border-natural-border px-8 py-5 flex flex-col sm:flex-row justify-between items-center text-[11px] uppercase tracking-widest gap-4 mt-12">
        <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
          <span>Início: 08:30</span>
          <span>Previsão: 18:00</span>
          <span className="text-white/80">Torneio Beach Tennis</span>
        </div>
        <div className="flex gap-2 items-center">
          <div className={`w-2 h-2 rounded-full ${isFirebaseSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></div>
          <span>{isFirebaseSyncing ? 'Sincronizando...' : 'Sincronizado com o Firebase'}</span>
        </div>
      </footer>
    </div>
  );
}
