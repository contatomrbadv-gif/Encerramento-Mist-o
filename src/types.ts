export interface Jogo {
  round: number; // 1, 2, 3, 4
  played: boolean;
  gamesPro: number; // 0 to 5
  gamesContra: number; // 0 to 5
}

export interface Dupla {
  id: string; // e.g., "A-1", "B-10"
  team: 'A' | 'B';
  index: number; // 0 to 9
  player1: string;
  player2: string;
  jogos: Jogo[];
}

export interface EquipeStats {
  nome: string;
  totalVitorias: number;
  totalSaldoGames: number;
  totalGamesFavor: number;
}

export interface TournamentState {
  equipeANome: string;
  equipeBNome: string;
  duplasA: Dupla[];
  duplasB: Dupla[];
  currentTab: 'cadastro' | 'jogos' | 'ranking';
}
