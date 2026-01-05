
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, GeneratedPlan } from '../types';

export const generateBaoyanPlan = async (user: UserProfile): Promise<GeneratedPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemPrompt = `
    你是一位顶尖的保研规划专家，来自“好保研 (Unipath)”团队。
    你的任务是为学生生成一份详细的、商业级别的保研规划方案。
    
    原则：
    1. 信息必须精准，来源于官方平台或双一流高校通用政策。
    2. 针对用户的学校和专业，必须提供【近三年保研率】、【保研加分政策摘要】、【保研去向】的数据分析。若无确切内部数据，请根据该校层次（985/211/双非）及学科评估等级进行科学估算（例如985头部保研率通常在25%-35%）。
    3. 语气专业、鼓励、客观，符合麦肯锡咨询风格。
    4. 重点回答用户的“咨询问题”。
    5. 若学生为新工科方向（计算机/AI/电子等），productRecommendation 字段请填 "Sunrise"；否则填 "Harvest"。
    
    请严格按照 JSON 格式输出。
  `;

  const userPrompt = `
    学生信息如下：
    姓名：${user.name}
    联系方式：${user.contact}
    学校：${user.university}
    专业：${user.major}
    年级：${user.grade}
    排名/绩点：${user.rank}
    英语水平：${user.englishLevel}
    获奖经历：${user.awards}
    科研论文：${user.research}
    意向方向：${user.targetDirection}
    咨询问题（重点回答）：${user.confusion}
    是否新工科：${user.isNewEngineering ? '是' : '否'}
    
    请根据以上信息，生成详细保研规划。
  `;

  const planSectionSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      content: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ['title', 'content']
  };

  const schema = {
    type: Type.OBJECT,
    properties: {
      confusionAnalysis: planSectionSchema,
      summary: { type: Type.STRING },
      schoolStats: {
        type: Type.OBJECT,
        properties: {
            rateTrend: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { year: { type: Type.STRING }, rate: { type: Type.STRING } },
                    required: ['year', 'rate']
                }
            },
            bonusPolicies: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { category: { type: Type.STRING }, content: { type: Type.STRING } },
                    required: ['category', 'content']
                }
            },
            destinations: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { school: { type: Type.STRING }, count: { type: Type.STRING } },
                    required: ['school', 'count']
                }
            }
        },
        required: ['rateTrend', 'bonusPolicies', 'destinations']
      },
      swot: {
        type: Type.OBJECT,
        properties: {
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
            threats: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['strengths', 'weaknesses', 'opportunities', 'threats']
      },
      analysis: planSectionSchema,
      targetSchools: planSectionSchema,
      competitionStrategy: planSectionSchema,
      researchStrategy: planSectionSchema,
      employment: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            averageSalary: { type: Type.STRING },
            topCompanies: { type: Type.ARRAY, items: { type: Type.STRING } },
            roles: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['title', 'averageSalary', 'topCompanies', 'roles']
      },
      timeline: planSectionSchema,
      crossMajor: planSectionSchema,
      productRecommendation: { type: Type.STRING, enum: ['Sunrise', 'Harvest'] }
    },
    required: [
        'confusionAnalysis', 'summary', 'schoolStats', 'swot', 'analysis', 
        'targetSchools', 'competitionStrategy', 'researchStrategy', 
        'employment', 'timeline', 'productRecommendation'
    ]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("AI生成的内容为空");
    }
    
    return JSON.parse(text) as GeneratedPlan;

  } catch (error: any) {
    console.error("Gemini API Call Failed:", error);
    throw new Error(error.message || "生成规划时发生未知错误");
  }
};
