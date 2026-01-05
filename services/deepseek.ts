
import { UserProfile, GeneratedPlan } from '../types';
import { DEEPSEEK_API_URL } from '../constants';

export const generateBaoyanPlan = async (user: UserProfile): Promise<GeneratedPlan> => {
  // 1. Validate API Key
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey.includes("API_KEY")) {
    throw new Error("配置错误：未检测到 API Key。请在 Netlify 的 'Environment variables' 中添加名为 API_KEY 的变量，并填入您的 DeepSeek Key。");
  }

  // 2. Define Prompts
  const systemPrompt = `
    你是一位顶尖的保研规划专家，来自“好保研 (Unipath)”团队。
    你的任务是为学生生成一份详细的、商业级别的保研规划方案。
    
    原则：
    1. 信息必须精准，来源于官方平台或双一流高校通用政策。
    2. 针对用户的学校和专业，必须提供【近三年保研率】、【保研加分政策摘要】、【保研去向】的数据分析。若无确切内部数据，请根据该校层次（985/211/双非）及学科评估等级进行科学估算（例如985头部保研率通常在25%-35%）。
    3. 语气专业、鼓励、客观，符合麦肯锡咨询风格。
    4. 重点回答用户的“咨询问题”。
    5. 若学生为新工科方向（计算机/AI/电子等），productRecommendation 字段请填 "Sunrise"；否则填 "Harvest"。
    
    【重要】必须只输出标准的 JSON 格式，不要包含 Markdown 标记（如 \`\`\`json）。
    
    目标 JSON 结构如下：
    {
      "confusionAnalysis": { "title": "专家诊断", "content": ["点1", "点2"] },
      "summary": "核心综述字符串",
      "schoolStats": {
        "rateTrend": [{ "year": "2021", "rate": "15%" }, { "year": "2022", "rate": "16%" }],
        "bonusPolicies": [{ "category": "竞赛", "content": "国一+3分" }],
        "destinations": [{ "school": "清华大学", "count": "12人" }]
      },
      "swot": {
        "strengths": ["优势1", "优势2"],
        "weaknesses": ["劣势1"],
        "opportunities": ["机会1"],
        "threats": ["威胁1"]
      },
      "analysis": { "title": "背景分析", "content": ["分析1", "分析2"] },
      "targetSchools": { "title": "目标院校", "content": ["学校A", "学校B"] },
      "competitionStrategy": { "title": "竞赛规划", "content": ["建议1"] },
      "researchStrategy": { "title": "科研规划", "content": ["建议1"] },
      "employment": {
        "title": "就业展望",
        "averageSalary": "30w-40w",
        "topCompanies": ["公司A"],
        "roles": ["岗位A"]
      },
      "timeline": { "title": "时间轴", "content": ["3月：xxx", "4月：xxx"] },
      "productRecommendation": "Sunrise" 
    }
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
    
    请根据以上信息，生成详细保研规划。请直接返回 JSON 数据。
  `;

  try {
    // 3. Call DeepSeek API (OpenAI Compatible Interface)
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat", // V3
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 1.3, // DeepSeek Creative Temperature
        response_format: { type: "json_object" } // Force JSON mode
      })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API请求失败: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("AI未返回有效内容");
    }
    
    // Parse JSON
    return JSON.parse(content) as GeneratedPlan;

  } catch (error: any) {
    console.error("DeepSeek API Call Failed:", error);
    // User friendly error mapping
    if (error.message.includes("401")) {
        throw new Error("API Key 无效或已过期，请检查 Netlify 配置。");
    }
    if (error.message.includes("402")) {
        throw new Error("API Key 余额不足，请充值。");
    }
    throw new Error(error.message || "生成规划时发生未知错误，请检查网络");
  }
};
