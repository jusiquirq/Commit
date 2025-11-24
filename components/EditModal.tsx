import React, { useState } from 'react';
import { BlindLevel } from '../types';
import { generateStructure } from '../services/geminiService';
import { Loader2, Wand2, Plus, Trash2, Save, X } from 'lucide-react';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  blinds: BlindLevel[];
  onSave: (newBlinds: BlindLevel[]) => void;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, blinds: initialBlinds, onSave }) => {
  const [blinds, setBlinds] = useState<BlindLevel[]>(initialBlinds);
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
  
  // AI State
  const [loading, setLoading] = useState(false);
  const [playerCount, setPlayerCount] = useState(6);
  const [duration, setDuration] = useState(2);
  const [chips, setChips] = useState(5000);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const newStructure = await generateStructure(playerCount, duration, chips);
      if (newStructure.length > 0) {
        setBlinds(newStructure);
        setActiveTab('manual'); // Switch to manual to review
      } else {
        setError('Não foi possível gerar a estrutura. Tente novamente.');
      }
    } catch (e) {
      setError('Erro ao conectar com Gemini AI. Verifique a chave de API.');
    } finally {
      setLoading(false);
    }
  };

  const handleBlindChange = (index: number, field: keyof BlindLevel, value: number) => {
    const newBlinds = [...blinds];
    newBlinds[index] = { ...newBlinds[index], [field]: value };
    setBlinds(newBlinds);
  };

  const addLevel = () => {
    const last = blinds[blinds.length - 1];
    setBlinds([...blinds, { 
      smallBlind: last ? last.smallBlind * 2 : 10,
      bigBlind: last ? last.bigBlind * 2 : 20,
      ante: 0,
      durationMinutes: last ? last.durationMinutes : 15 
    }]);
  };

  const removeLevel = (index: number) => {
    setBlinds(blinds.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-poker-surface w-full max-w-2xl max-h-[90vh] rounded-xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-poker-dark">
          <h2 className="text-xl font-bold text-white">Editar Estrutura</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/70">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 gap-2 bg-poker-dark/50">
          <button 
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${activeTab === 'manual' ? 'bg-poker-green text-poker-dark' : 'text-white/60 hover:bg-white/5'}`}
          >
            Manual
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'bg-indigo-500 text-white' : 'text-white/60 hover:bg-white/5'}`}
          >
            <Wand2 size={16} /> Gemini AI
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="bg-indigo-500/10 p-4 rounded-lg border border-indigo-500/30">
                <h3 className="text-indigo-300 font-semibold mb-2">Gerador Inteligente</h3>
                <p className="text-sm text-indigo-200/80 mb-4">
                  Use a inteligência artificial para criar uma estrutura balanceada para o seu Home Game.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase text-white/50 mb-1">Jogadores</label>
                    <input type="number" value={playerCount} onChange={e => setPlayerCount(Number(e.target.value))} className="w-full bg-black/30 border border-white/10 rounded p-3 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-white/50 mb-1">Duração (Horas)</label>
                    <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full bg-black/30 border border-white/10 rounded p-3 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-white/50 mb-1">Chips Iniciais</label>
                    <input type="number" value={chips} onChange={e => setChips(Number(e.target.value))} className="w-full bg-black/30 border border-white/10 rounded p-3 text-white" />
                  </div>
                  
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  
                  <button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-white font-bold flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                    Gerar Estrutura
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="space-y-2">
               {blinds.map((level, index) => (
                 <div key={index} className="flex gap-2 items-center bg-white/5 p-2 rounded border border-white/5">
                    <div className="flex-none w-8 text-center text-white/30 font-mono text-sm">#{index + 1}</div>
                    
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-white/40 block">SB</label>
                        <input 
                          type="number" 
                          value={level.smallBlind} 
                          onChange={(e) => handleBlindChange(index, 'smallBlind', Number(e.target.value))}
                          className="w-full bg-black/20 text-white p-1 rounded text-sm text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/40 block">BB</label>
                        <input 
                          type="number" 
                          value={level.bigBlind} 
                          onChange={(e) => handleBlindChange(index, 'bigBlind', Number(e.target.value))}
                          className="w-full bg-black/20 text-white p-1 rounded text-sm text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/40 block">Min</label>
                        <input 
                          type="number" 
                          value={level.durationMinutes} 
                          onChange={(e) => handleBlindChange(index, 'durationMinutes', Number(e.target.value))}
                          className="w-full bg-black/20 text-white p-1 rounded text-sm text-center"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => removeLevel(index)}
                      className="p-2 text-red-400 hover:bg-red-400/20 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                 </div>
               ))}
               
               <button 
                 onClick={addLevel}
                 className="w-full py-3 border border-dashed border-white/20 text-white/50 hover:text-white hover:border-white/40 rounded flex items-center justify-center gap-2 mt-4"
               >
                 <Plus size={18} /> Adicionar Nível
               </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-poker-dark border-t border-white/10">
          <button 
            onClick={() => {
              onSave(blinds);
              onClose();
            }}
            className="w-full bg-poker-green hover:bg-green-500 text-poker-dark font-bold py-3 rounded-lg text-lg flex items-center justify-center gap-2"
          >
            <Save size={20} /> Salvar Alterações
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditModal;