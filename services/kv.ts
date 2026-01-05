import { UserProfile, GeneratedPlan } from '../types';
import { FEISHU_WEBHOOK_URL } from '../constants';

/**
 * Sends user data to Feishu/Lark Group via Webhook.
 * 
 * CORS Handling:
 * Since browsers block requests to 'open.feishu.cn', we use 'corsproxy.io' 
 * to bypass this restriction for the frontend-only implementation.
 */
export const savePlanToKV = async (user: UserProfile, plan: GeneratedPlan): Promise<string> => {
  const id = Date.now().toString();
  
  // 1. Save to LocalStorage (Backup)
  try {
    const localData = { id, user, plan, createdAt: new Date().toISOString() };
    localStorage.setItem(`unipath_plan_${id}`, JSON.stringify(localData));
  } catch (e) {
    console.error("LocalStorage Save Failed", e);
  }

  // 2. Send to Feishu Webhook
  if (!FEISHU_WEBHOOK_URL || FEISHU_WEBHOOK_URL.includes("YOUR_WEBHOOK_ID")) {
    console.warn("Feishu Webhook URL not configured.");
    return id;
  }

  // Extract key stats for the card
  const latestRate = plan.schoolStats?.rateTrend?.[plan.schoolStats.rateTrend.length - 1]?.rate || "未知";
  const topDest = plan.schoolStats?.destinations?.[0]?.school || "未知";

  // Construct Feishu Card Content (Interactive Message)
  const cardContent = {
    "msg_type": "interactive",
    "card": {
      "config": {
        "wide_screen_mode": true
      },
      "header": {
        "title": {
          "tag": "plain_text",
          "content": "🚀 新线索：好保研AI规划"
        },
        "template": "blue"
      },
      "elements": [
        {
          "tag": "div",
          "fields": [
            {
              "is_short": true,
              "text": {
                "tag": "lark_md",
                "content": `**👤 姓名：**\n${user.name}`
              }
            },
            {
              "is_short": true,
              "text": {
                "tag": "lark_md",
                "content": `**📞 联系方式：**\n<font color='red'>${user.contact || "未填"}</font>`
              }
            },
            {
              "is_short": true,
              "text": {
                "tag": "lark_md",
                "content": `**🏫 院校专业：**\n${user.university} / ${user.major}`
              }
            },
            {
              "is_short": true,
              "text": {
                "tag": "lark_md",
                "content": `**📊 排名/G：**\n${user.rank} (${user.grade})`
              }
            }
          ]
        },
        {
          "tag": "hr"
        },
        {
          "tag": "div",
          "text": {
            "tag": "lark_md",
            "content": `**❓ 核心咨询问题 (Confusion)：**\n${user.confusion || "无"}`
          }
        },
        {
          "tag": "div",
          "text": {
            "tag": "lark_md",
            "content": `**📈 本校保研数据概览：**\n最新保研率: ${latestRate} | 主要去向: ${topDest}`
          }
        },
        {
          "tag": "div",
          "text": {
            "tag": "lark_md",
            "content": `**💡 AI 诊断摘要：**\n${plan.summary || "生成中..."}`
          }
        },
        {
           "tag": "action",
           "actions": [
               {
                   "tag": "button",
                   "text": {
                       "tag": "plain_text",
                       "content": "复制联系方式"
                   },
                   "type": "default",
                   "copy_content": user.contact || ""
               }
           ]
        },
        {
          "tag": "note",
          "elements": [
            {
              "tag": "plain_text",
              "content": `提交时间: ${new Date().toLocaleString()}`
            }
          ]
        }
      ]
    }
  };

  try {
    // USE CORS PROXY to allow browser fetch
    // We prepend 'https://corsproxy.io/?' to the Feishu URL
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(FEISHU_WEBHOOK_URL)}`;
    
    const response = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(cardContent)
    });

    if (response.ok) {
      console.log("Feishu notification sent successfully.");
    } else {
      console.error("Feishu notification failed", await response.text());
    }
  } catch (error) {
    console.error("Network error sending to Feishu", error);
  }

  return id;
};

export const getPlanFromKV = async (id: string): Promise<any | null> => {
    const item = localStorage.getItem(`unipath_plan_${id}`);
    return item ? JSON.parse(item) : null;
};