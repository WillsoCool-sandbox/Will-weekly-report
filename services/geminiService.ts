
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateInsight(dashboardData: any, category: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following ${category} data and provide 1 high-impact insight: ${JSON.stringify(dashboardData)}`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 200,
        thinkingConfig: { thinkingBudget: 100 },
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "Ready for deeper analysis.";
  }
}

// Added askAiQuestion to handle AI Assistant queries from the UI
export async function askAiQuestion(query: string, context: any) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context: ${JSON.stringify(context)}\n\nUser Question: ${query}`,
      config: {
        temperature: 0.7,
        systemInstruction: "You are a helpful AI assistant for a developer report dashboard. Use the provided context to answer questions about project metrics and performance accurately and concisely."
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Assistant Error:", error);
    return "I'm having trouble processing that question right now.";
  }
}

export async function analyzeDocument(base64Data: string, mimeType: string, fileName: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          {
            text: `Analyze this developer report. 
            
            EXTRACT THE REPORT DATE:
            - Look at the header of the document (e.g., "[Hanoi Office][2025] Weekly report 1 Dec - 5 Dec").
            - Extract the week range and include the year. For the example above, the result should be "1 Dec - 5 Dec 2025".
            
            EXTRACT AND SUM THESE SIX JOBS (Support & Marketing section):
            1. Customer card created & sent (Look for "Customer Cards" and values like "45 cards email")
            2. Mail sent (Look for "Sent mail" or "Mail sent". Sum all rows if multiple exist)
            3. Customer support (Look for "Customer support" and values like "9" associated with "Emails Responded")
            4. ICT news card created (Look for "Create card ICT news" or "ICT news" and values like "102 cards")
            5. Demo sites created (Look for "Demo Sites" or "Demo plugit" and values like "5 pages". Extract the primary number.)
            6. Card cover created (Look for "Design Tasks" or "Design Work". Look in the description for "Card covers" volume, e.g., "300+". If a specific cover volume is found, return that. If not, return the count of design tasks, e.g., "4".)

            Rules for Extraction:
            - For "Card cover created", prioritize the volume (e.g. 300) found in the description over the task count (e.g. 4).
            - For "Demo sites created", if the report says "Demo plugit: 5 pages", extract "5".
            - For "ICT news card created", find the row "Create card ICT news" and grab the number (e.g., 102).
            - For "Customer support", look for counts like "9 Emails Responded".
            - If "Sent mail" has multiple rows, please SUM them.
            - Return numerical values as strings (e.g., "45", "31", "9", "102", "5", "300").
            
            Output strictly in the defined JSON format.`
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            weeklyHighlight: {
              type: Type.OBJECT,
              properties: {
                weekRange: { type: Type.STRING },
                summary: { type: Type.STRING },
                achievements: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["weekRange", "summary", "achievements"]
            },
            categories: {
              type: Type.OBJECT,
              properties: {
                supportMarketing: {
                  type: Type.OBJECT,
                  properties: {
                    summary: { type: Type.STRING },
                    metrics: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          label: { type: Type.STRING },
                          value: { type: Type.STRING },
                          trend: { type: Type.STRING },
                          icon: { type: Type.STRING }
                        }
                      }
                    },
                    blockers: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                },
                newDevelopment: {
                  type: Type.OBJECT,
                  properties: {
                    projects: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          summary: { type: Type.STRING },
                          metrics: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                label: { type: Type.STRING },
                                value: { type: Type.STRING },
                                trend: { type: Type.STRING },
                                icon: { type: Type.STRING }
                              }
                            }
                          },
                          blockers: { type: Type.ARRAY, items: { type: Type.STRING } },
                          releases: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                date: { type: Type.STRING },
                                version: { type: Type.STRING },
                                description: { type: Type.STRING },
                                impactScore: { type: Type.NUMBER },
                                storiesCount: { type: Type.NUMBER }
                              }
                            }
                          }
                        },
                        required: ["name", "summary", "metrics", "blockers", "releases"]
                      }
                    }
                  }
                }
              }
            }
          },
          required: ["executiveSummary", "categories", "weeklyHighlight"]
        }
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Document Analysis Error:", error);
    throw error;
  }
}
