import React from 'react';
import { Dupla, Jogo } from '../types';
import { calculateDuplaStats } from '../utils';
import { Trophy, HelpCircle, CheckCircle2, Circle, RotateCcw, Award } from 'lucide-react';
import { motion } from 'motion/react';

interface MatchEntryProps {
  equipeANome: string;
  equipeBNome: string;
  duplasA: Dupla[];
  setDuplasA: (duplas: Dupla[]) => void;
  duplasB: Dupla[];
  setDuplasB: (duplas: Dupla[]) => void;
  onNext: () => void;
}

export const MatchEntry: React.FC<MatchEntryProps> = ({
  equipeANome,
  equipeBNome,
  duplasA,
  setDuplasA,
  duplasB,
  setDuplasB,
  onNext,
}) => {
  const [activeTeam, setActiveTeam] = React.useState<'A' | 'B'>('A');
  const [expandedDuplaId, setExpandedDuplaId] = React.useState<string | null>('A-1');

  const activeDuplas = activeTeam === 'A' ? duplasA : duplasB;
  const setDuplas = activeTeam === 'A' ? setDuplasA : setDuplasB;

  const handleScoreChange = (
    duplaId: string,
    roundNum: number,
    field: 'gamesPro' | 'gamesContra',
    value: number
  ) => {
    // Clamp values between 0 and 5 as games are maximum 5
    const clampedValue = Math.max(0, Math.min(5, value));

    const updated = activeDuplas.map((dupla) => {
      if (dupla.id === duplaId) {
        const updatedJogos = dupla.jogos.map((jogo) => {
          if (jogo.round === roundNum) {
            return {
              ...jogo,
              [field]: clampedValue,
              played: true, // Auto-mark as played when a score is set
            };
          }
          return jogo;
        });
        return { ...dupla, jogos: updatedJogos };
      }
      return dupla;
    });

    setDuplas(updated);
  };

  const togglePlayed = (duplaId: string, roundNum: number) => {
    const updated = activeDuplas.map((dupla) => {
      if (dupla.id === duplaId) {
        const updatedJogos = dupla.jogos.map((jogo) => {
          if (jogo.round === roundNum) {
            return {
              ...jogo,
              played: !jogo.played,
            };
          }
          return jogo;
        });
        return { ...dupla, jogos: updatedJogos };
      }
      return dupla;
    });
    setDuplas(updated);
  };

  const resetRound = (duplaId: string, roundNum: number) => {
    const updated = activeDuplas.map((dupla) => {
      if (dupla.id === duplaId) {
        const updatedJogos = dupla.jogos.map((jogo) => {
          if (jogo.round === roundNum) {
            return {
              ...jogo,
              played: false,
              gamesPro: 0,
              gamesContra: 0,
            };
          }
          return jogo;
        });
        return { ...dupla, jogos: updatedJogos };
      }
      return dupla;
    });
    setDuplas(updated);
  };

  const getDuplaDisplayName = (dupla: Dupla, idx: number) => {
    const p1 = dupla.player1.trim();
    const p2 = dupla.player2.trim();
    if (!p1 && !p2) {
      return `Dupla ${idx + 1}`;
    }
    return `${p1 || 'Jogador 1'} / ${p2 || 'Jogador 2'}`;
  };

  return (
    <div id="match-entry-container" className="space-y-6">
      {/* Header Cards */}
      <div id="match-entry-info-card" className="bg-white rounded-3xl p-6 shadow-xs border border-natural-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 id="match-title" className="text-xl font-bold text-natural-dark tracking-tight flex items-center gap-2">
            <Trophy className={`w-5 h-5 ${activeTeam === 'A' ? 'text-natural-accent-a' : 'text-natural-accent-b'}`} />
            Lançamento de Placares por Rodada
          </h2>
          <p id="match-subtitle" className="text-sm text-natural-text/70 mt-1">
            Lance os resultados das 4 rodadas para cada dupla. Os placares acumulam diretamente no saldo de cada equipe.
          </p>
        </div>
        <div id="games-rules-badge" className="flex items-center gap-2 bg-natural-dark text-[#F9F6F0] text-xs font-semibold px-4 py-2 rounded-xl">
          <Award className="w-4 h-4 text-natural-accent-b animate-pulse" />
          <span>Até 5 Games Máx por Rodada</span>
        </div>
      </div>

      {/* Team Tabs Selector */}
      <div id="match-team-selector-tabs" className="grid grid-cols-2 bg-natural-light-bg/60 p-1.5 rounded-2xl border border-natural-border max-w-md mx-auto">
        <button
          id="btn-select-team-a-games"
          onClick={() => {
            setActiveTeam('A');
            setExpandedDuplaId(`A-1`);
          }}
          className={`py-3 px-4 text-sm font-bold rounded-xl transition-all cursor-pointer ${
            activeTeam === 'A'
              ? 'bg-natural-accent-a text-white shadow-xs'
              : 'text-natural-text/60 hover:text-natural-dark'
          }`}
        >
          {equipeANome || 'Equipe A'}
        </button>
        <button
          id="btn-select-team-b-games"
          onClick={() => {
            setActiveTeam('B');
            setExpandedDuplaId(`B-1`);
          }}
          className={`py-3 px-4 text-sm font-bold rounded-xl transition-all cursor-pointer ${
            activeTeam === 'B'
              ? 'bg-natural-accent-b text-white shadow-xs'
              : 'text-natural-text/60 hover:text-natural-dark'
          }`}
        >
          {equipeBNome || 'Equipe B'}
        </button>
      </div>

      {/* Accordion / List of Duplas */}
      <div id="duplas-scores-list" className="space-y-3">
        {activeDuplas.map((dupla, idx) => {
          const stats = calculateDuplaStats(dupla);
          const isExpanded = expandedDuplaId === dupla.id;
          const duplaName = getDuplaDisplayName(dupla, idx);

          return (
            <div
              key={dupla.id}
              id={`score-card-dupla-${dupla.id}`}
              className={`bg-white rounded-2xl shadow-xs border transition-all overflow-hidden ${
                isExpanded
                  ? activeTeam === 'A'
                    ? 'border-natural-accent-a ring-3 ring-natural-accent-a/10'
                    : 'border-natural-accent-b ring-3 ring-natural-accent-b/10'
                  : 'border-natural-border/60 hover:border-natural-border'
              }`}
            >
              {/* Accordion Trigger Header */}
              <button
                id={`accordion-btn-dupla-${dupla.id}`}
                onClick={() => setExpandedDuplaId(isExpanded ? null : dupla.id)}
                className="w-full text-left px-5 py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-natural-light-bg/10 hover:bg-natural-light-bg/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span id={`score-dupla-badge-${dupla.id}`} className={`flex-shrink-0 text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center text-white ${
                    activeTeam === 'A' ? 'bg-natural-accent-a' : 'bg-natural-accent-b'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <h3 id={`score-dupla-name-${dupla.id}`} className="text-sm font-bold text-natural-dark leading-tight">
                      {duplaName}
                    </h3>
                    <p id={`score-dupla-subtext-${dupla.id}`} className="text-xs text-natural-text/60 mt-0.5 font-medium">
                      {stats.jogosJogados === 4
                        ? 'Todos os 4 confrontos cadastrados'
                        : `${stats.jogosJogados} de 4 confrontos preenchidos`}
                    </p>
                  </div>
                </div>

                {/* Dupla Stats Summary */}
                <div id={`score-dupla-stats-summary-${dupla.id}`} className="flex items-center gap-4 text-xs font-semibold text-natural-text bg-natural-light-bg/50 px-3.5 py-2 rounded-xl border border-natural-border/40">
                  <div className="flex items-center gap-1.5">
                    <span className="text-natural-text/60 text-[10px] uppercase tracking-wider font-bold">Vitórias:</span>
                    <span className="font-extrabold text-emerald-700">{stats.vitorias}</span>
                  </div>
                  <div className="h-3 w-px bg-natural-border"></div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-natural-text/60 text-[10px] uppercase tracking-wider font-bold">Saldo:</span>
                    <span className={`font-extrabold ${stats.saldoGames > 0 ? 'text-emerald-700' : stats.saldoGames < 0 ? 'text-rose-700' : 'text-natural-text'}`}>
                      {stats.saldoGames > 0 ? `+${stats.saldoGames}` : stats.saldoGames}
                    </span>
                  </div>
                  <div className="h-3 w-px bg-natural-border"></div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-natural-text/60 text-[10px] uppercase tracking-wider font-bold">Pró:</span>
                    <span className="font-extrabold text-natural-dark">{stats.gamesFavor}</span>
                  </div>
                </div>
              </button>

              {/* Expansion Score Inputs */}
              {isExpanded && (
                <motion.div
                  id={`expansion-container-${dupla.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-natural-border bg-natural-light-bg/15 p-6"
                >
                  <div id={`rounds-container-${dupla.id}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {dupla.jogos.map((jogo) => {
                      const isWin = jogo.played && jogo.gamesPro > jogo.gamesContra;
                      const isLoss = jogo.played && jogo.gamesContra > jogo.gamesPro;

                      return (
                        <div
                          key={jogo.round}
                          id={`round-card-${dupla.id}-${jogo.round}`}
                          className={`p-4 rounded-2xl border bg-white flex flex-col justify-between gap-4 shadow-xs transition-all ${
                            jogo.played
                              ? isWin
                                ? 'border-emerald-300 bg-emerald-50/20'
                                : isLoss
                                ? 'border-rose-300 bg-rose-50/20'
                                : 'border-natural-border bg-natural-bg/30'
                              : 'border-natural-border bg-white hover:border-natural-text/30'
                          }`}
                        >
                          {/* Round Header */}
                          <div id={`round-card-header-${dupla.id}-${jogo.round}`} className="flex items-center justify-between">
                            <span id={`round-title-${dupla.id}-${jogo.round}`} className="text-[10px] font-bold text-natural-text/60 uppercase tracking-widest">
                              Rodada {jogo.round}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {jogo.played ? (
                                <button
                                  id={`btn-toggle-played-${dupla.id}-${jogo.round}`}
                                  onClick={() => togglePlayed(dupla.id, jogo.round)}
                                  className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center gap-1 cursor-pointer"
                                  title="Clique para marcar como pendente"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  Confirmado
                                </button>
                              ) : (
                                <button
                                  id={`btn-toggle-not-played-${dupla.id}-${jogo.round}`}
                                  onClick={() => togglePlayed(dupla.id, jogo.round)}
                                  className="text-[10px] text-natural-text/60 hover:text-natural-dark bg-natural-light-bg hover:bg-natural-border/40 px-2 py-0.5 rounded-full font-bold border border-natural-border flex items-center gap-1 cursor-pointer"
                                >
                                  <Circle className="w-3 h-3" />
                                  Pendente
                                </button>
                              )}
                              {jogo.played && (
                                <button
                                  id={`btn-reset-round-${dupla.id}-${jogo.round}`}
                                  onClick={() => resetRound(dupla.id, jogo.round)}
                                  className="p-1 text-natural-text/40 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Limpar rodada"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Scores Input Area */}
                          <div id={`scores-input-grid-${dupla.id}-${jogo.round}`} className="grid grid-cols-2 gap-3 py-1">
                            {/* Pro Games (Dupla's Score) */}
                            <div id={`pro-score-block-${dupla.id}-${jogo.round}`} className="text-center bg-natural-bg/40 p-2.5 rounded-xl border border-natural-border/30">
                              <span id={`pro-score-label-${dupla.id}-${jogo.round}`} className="block text-[10px] font-bold text-natural-text/50 uppercase tracking-wider mb-1.5">
                                Meus Games
                              </span>
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  id={`btn-minus-pro-${dupla.id}-${jogo.round}`}
                                  onClick={() => handleScoreChange(dupla.id, jogo.round, 'gamesPro', jogo.gamesPro - 1)}
                                  className="w-7 h-7 rounded-lg bg-white hover:bg-natural-light-bg text-natural-dark font-black border border-natural-border flex items-center justify-center text-sm active:scale-95 transition-all cursor-pointer shadow-2xs"
                                >
                                  -
                                </button>
                                <span id={`pro-score-display-${dupla.id}-${jogo.round}`} className="text-xl font-bold font-mono text-natural-dark w-6">
                                  {jogo.gamesPro}
                                </span>
                                <button
                                  id={`btn-plus-pro-${dupla.id}-${jogo.round}`}
                                  onClick={() => handleScoreChange(dupla.id, jogo.round, 'gamesPro', jogo.gamesPro + 1)}
                                  className="w-7 h-7 rounded-lg bg-white hover:bg-natural-light-bg text-natural-dark font-black border border-natural-border flex items-center justify-center text-sm active:scale-95 transition-all cursor-pointer shadow-2xs"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Contra Games (Opponent's Score) */}
                            <div id={`contra-score-block-${dupla.id}-${jogo.round}`} className="text-center bg-natural-bg/40 p-2.5 rounded-xl border border-natural-border/30">
                              <span id={`contra-score-label-${dupla.id}-${jogo.round}`} className="block text-[10px] font-bold text-natural-text/50 uppercase tracking-wider mb-1.5">
                                Adversário
                              </span>
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  id={`btn-minus-contra-${dupla.id}-${jogo.round}`}
                                  onClick={() => handleScoreChange(dupla.id, jogo.round, 'gamesContra', jogo.gamesContra - 1)}
                                  className="w-7 h-7 rounded-lg bg-white hover:bg-natural-light-bg text-natural-dark font-black border border-natural-border flex items-center justify-center text-sm active:scale-95 transition-all cursor-pointer shadow-2xs"
                                >
                                  -
                                </button>
                                <span id={`contra-score-display-${dupla.id}-${jogo.round}`} className="text-xl font-bold font-mono text-natural-dark w-6">
                                  {jogo.gamesContra}
                                </span>
                                <button
                                  id={`btn-plus-contra-${dupla.id}-${jogo.round}`}
                                  onClick={() => handleScoreChange(dupla.id, jogo.round, 'gamesContra', jogo.gamesContra + 1)}
                                  className="w-7 h-7 rounded-lg bg-white hover:bg-natural-light-bg text-natural-dark font-black border border-natural-border flex items-center justify-center text-sm active:scale-95 transition-all cursor-pointer shadow-2xs"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Outcome Label */}
                          <div id={`round-outcome-${dupla.id}-${jogo.round}`} className="text-center">
                            {jogo.played ? (
                              isWin ? (
                                <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg uppercase tracking-wider border border-emerald-200">
                                  Vitória ({jogo.gamesPro} x {jogo.gamesContra})
                                </span>
                              ) : isLoss ? (
                                <span className="inline-block text-[10px] font-bold text-rose-800 bg-rose-100 px-3 py-1 rounded-lg uppercase tracking-wider border border-rose-200">
                                  Derrota ({jogo.gamesPro} x {jogo.gamesContra})
                                </span>
                              ) : (
                                <span className="inline-block text-[10px] font-bold text-natural-text/80 bg-natural-light-bg px-3 py-1 rounded-lg uppercase tracking-wider border border-natural-border">
                                  Empate ({jogo.gamesPro} x {jogo.gamesContra})
                                </span>
                              )
                            ) : (
                              <span className="inline-block text-[10px] font-semibold text-natural-text/50 italic bg-natural-light-bg/30 px-2.5 py-0.5 rounded-lg">
                                Sem placar lançado
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Navigation Buttons */}
      <div id="match-footer-actions" className="flex justify-center pt-2">
        <button
          id="btn-go-to-ranking"
          onClick={onNext}
          className="bg-natural-dark hover:bg-black text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Ver Classificação & Rankings</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
