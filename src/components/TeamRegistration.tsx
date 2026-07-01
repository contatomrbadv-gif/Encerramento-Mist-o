import React from 'react';
import { Dupla } from '../types';
import { Users, Sparkles, Trash2, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface TeamRegistrationProps {
  equipeANome: string;
  setEquipeANome: (nome: string) => void;
  equipeBNome: string;
  setEquipeBNome: (nome: string) => void;
  duplasA: Dupla[];
  setDuplasA: (duplas: Dupla[]) => void;
  duplasB: Dupla[];
  setDuplasB: (duplas: Dupla[]) => void;
  onNext: () => void;
}

const FIRST_NAMES = [
  'Vini', 'Rafa', 'Marcus', 'Guto', 'Bruno', 'Leo', 'Hugo', 'Daniel', 'Zezão', 'Thales',
  'Carol', 'Bia', 'Joana', 'Paty', 'Sofia', 'Julia', 'Mari', 'Fernanda', 'Cris', 'Gabi',
  'Thiago', 'Matheus', 'Lucas', 'Felipe', 'Pedro', 'André', 'Rodrigo', 'Gustavo', 'Caio', 'Renan',
  'Paula', 'Luana', 'Bruna', 'Aline', 'Camila', 'Renata', 'Amanda', 'Letícia', 'Flávia', 'Vanessa'
];

const LAST_NAMES = [
  'Font', 'Baran', 'Cappelletti', 'Spoto', 'Garavini', 'Giannotti', 'Cariani', 'Chow', 'Ramos', 'Gomes',
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Pinto', 'Carvalho', 'Rocha', 'Mendes', 'Nunes', 'Costa'
];

export const TeamRegistration: React.FC<TeamRegistrationProps> = ({
  equipeANome,
  setEquipeANome,
  equipeBNome,
  setEquipeBNome,
  duplasA,
  setDuplasA,
  duplasB,
  setDuplasB,
  onNext,
}) => {
  const [activeTeamTab, setActiveTeamTab] = React.useState<'A' | 'B'>('A');

  const handlePlayerChange = (
    team: 'A' | 'B',
    index: number,
    playerNum: 1 | 2,
    value: string
  ) => {
    if (team === 'A') {
      const updated = [...duplasA];
      if (playerNum === 1) updated[index].player1 = value;
      else updated[index].player2 = value;
      setDuplasA(updated);
    } else {
      const updated = [...duplasB];
      if (playerNum === 1) updated[index].player1 = value;
      else updated[index].player2 = value;
      setDuplasB(updated);
    }
  };

  const fillMockData = () => {
    const getRandomName = () => {
      const f = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const l = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      return `${f} ${l}`;
    };

    const newA = duplasA.map((dupla, i) => ({
      ...dupla,
      player1: getRandomName(),
      player2: getRandomName(),
    }));

    const newB = duplasB.map((dupla, i) => ({
      ...dupla,
      player1: getRandomName(),
      player2: getRandomName(),
    }));

    setDuplasA(newA);
    setDuplasB(newB);
  };

  const clearAllNames = () => {
    if (window.confirm('Deseja realmente apagar todos os nomes de jogadores cadastrados?')) {
      const newA = duplasA.map((dupla) => ({
        ...dupla,
        player1: '',
        player2: '',
      }));
      const newB = duplasB.map((dupla) => ({
        ...dupla,
        player1: '',
        player2: '',
      }));
      setDuplasA(newA);
      setDuplasB(newB);
    }
  };

  const activeDuplas = activeTeamTab === 'A' ? duplasA : duplasB;
  const activeTeamName = activeTeamTab === 'A' ? equipeANome : equipeBNome;
  const setActiveTeamName = activeTeamTab === 'A' ? setEquipeANome : setEquipeBNome;

  return (
    <div id="team-registration-container" className="space-y-6">
      {/* Header Cards */}
      <div id="registration-action-card" className="bg-white rounded-3xl p-6 shadow-xs border border-natural-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 id="register-title" className="text-xl font-bold text-natural-dark tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-natural-accent-b" />
            Cadastro de Equipes & Duplas
          </h2>
          <p id="register-subtitle" className="text-sm text-natural-text/70 mt-1">
            Defina o nome das duas equipes rivais e preencha os atletas de cada uma das 10 duplas.
          </p>
        </div>
        <div id="action-buttons-group" className="flex items-center gap-2 self-start md:self-center">
          <button
            id="btn-mock-data"
            onClick={fillMockData}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-natural-accent-b bg-natural-accent-b/10 hover:bg-natural-accent-b/20 rounded-xl transition-all border border-natural-accent-b/20 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Nomes de Teste aleatórios
          </button>
          <button
            id="btn-clear-names"
            onClick={clearAllNames}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100/60 rounded-xl transition-all border border-rose-200/40 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpar Tudo
          </button>
        </div>
      </div>

      {/* Team Tabs Selector */}
      <div id="team-selector-tabs" className="grid grid-cols-2 bg-natural-light-bg/60 p-1.5 rounded-2xl border border-natural-border max-w-md mx-auto">
        <button
          id="tab-select-team-a"
          onClick={() => setActiveTeamTab('A')}
          className={`py-3 px-4 text-sm font-bold rounded-xl transition-all cursor-pointer ${
            activeTeamTab === 'A'
              ? 'bg-natural-accent-a text-white shadow-xs'
              : 'text-natural-text/60 hover:text-natural-dark'
          }`}
        >
          {equipeANome || 'Equipe A'}
        </button>
        <button
          id="tab-select-team-b"
          onClick={() => setActiveTeamTab('B')}
          className={`py-3 px-4 text-sm font-bold rounded-xl transition-all cursor-pointer ${
            activeTeamTab === 'B'
              ? 'bg-natural-accent-b text-white shadow-xs'
              : 'text-natural-text/60 hover:text-natural-dark'
          }`}
        >
          {equipeBNome || 'Equipe B'}
        </button>
      </div>

      {/* Editing active team details */}
      <motion.div
        key={activeTeamTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl shadow-xs border border-natural-border overflow-hidden"
        id="active-team-card"
      >
        <div id="team-card-header" className="p-6 border-b border-natural-border bg-natural-light-bg/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:max-w-xs">
            <label id="lbl-team-name-input" className="block text-xs font-bold text-natural-text/60 uppercase tracking-widest mb-1.5">
              Nome da Equipe {activeTeamTab}
            </label>
            <input
              id="input-team-name"
              type="text"
              value={activeTeamName}
              onChange={(e) => setActiveTeamName(e.target.value)}
              placeholder={`Ex: Equipe ${activeTeamTab}`}
              className="w-full bg-natural-bg border border-natural-border rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-natural-accent-b focus:border-natural-accent-b text-natural-dark"
            />
          </div>
          <div id="team-meta-info" className="text-right text-xs text-natural-text/60 italic">
            Insira os nomes ou use o preenchimento automático para simular.
          </div>
        </div>

        <div id="duplas-inputs-grid" className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {activeDuplas.map((dupla, i) => (
            <div
              key={dupla.id}
              id={`card-dupla-${dupla.id}`}
              className={`p-4 rounded-2xl border bg-natural-bg/10 hover:bg-white transition-all flex flex-col gap-3 ${
                activeTeamTab === 'A'
                  ? 'border-natural-border/60 hover:border-natural-accent-a/60'
                  : 'border-natural-border/60 hover:border-natural-accent-b/60'
              }`}
            >
              <div id={`dupla-card-header-${dupla.id}`} className="flex items-center justify-between">
                <span id={`dupla-badge-${dupla.id}`} className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  activeTeamTab === 'A'
                    ? 'text-natural-accent-a bg-natural-accent-a/10 border-natural-accent-a/20'
                    : 'text-natural-accent-b bg-natural-accent-b/10 border-natural-accent-b/20'
                }`}>
                  Dupla {i + 1}
                </span>
                <span id={`dupla-id-badge-${dupla.id}`} className="text-[10px] font-mono text-natural-text/50">
                  REF: {dupla.id}
                </span>
              </div>

              <div id={`dupla-fields-container-${dupla.id}`} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label id={`lbl-player1-${dupla.id}`} className="block text-[10px] font-bold text-natural-text/60 mb-1 uppercase tracking-wide">
                    Atleta 1
                  </label>
                  <input
                    id={`input-player1-${dupla.id}`}
                    type="text"
                    value={dupla.player1}
                    onChange={(e) => handlePlayerChange(activeTeamTab, i, 1, e.target.value)}
                    placeholder={`Atleta ${i * 2 + 1}`}
                    className="w-full bg-white border border-natural-border/70 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-natural-accent-b text-natural-dark"
                  />
                </div>
                <div>
                  <label id={`lbl-player2-${dupla.id}`} className="block text-[10px] font-bold text-natural-text/60 mb-1 uppercase tracking-wide">
                    Atleta 2
                  </label>
                  <input
                    id={`input-player2-${dupla.id}`}
                    type="text"
                    value={dupla.player2}
                    onChange={(e) => handlePlayerChange(activeTeamTab, i, 2, e.target.value)}
                    placeholder={`Atleta ${i * 2 + 2}`}
                    className="w-full bg-white border border-natural-border/70 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-natural-accent-b text-natural-dark"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Call to Action */}
      <div id="registration-footer-action" className="flex justify-center pt-2">
        <button
          id="btn-go-to-games"
          onClick={onNext}
          className="bg-natural-dark hover:bg-black text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Ir para Lançamento de Jogos</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};
