import { Player, Team } from '@/types';

export type NegotiationPhase = 'INIT' | 'CLUB_FEE' | 'AGENT_WAGE' | 'DONE' | 'FAILED';

export interface NegotiationState {
  phase: NegotiationPhase;
  patience: number; // 0-100, if 0 deal is off
  targetPlayer: Player;
  buyerTeam: Team;
  sellerTeam: Team;
  
  // Demands
  requiredFee: number;
  requiredWage: number;
  
  // Current Offers
  offeredFee: number;
  offeredWage: number;
  swapPlayer?: Player;
  isLoan: boolean;

  // History for UI
  lastMessage: string;
  speaker: string; // 'Direktur', 'Agen', 'Anda'
}

export interface DialogueOption {
  id: string;
  text: string;
  actionType: 'MEET_DEMAND' | 'LOWER_FEE' | 'SWAP_PLAYER' | 'LOWER_WAGE' | 'LOAN_OFFER' | 'WALK_AWAY';
  value?: number; // the numeric value of the counter offer
}

// Inisialisasi Nego
export const startNegotiation = (buyer: Team, seller: Team, player: Player): NegotiationState => {
  const isRival = buyer.leagueId === seller.leagueId;
  const isStar = player.overall >= 85;
  
  let fee = player.value;
  if (isRival) fee *= 1.5;
  if (isStar) fee *= 1.2;

  return {
    phase: 'INIT',
    patience: 100,
    targetPlayer: player,
    buyerTeam: buyer,
    sellerTeam: seller,
    requiredFee: fee,
    requiredWage: player.wage * 1.15, // Agent wants 15% raise
    offeredFee: 0,
    offeredWage: 0,
    isLoan: false,
    lastMessage: `Selamat datang. Kami dengar Anda tertarik pada ${player.name}. Apa rencana Anda?`,
    speaker: `Direktur ${seller.name}`
  };
};

// Dapatkan opsi percakapan berdasarkan state
export const getDialogueOptions = (state: NegotiationState, mySquad: Player[]): DialogueOption[] => {
  if (state.phase === 'INIT' || state.phase === 'CLUB_FEE') {
    const opts: DialogueOption[] = [
      { id: '1', text: `Kami akan bayar sesuai harga pasaran (€${(state.requiredFee/1000000).toFixed(1)}M).`, actionType: 'MEET_DEMAND', value: state.requiredFee },
      { id: '2', text: `Terlalu mahal. Bagaimana jika €${(state.requiredFee * 0.8 / 1000000).toFixed(1)}M?`, actionType: 'LOWER_FEE', value: state.requiredFee * 0.8 },
      { id: '3', text: `Kami ingin menyertakan pertukaran pemain.`, actionType: 'SWAP_PLAYER' }
    ];
    if (state.phase === 'INIT') {
      opts.push({ id: '4', text: `Kami hanya ingin meminjamnya selama semusim.`, actionType: 'LOAN_OFFER' });
    }
    opts.push({ id: '5', text: `Harga yang tidak masuk akal. Kami mundur.`, actionType: 'WALK_AWAY' });
    return opts;
  }

  if (state.phase === 'AGENT_WAGE') {
    return [
      { id: '1', text: `Tentu, €${state.requiredWage}/w adalah gaji yang pantas.`, actionType: 'MEET_DEMAND', value: state.requiredWage },
      { id: '2', text: `Bisa turun sedikit ke €${(state.requiredWage * 0.9).toFixed(0)}/w?`, actionType: 'LOWER_WAGE', value: state.requiredWage * 0.9 },
      { id: '3', text: `Gajinya terlalu tinggi. Kesepakatan batal.`, actionType: 'WALK_AWAY' }
    ];
  }

  return [];
};

export const processDialogue = (state: NegotiationState, option: DialogueOption, swapPlayer?: Player): NegotiationState => {
  const newState = { ...state };
  
  if (option.actionType === 'WALK_AWAY') {
    newState.phase = 'FAILED';
    newState.speaker = state.phase === 'AGENT_WAGE' ? `Agen ${state.targetPlayer.name}` : `Direktur ${state.sellerTeam.name}`;
    newState.lastMessage = "Baiklah, jika itu keputusan Anda. Pintu keluar ada di sebelah sana.";
    return newState;
  }

  if (option.actionType === 'LOAN_OFFER') {
    if (state.targetPlayer.overall >= 85) {
      newState.patience -= 30;
      newState.lastMessage = "Anda gila? Kami tidak meminjamkan pemain kunci kami!";
      if (newState.patience <= 0) newState.phase = 'FAILED';
    } else {
      newState.isLoan = true;
      newState.phase = 'AGENT_WAGE';
      newState.speaker = `Agen ${state.targetPlayer.name}`;
      newState.lastMessage = `Klub setuju meminjamkan klien saya. Tapi Anda harus menanggung gajinya secara penuh (€${state.requiredWage}/w).`;
    }
    return newState;
  }

  if (state.phase === 'INIT' || state.phase === 'CLUB_FEE') {
    let offerValue = option.value || 0;
    
    if (option.actionType === 'SWAP_PLAYER' && swapPlayer) {
      offerValue = swapPlayer.value * 0.8; // Swap player valued at 80%
      newState.swapPlayer = swapPlayer;
      
      if (offerValue >= state.requiredFee * 0.7) {
         newState.phase = 'AGENT_WAGE';
         newState.offeredFee = 0; // It's a pure swap or mostly swap
         newState.speaker = `Agen ${state.targetPlayer.name}`;
         newState.lastMessage = `Klub menerima pertukaran pemain. Sekarang mari bicarakan gaji klien saya. Kami minta €${state.requiredWage}/w.`;
         return newState;
      } else {
         newState.patience -= 25;
         newState.lastMessage = `Pemain yang Anda tawarkan (${swapPlayer.name}) tidak sepadan. Tambahkan uang cash atau kami batalkan.`;
      }
    }

    if (option.actionType === 'MEET_DEMAND' || option.actionType === 'LOWER_FEE') {
       if (offerValue >= state.requiredFee * 0.95) {
         newState.offeredFee = offerValue;
         newState.phase = 'AGENT_WAGE';
         newState.speaker = `Agen ${state.targetPlayer.name}`;
         newState.lastMessage = `Klub setuju dengan harga transfer. Sekarang giliran saya. Klien saya menginginkan gaji €${state.requiredWage}/w.`;
       } else {
         newState.patience -= 30;
         newState.lastMessage = `Tawaran €${(offerValue/1000000).toFixed(1)}M masih di bawah valuasi kami. Naikkan tawaran Anda!`;
       }
    }

    if (newState.patience <= 0) {
      newState.phase = 'FAILED';
      newState.lastMessage = "Kesabaran kami habis. Kami membatalkan negosiasi ini!";
    }
    return newState;
  }

  if (state.phase === 'AGENT_WAGE') {
    let wageOffer = option.value || 0;
    if (wageOffer >= state.requiredWage * 0.95) {
      newState.offeredWage = wageOffer;
      newState.phase = 'DONE';
      newState.speaker = 'System';
      newState.lastMessage = `Kesepakatan tercapai! ${state.targetPlayer.name} bersedia bergabung dengan tim Anda.`;
    } else {
      newState.patience -= 35;
      newState.lastMessage = "Itu tawaran gaji yang tidak sopan. Klien saya adalah pemain top, hargai dia!";
      if (newState.patience <= 0) {
        newState.phase = 'FAILED';
        newState.lastMessage = "Klien saya merasa tidak dihargai. Kami mundur dari kesepakatan ini.";
      }
    }
  }

  return newState;
};
