import { GoogleGenAI, Type } from "@google/genai";
import { SeoReport } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fase 1: Raccolta Intelligence (Sonar Mode)
 */
async function gatherSiteIntelligence(url: string): Promise<{ text: string; sources: any[] }> {
  const prompt = `
    Esegui una scansione tecnica profonda (livello crawler SEO) per il sito: ${url}.
    
    Obiettivi di Intelligence (SONAR MODE):
    1. **Organic SERP Overlap**: Non cercare i competitor "business", cerca chi si posiziona per le STESSE keyword (es. sorelleronco.it, fabioferro.eu per gioiellerie). Chi ruba traffico organico?
    2. **Backlink Deep Dive**: Cerca il numero reale di backlink e Referring Domains. Cerca pattern di Anchor Text (es. Brand vs Money Keywords).
    3. **Striking Distance Keywords**: Trova keyword specifiche dove il sito è in 2ª pagina (Posizione 11-20) o a fine 1ª pagina. Queste sono le opportunità d'oro.
    4. **Local vs National**: Distingui se il traffico è puramente locale (es. "Verona") o nazionale.
    
    Cerca dati specifici su volumi di ricerca reali (evita stime generiche).
    Rispondi in Italiano con dati grezzi e numeri.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || "Dati tecnici limitati.";
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  // Extract sources
  const sources = groundingChunks
    .map((chunk: any) => chunk.web)
    .filter((web: any) => web && web.uri && web.title);

  return { text, sources };
}

/**
 * Fase 2: Analisi Strategica (SEOZoom Logic)
 */
async function generateStrategicReport(url: string, researchData: string): Promise<SeoReport> {
  const now = new Date();
  const currentMonthYear = now.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
  const oneYearAgoStr = oneYearAgo.toLocaleString('it-IT', { month: 'long', year: 'numeric' });

  const systemInstruction = `
    Sei "Iride", un'architettura AI per l'analisi SEO tecnica avanzata, simile al motore di calcolo di SEOZoom o Semrush.
    
    FILOSOFIA DI ANALISI (METODO SONAR & SIMULAZIONE STATISTICA):
    1. **Iceberg dei Backlink**: Se trovi 100 backlink visibili, statisticamente ce ne sono molti di più. Moltiplica i segnali visibili per stimare il database reale (spesso 20x-50x i link visibili in snippet).
    2. **Zoom Authority (ZA)**: Calcola un punteggio 0-100 basato sulla QUANTITÀ di domini riferenti stimati.
    3. **Zoom Trust (ZT)**: Calcola un punteggio 0-100 basato sulla QUALITÀ. Se ci sono troppe ancore "Exact Match", il Trust scende (ZT < ZA = Rischio Penalizzazione).
    4. **Anchor Strategy**: Definisci le percentuali di ancore Brand, Exact Match, URL, Generiche.
    5. **Precisione Volumi**: Riconosci il locale. "Orologi Verona" = 50-300 vol, non 10k.
    
    CONTESTO TEMPORALE:
    - Data Analisi: ${now.toLocaleDateString('it-IT')}.
    - Traffico: Ultimi 12 mesi fino a ${currentMonthYear}.
    
    OUTPUT RIGIDO JSON:
    - I volumi devono essere stringhe pulite ("250", "1.2k").
    - 'opportunityKeywords' DEVE contenere keyword tra posizione 11 e 30.
  `;

  const prompt = `
    Analizza i seguenti dati grezzi "Sonar" per ${url}:
    
    <DATI_SONAR>
    ${researchData}
    </DATI_SONAR>

    Genera il report JSON IrideSEOArchitect. 
    Calcola Zoom Authority (popolarità) e Zoom Trust (fiducia).
    Analizza la distribuzione delle Anchor Text.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      thinkingConfig: { thinkingBudget: 16000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          url: { type: Type.STRING },
          summary: { type: Type.STRING, description: "Audit tecnico per webmaster." },
          clientSummary: { type: Type.STRING, description: "Spiegazione business per il cliente." },
          zoomAuthority: { type: Type.INTEGER, description: "Popolarità del dominio (0-100)." },
          zoomTrust: { type: Type.INTEGER, description: "Fiducia del dominio (0-100)." },
          backlinksCount: { type: Type.INTEGER, description: "Totale Backlink stimati." },
          referringDomains: { type: Type.INTEGER, description: "Domini unici (RefDom)." },
          anchorProfile: {
            type: Type.ARRAY,
            description: "Distribuzione testi ancore",
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ["Brand", "Exact Match", "Generic", "URL"] },
                percentage: { type: Type.INTEGER },
                example: { type: Type.STRING, description: "Esempio reale di ancora trovata" }
              }
            }
          },
          trafficTrend: {
            type: Type.ARRAY,
            description: `Trend visite 12 mesi (${oneYearAgoStr} - ${currentMonthYear}).`,
            items: {
              type: Type.OBJECT,
              properties: {
                month: { type: Type.STRING },
                visits: { type: Type.INTEGER }
              }
            }
          },
          topKeywords: {
            type: Type.ARRAY,
            description: "Keyword Top 10",
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                volume: { type: Type.STRING },
                difficulty: { type: Type.INTEGER },
                currentRank: { type: Type.INTEGER, description: "1-10" },
                rankHistory: { type: Type.ARRAY, items: { type: Type.INTEGER } }
              }
            }
          },
          opportunityKeywords: {
            type: Type.ARRAY,
            description: "Keyword in 2a/3a Pagina (Pos 11-30).",
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                volume: { type: Type.STRING },
                difficulty: { type: Type.INTEGER },
                currentRank: { type: Type.INTEGER, description: "11-30" },
                potential: { type: Type.STRING, enum: ["Alto", "Medio", "Basso"] },
                rankHistory: { type: Type.ARRAY, items: { type: Type.INTEGER } }
              }
            }
          },
          competitors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                url: { type: Type.STRING },
                overlapScore: { type: Type.INTEGER },
                commonKeywords: { type: Type.INTEGER }
              }
            }
          },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                impact: { type: Type.STRING, enum: ["Critico", "Alto", "Medio"] },
                effort: { type: Type.STRING, enum: ["Alto", "Medio", "Basso"] },
                category: { type: Type.STRING, enum: ["Content Gap", "Anchor Strategy", "Tech Health", "Authority"] }
              }
            }
          }
        },
        required: ["url", "summary", "clientSummary", "zoomAuthority", "zoomTrust", "backlinksCount", "referringDomains", "anchorProfile", "trafficTrend", "topKeywords", "opportunityKeywords", "competitors", "recommendations"]
      }
    }
  });

  const jsonStr = response.text || "{}";
  try {
    return JSON.parse(jsonStr) as SeoReport;
  } catch (e) {
    console.error("Failed to parse SEO report JSON", e);
    throw new Error("Errore nell'analisi strutturale dei dati.");
  }
}

export const analyzeUrl = async (url: string, onProgress: (stage: string) => void): Promise<SeoReport> => {
  onProgress('SEARCHING');
  const { text: researchData, sources } = await gatherSiteIntelligence(url);
  onProgress('THINKING');
  const report = await generateStrategicReport(url, researchData);
  report.sources = sources;
  return report;
};