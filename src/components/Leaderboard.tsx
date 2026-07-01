import React from 'react';
import { Dupla } from '../types';
import { sortDuplas, calculateTeamStats } from '../utils';
import { Medal, Award, Flame, TrendingUp, HelpCircle, AlertCircle, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface LeaderboardProps {
  equipeANome: string;
  equipeBNome: string;
  duplasA: Dupla[];
  duplasB: Dupla[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  equipeANome,
  equipeBNome,
  duplasA,
  duplasB,
}) => {
  const [rankingTab, setRankingTab] = React.useState<'A' | 'B'>('A');

  const statsA = calculateTeamStats(equipeANome || 'Equipe A', duplasA);
  const statsB = calculateTeamStats(equipeBNome || 'Equipe B', duplasB);

  // Sorting
  const sortedA = sortDuplas(duplasA);
  const sortedB = sortDuplas(duplasB);

  // Determine overall confrontation winner
  // Rules for overall winner:
  // 1. Most total victories (vitórias)
  // 2. Most total game balance (saldo)
  // 3. Most total games won (favor)
  let winnerText = "";
  let winnerTeam: 'A' | 'B' | 'TIE' = 'TIE';

  if (statsA.totalVitorias > statsB.totalVitorias) {
    winnerTeam = 'A';
    winnerText = `🎉 ${statsA.nome} está vencendo o confronto com mais vitórias!`;
  } else if (statsB.totalVitorias > statsA.totalVitorias) {
    winnerTeam = 'B';
    winnerText = `🎉 ${statsB.nome} está vencendo o confronto com mais vitórias!`;
  } else {
    // Tied in victories, look at overall game balance
    if (statsA.totalSaldoGames > statsB.totalSaldoGames) {
      winnerTeam = 'A';
      winnerText = `🎉 ${statsA.nome} está na frente pelo critério de Saldo de Games!`;
    } else if (statsB.totalSaldoGames > statsA.totalSaldoGames) {
      winnerTeam = 'B';
      winnerText = `🎉 ${statsB.nome} está na frente pelo critério de Saldo de Games!`;
    } else {
      // Tied in game balance, look at games won
      if (statsA.totalGamesFavor > statsB.totalGamesFavor) {
        winnerTeam = 'A';
        winnerText = `🎉 ${statsA.nome} está na frente pelo critério de Games a Favor!`;
      } else if (statsB.totalGamesFavor > statsA.totalGamesFavor) {
        winnerTeam = 'B';
        winnerText = `🎉 ${statsB.nome} está na frente pelo critério de Games a Favor!`;
      } else {
        winnerTeam = 'TIE';
        winnerText = "⚖️ O confronto está totalmente empatado!";
      }
    }
  }

  const activeSorted = rankingTab === 'A' ? sortedA : sortedB;
  const activeTeamName = rankingTab === 'A' ? statsA.nome : statsB.nome;

  const getDuplaDisplayName = (dupla: Dupla) => {
    const p1 = dupla.player1.trim();
    const p2 = dupla.player2.trim();
    if (!p1 && !p2) {
      return `Dupla ${dupla.index + 1}`;
    }
    return `${p1 || 'Jogador 1'} / ${p2 || 'Jogador 2'}`;
  };

  return (
    <div id="leaderboard-container" className="space-y-6">
      {/* Confrontation Dashboard */}
      <div id="overall-confrontation-card" className="bg-gradient-to-br from-[#4A453E] to-[#2D2A26] text-white rounded-3xl p-6 sm:p-8 shadow-xs border border-natural-border relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-natural-accent-b/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/4 bottom-0 w-24 h-24 bg-natural-accent-a/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="text-center space-y-1 mb-6">
          <span className="text-[10px] uppercase font-bold tracking-widest text-natural-accent-b bg-natural-accent-b/15 px-3 py-1 rounded-full border border-natural-accent-b/30">
            Placar Geral do Confronto
          </span>
          <h2 className="text-xl font-bold tracking-tight text-[#F9F6F0] mt-3">
            Placar Acumulado de Equipes
          </h2>
        </div>

        {/* Head to Head Numbers */}
        <div id="h2h-scores-layout" className="grid grid-cols-3 items-center gap-4 max-w-xl mx-auto">
          {/* Team A stats */}
          <div id="confront-team-a-stats" className="text-center space-y-3">
            <h3 className="text-sm font-extrabold text-natural-accent-a line-clamp-1 bg-white/5 py-1 px-2.5 rounded-lg border border-white/10">
              {statsA.nome}
            </h3>
            <div className="space-y-1">
              <span className="block text-4xl sm:text-5xl font-black font-mono text-[#F9F6F0]">
                {statsA.totalVitorias}
              </span>
              <span className="block text-[10px] text-[#EAE2D5]/70 uppercase font-semibold tracking-wider">
                Vitórias
              </span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 text-xs space-y-1">
              <div className="flex justify-between px-1">
                <span className="text-white/60 font-semibold">Saldo:</span>
                <span className={`font-mono font-bold ${statsA.totalSaldoGames > 0 ? 'text-[#8AA6A3]' : 'text-[#EAE2D5]'}`}>
                  {statsA.totalSaldoGames > 0 ? `+${statsA.totalSaldoGames}` : statsA.totalSaldoGames}
                </span>
              </div>
              <div className="flex justify-between px-1">
                <span className="text-white/60 font-semibold">Pró:</span>
                <span className="font-mono font-bold text-[#EAE2D5]">{statsA.totalGamesFavor}</span>
              </div>
            </div>
          </div>

          {/* VS Divider */}
          <div className="text-center flex flex-col items-center justify-center space-y-2">
            <span className="text-xs font-black text-white/30 tracking-widest">VS</span>
            <div className="w-12 h-px bg-white/20"></div>
            <span className="text-[9px] text-[#EAE2D5]/60 uppercase tracking-widest font-semibold">
              80 Rodadas
            </span>
          </div>

          {/* Team B stats */}
          <div id="confront-team-b-stats" className="text-center space-y-3">
            <h3 className="text-sm font-extrabold text-natural-accent-b line-clamp-1 bg-white/5 py-1 px-2.5 rounded-lg border border-white/10">
              {statsB.nome}
            </h3>
            <div className="space-y-1">
              <span className="block text-4xl sm:text-5xl font-black font-mono text-[#F9F6F0]">
                {statsB.totalVitorias}
              </span>
              <span className="block text-[10px] text-[#EAE2D5]/70 uppercase font-semibold tracking-wider">
                Vitórias
              </span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 text-xs space-y-1">
              <div className="flex justify-between px-1">
                <span className="text-white/60 font-semibold">Saldo:</span>
                <span className={`font-mono font-bold ${statsB.totalSaldoGames > 0 ? 'text-natural-accent-b' : 'text-[#EAE2D5]'}`}>
                  {statsB.totalSaldoGames > 0 ? `+${statsB.totalSaldoGames}` : statsB.totalSaldoGames}
                </span>
              </div>
              <div className="flex justify-between px-1">
                <span className="text-white/60 font-semibold">Pró:</span>
                <span className="font-mono font-bold text-[#EAE2D5]">{statsB.totalGamesFavor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Celebration Winner Banner */}
        <div id="confrontation-winner-banner" className="mt-6 pt-5 border-t border-white/10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/15 shadow-sm">
            <Flame className={`w-4.5 h-4.5 ${winnerTeam === 'A' ? 'text-natural-accent-a animate-pulse' : winnerTeam === 'B' ? 'text-natural-accent-b animate-pulse' : 'text-[#EAE2D5]'}`} />
            <span className="text-xs font-bold text-[#F9F6F0]">{winnerText}</span>
          </div>
        </div>
      </div>

      {/* Rankings Section */}
      <div id="inner-rankings-section" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 id="rankings-title" className="text-base font-bold text-natural-dark flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-natural-accent-a" />
              Classificação Interna de cada Equipe
            </h3>
            <p className="text-xs text-natural-text/70 mt-0.5">
              Critérios de desempate: 1º Vitórias, 2º Saldo de Games, 3º Games a Favor.
            </p>
          </div>

          {/* Team Ranking Toggle */}
          <div id="ranking-team-toggle" className="flex bg-natural-light-bg/60 p-1 rounded-xl border border-natural-border self-start sm:self-center">
            <button
              id="btn-show-rank-a"
              onClick={() => setRankingTab('A')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                rankingTab === 'A'
                  ? 'bg-natural-accent-a text-white shadow-xs'
                  : 'text-natural-text/60 hover:text-natural-dark'
              }`}
            >
              {statsA.nome}
            </button>
            <button
              id="btn-show-rank-b"
              onClick={() => setRankingTab('B')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                rankingTab === 'B'
                  ? 'bg-natural-accent-b text-white shadow-xs'
                  : 'text-natural-text/60 hover:text-natural-dark'
              }`}
            >
              {statsB.nome}
            </button>
          </div>
        </div>

        {/* Ranking List (Mobile Cards & Desktop Table) */}
        <div id="rankings-table-card" className="bg-white rounded-3xl border border-natural-border shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-natural-light-bg/25 border-b border-natural-border flex items-center justify-between">
            <span className="text-xs font-bold text-natural-dark uppercase tracking-wider">
              Tabela de Desempenho - {activeTeamName}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-natural-text/60">
              <Info className="w-4.5 h-4.5 text-natural-text/50" />
              <span>Cálculo em tempo real</span>
            </div>
          </div>

          {/* Table Container */}
          <div id="responsive-table-scroll" className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-natural-border text-[10px] font-bold text-natural-text/60 uppercase bg-natural-light-bg/15">
                  <th className="py-3 px-4 text-center w-12">Pos</th>
                  <th className="py-3 px-4">Dupla / Atletas</th>
                  <th className="py-3 px-3 text-center w-16">Jogos</th>
                  <th className="py-3 px-3 text-center w-16">Vitórias (V)</th>
                  <th className="py-3 px-3 text-center w-16">Derrotas (D)</th>
                  <th className="py-3 px-3 text-center w-20">Saldo Games (SG)</th>
                  <th className="py-3 px-3 text-center w-16">Pró (GP)</th>
                  <th className="py-3 px-3 text-center w-16">Contra (GC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-natural-border text-sm">
                {activeSorted.map((stat, index) => {
                  const isTop3 = index < 3;
                  // Beautiful warm/natural palette medal colors
                  const medalColors = [
                    'bg-[#E6C687] text-[#4A3205] border-[#D6AF62] ring-[#E6C687]/20', // Gold
                    'bg-[#DFDFD9] text-[#42423F] border-[#C2C2B9] ring-[#DFDFD9]/20', // Silver
                    'bg-[#DCB695] text-[#553011] border-[#C89B74] ring-[#DCB695]/20'  // Bronze
                  ];

                  return (
                    <tr
                      key={stat.dupla.id}
                      id={`ranking-row-${stat.dupla.id}`}
                      className="hover:bg-natural-light-bg/15 transition-colors"
                    >
                      {/* Position */}
                      <td className="py-4 px-4 text-center">
                        {isTop3 ? (
                          <span className={`inline-flex items-center justify-center w-6.5 h-6.5 rounded-full text-xs font-black border ring-2 ${medalColors[index]}`}>
                            {index + 1}
                          </span>
                        ) : (
                          <span className="text-natural-text/60 font-bold text-xs">{index + 1}º</span>
                        )}
                      </td>

                      {/* Players */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-natural-dark">
                          {getDuplaDisplayName(stat.dupla)}
                        </div>
                        <div className="text-[10px] text-natural-text/50 font-mono mt-0.5 uppercase tracking-wide">
                          REF: {stat.dupla.id}
                        </div>
                      </td>

                      {/* Jogos Jogados */}
                      <td className="py-4 px-3 text-center font-mono text-natural-text/70">
                        {stat.jogosJogados}/4
                      </td>

                      {/* Vitórias */}
                      <td className="py-4 px-3 text-center font-extrabold text-emerald-700 font-mono">
                        {stat.vitorias}
                      </td>

                      {/* Derrotas */}
                      <td className="py-4 px-3 text-center font-semibold text-rose-700 font-mono">
                        {stat.derrotas}
                      </td>

                      {/* Saldo de Games */}
                      <td className="py-4 px-3 text-center font-black font-mono">
                        <span className={stat.saldoGames > 0 ? 'text-[#5A7D7C]' : stat.saldoGames < 0 ? 'text-rose-700' : 'text-natural-text'}>
                          {stat.saldoGames > 0 ? `+${stat.saldoGames}` : stat.saldoGames}
                        </span>
                      </td>

                      {/* Games Pró */}
                      <td className="py-4 px-3 text-center font-medium font-mono text-natural-dark">
                        {stat.gamesFavor}
                      </td>

                      {/* Games Contra */}
                      <td className="py-4 px-3 text-center font-medium font-mono text-natural-text/50">
                        {stat.gamesContra}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
