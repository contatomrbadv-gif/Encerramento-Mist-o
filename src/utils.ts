import { Dupla, Jogo, EquipeStats } from './types';

export const INITIAL_TEAM_A_NAME = "Equipe A";
export const INITIAL_TEAM_B_NAME = "Equipe B";

export function createDefaultDuplas(team: 'A' | 'B'): Dupla[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `${team}-${i + 1}`,
    team,
    index: i,
    player1: `Jogador ${team}${i * 2 + 1}`,
    player2: `Jogador ${team}${i * 2 + 2}`,
    jogos: Array.from({ length: 4 }, (_, r) => ({
      round: r + 1,
      played: false,
      gamesPro: 0,
      gamesContra: 0,
    })),
  }));
}

export interface DuplaStats {
  dupla: Dupla;
  vitorias: number;
  derrotas: number;
  saldoGames: number;
  gamesFavor: number;
  gamesContra: number;
  jogosJogados: number;
}

export function calculateDuplaStats(dupla: Dupla): DuplaStats {
  let vitorias = 0;
  let derrotas = 0;
  let saldoGames = 0;
  let gamesFavor = 0;
  let gamesContra = 0;
  let jogosJogados = 0;

  dupla.jogos.forEach((jogo) => {
    if (jogo.played) {
      jogosJogados++;
      gamesFavor += jogo.gamesPro;
      gamesContra += jogo.gamesContra;
      if (jogo.gamesPro > jogo.gamesContra) {
        vitorias++;
      } else if (jogo.gamesContra > jogo.gamesPro) {
        derrotas++;
      }
    }
  });

  saldoGames = gamesFavor - gamesContra;

  return {
    dupla,
    vitorias,
    derrotas,
    saldoGames,
    gamesFavor,
    gamesContra,
    jogosJogados,
  };
}

export function sortDuplas(duplas: Dupla[]): DuplaStats[] {
  const statsList = duplas.map(calculateDuplaStats);
  
  return statsList.sort((a, b) => {
    // 1. Número de vitórias (Vitórias)
    if (b.vitorias !== a.vitorias) {
      return b.vitorias - a.vitorias;
    }
    // 2. Saldo de games
    if (b.saldoGames !== a.saldoGames) {
      return b.saldoGames - a.saldoGames;
    }
    // 3. Games a favor
    if (b.gamesFavor !== a.gamesFavor) {
      return b.gamesFavor - a.gamesFavor;
    }
    // Default to index order if completely tied
    return a.dupla.index - b.dupla.index;
  });
}

export function calculateTeamStats(nome: string, duplas: Dupla[]): EquipeStats {
  let totalVitorias = 0;
  let totalGamesFavor = 0;
  let totalGamesContra = 0;

  duplas.forEach((dupla) => {
    dupla.jogos.forEach((jogo) => {
      if (jogo.played) {
        totalGamesFavor += jogo.gamesPro;
        totalGamesContra += jogo.gamesContra;
        if (jogo.gamesPro > jogo.gamesContra) {
          totalVitorias++;
        }
      }
    });
  });

  return {
    nome,
    totalVitorias,
    totalSaldoGames: totalGamesFavor - totalGamesContra,
    totalGamesFavor,
  };
}

export function saveTournamentToLocalStorage(
  nameA: string,
  nameB: string,
  duplasA: Dupla[],
  duplasB: Dupla[]
) {
  try {
    const data = {
      equipeANome: nameA,
      equipeBNome: nameB,
      duplasA,
      duplasB,
    };
    localStorage.setItem('beach_tennis_tournament_v1', JSON.stringify(data));
  } catch (error) {
    console.error("Erro ao salvar no localStorage:", error);
  }
}

export function loadTournamentFromLocalStorage(): {
  equipeANome: string;
  equipeBNome: string;
  duplasA: Dupla[];
  duplasB: Dupla[];
} | null {
  try {
    const dataStr = localStorage.getItem('beach_tennis_tournament_v1');
    if (dataStr) {
      return JSON.parse(dataStr);
    }
  } catch (error) {
    console.error("Erro ao carregar do localStorage:", error);
  }
  return null;
}
