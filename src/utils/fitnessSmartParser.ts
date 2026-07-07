// =========================================================================
// PROJETO 100KG - NLP PARSER INTELIGENTE DE ENTRADAS DE VOZ PARA ATIVIDADES
// =========================================================================

import { TrainingModality, CyclingType } from '@/types/database.types';

interface ParsedFitnessInput {
  modality: TrainingModality;
  cycling_type?: CyclingType | null;
  duration: number; // minutos
  calories?: number | null;
  distance?: number | null; // km
  avg_hr?: number | null;
  max_hr?: number | null;
  avg_cadence?: number | null;
  avg_speed?: number | null;
  elevation?: number | null;
  date: string; // YYYY-MM-DD
  notes?: string;
}

// Dicionário de conversão de numerais falados por extenso para dígitos
const writtenNumbers: Record<string, number> = {
  zero: 0, um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5,
  seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, onze: 11, doze: 12, treze: 13,
  quatorze: 14, quinze: 15, dezesseis: 16, dezessete: 17, dezoito: 18, dezenove: 19,
  vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50, sessenta: 60, setenta: 70,
  oitenta: 80, noventa: 90, cem: 100, cento: 100
};

// Converte numerais por extenso em dígitos num texto
export function translateWrittenNumbers(text: string): string {
  let normalized = text.toLowerCase();

  // Substituir sequências compostas como "trinta e cinco" por dígitos (30 e 5 = 35)
  // Substitui dezenas e unidades primeiro
  const parts = normalized.split(/\s+/);
  const result: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    const word = parts[i];
    const nextWord = parts[i + 1];
    const nextNextWord = parts[i + 2];

    // Ex: "vinte e cinco" -> 25
    if (
      writtenNumbers[word] !== undefined &&
      nextWord === 'e' &&
      nextNextWord !== undefined &&
      writtenNumbers[nextNextWord] !== undefined &&
      writtenNumbers[word] >= 10 &&
      writtenNumbers[nextNextWord] < 10
    ) {
      const sum = writtenNumbers[word] + writtenNumbers[nextNextWord];
      result.push(sum.toString());
      i += 2; // pula "e" e a unidade
    } else if (writtenNumbers[word] !== undefined) {
      result.push(writtenNumbers[word].toString());
    } else {
      result.push(word);
    }
  }

  return result.join(' ');
}

export function parseFitnessSmartInput(text: string): ParsedFitnessInput {
  // Traduzir números falados por extenso para dígitos
  const rawText = text.toLowerCase();
  const processedText = translateWrittenNumbers(rawText);

  // 1. Identificar Modalidade
  let modality: TrainingModality = 'Outro';
  if (processedText.includes('ciclismo') || processedText.includes('pedal') || processedText.includes('bike')) {
    modality = 'Ciclismo';
  } else if (processedText.includes('futebol') || processedText.includes('bola') || processedText.includes('jogo')) {
    modality = 'Futebol';
  } else if (processedText.includes('corrida') || processedText.includes('correr') || processedText.includes('trote')) {
    modality = 'Corrida';
  } else if (processedText.includes('caminhada') || processedText.includes('caminhar') || processedText.includes('passo')) {
    modality = 'Caminhada';
  } else if (processedText.includes('academia') || processedText.includes('treino de musculação') || processedText.includes('musculação') || processedText.includes('ferro')) {
    modality = 'Academia';
  }

  // 2. Identificar Tipo de Ciclismo (Apenas para Ciclismo)
  let cycling_type: CyclingType | null = null;
  if (modality === 'Ciclismo') {
    if (processedText.includes('z2') || processedText.includes('zona dois') || processedText.includes('zona 2')) {
      cycling_type = 'Z2';
    } else if (processedText.includes('z4') || processedText.includes('zona quatro') || processedText.includes('zona 4')) {
      cycling_type = 'Z4';
    } else if (processedText.includes('z5') || processedText.includes('zona cinco') || processedText.includes('zona 5')) {
      cycling_type = 'Z5';
    } else if (processedText.includes('z3') || processedText.includes('zona tres') || processedText.includes('zona 3')) {
      cycling_type = 'Z3';
    } else if (processedText.includes('recuperação') || processedText.includes('regenerativo') || processedText.includes('recuperacao')) {
      cycling_type = 'Recuperação';
    } else if (processedText.includes('longão') || processedText.includes('longao') || processedText.includes('treino longo')) {
      cycling_type = 'Longão';
    } else {
      cycling_type = 'Livre';
    }
  }

  // 3. Identificar Duração (minutos e horas)
  let duration = 30; // valor padrão
  // Padrão: "X horas e Y minutos" ou "X h Y min"
  const hourMinMatch = processedText.match(/(\d+)\s*(?:hora|horas|h)\s*(?:e)?\s*(\d+)\s*(?:minuto|minutos|min|m)/);
  const hourOnlyMatch = processedText.match(/(\d+)\s*(?:hora|horas|h)(?!\s*\d)/);
  const minOnlyMatch = processedText.match(/(\d+)\s*(?:minuto|minutos|min|m)/);

  if (hourMinMatch) {
    duration = parseInt(hourMinMatch[1]) * 60 + parseInt(hourMinMatch[2]);
  } else if (hourOnlyMatch) {
    duration = parseInt(hourOnlyMatch[1]) * 60;
  } else if (minOnlyMatch) {
    duration = parseInt(minOnlyMatch[1]);
  }

  // 4. Identificar Distância (km ou quilômetros)
  let distance: number | null = null;
  const distanceMatch = processedText.match(/(\d+(?:[.,]\d+)?)\s*(?:km|kms|quilômetro|quilômetros|quilometros|km)/);
  if (distanceMatch) {
    distance = parseFloat(distanceMatch[1].replace(',', '.'));
  }

  // 5. Identificar Calorias (calorias, kcal)
  let calories: number | null = null;
  const caloriesMatch = processedText.match(/(\d+)\s*(?:caloria|calorias|kcal|cal)/);
  if (caloriesMatch) {
    calories = parseInt(caloriesMatch[1]);
  }

  // 6. Identificar Data (hoje, ontem, anteontem, dia X)
  let date = new Date().toISOString().split('T')[0]; // Hoje por padrão
  if (processedText.includes('ontem')) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    date = yesterday.toISOString().split('T')[0];
  } else if (processedText.includes('anteontem')) {
    const anteontem = new Date();
    anteontem.setDate(anteontem.getDate() - 2);
    date = anteontem.toISOString().split('T')[0];
  }

  // 7. Identificar Frequência Cardíaca Média e Máxima
  let avg_hr: number | null = null;
  let max_hr: number | null = null;
  const fcMediaMatch = processedText.match(/(?:fc|frequência|frequencia|cardíaca|cardiaca|batimento|bpm)\s*(?:média|media|medio|med)?\s*(\d+)/);
  if (fcMediaMatch) {
    avg_hr = parseInt(fcMediaMatch[1]);
  }
  const fcMaxMatch = processedText.match(/(?:fc|frequência|frequencia)\s*(?:máxima|maxima|max)\s*(\d+)/);
  if (fcMaxMatch) {
    max_hr = parseInt(fcMaxMatch[1]);
  }

  // 8. Velocidade Média
  let avg_speed: number | null = null;
  const speedMatch = processedText.match(/(?:velocidade|vel)\s*(?:média|media|med)?\s*(\d+(?:[.,]\d+)?)/);
  if (speedMatch) {
    avg_speed = parseFloat(speedMatch[1].replace(',', '.'));
  }

  // 9. Elevação
  let elevation: number | null = null;
  const elevationMatch = processedText.match(/(?:elevação|elevacao|subida|ganho)\s*(?:de)?\s*(\d+(?:[.,]\d+)?)/);
  if (elevationMatch) {
    elevation = parseFloat(elevationMatch[1].replace(',', '.'));
  }

  // 10. Cadência Média
  let avg_cadence: number | null = null;
  const cadenceMatch = processedText.match(/(?:cadência|cadencia)\s*(?:média|media|med)?\s*(\d+)/);
  if (cadenceMatch) {
    avg_cadence = parseInt(cadenceMatch[1]);
  }

  // Limpar a frase para criar uma nota amigável
  const cleanNotes = `Lançado por voz: "${rawText}"`;

  return {
    modality,
    cycling_type,
    duration,
    distance,
    calories,
    avg_hr,
    max_hr,
    avg_speed,
    elevation,
    avg_cadence,
    date,
    notes: cleanNotes
  };
}
