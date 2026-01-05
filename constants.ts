
// ⚠️ 注意：不要在这里直接填写真实的 API KEY，否则上传 GitHub 后会被盗用！
// 我们将在 Netlify 的后台设置中填入 KEY。
export const DEEPSEEK_API_KEY = ""; // 留空即可，代码会自动读取环境变量
export const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

// Branding Colors
export const BRAND_COLOR_PRIMARY = "#7b4fa3"; // Deep Purple
export const BRAND_COLOR_SECONDARY = "#b39cd0"; // Light Purple
export const BRAND_TEXT_WHITE = "#FFFFFF";

// Logo
export const LOGO_URL = "https://placehold.co/400x120/7b4fa3/ffffff?text=UNIPATH+%E5%A5%BD%E4%BF%9D%E7%A0%94";

// QR Code for Consultant
export const CONSULT_QR_CODE = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=WeChat:Unipath_Emily"; 

// --- FEISHU CONFIGURATION ---
// 1. 在飞书群组添加“自定义机器人”
// 2. 安全设置必须勾选“自定义关键词”，并填入：保研
// 3. 将获得的 Webhook 地址粘贴在下方
export const FEISHU_WEBHOOK_URL = "https://open.feishu.cn/open-apis/bot/v2/hook/25faa1d2-76d3-4f88-8277-a5a625b6f789"; 

export const PRODUCTS = {
  SUNRISE: {
    name: "破晓计划 (Sunrise Project)",
    tagline: "新工科保研 · 顶刊顶会冲刺",
    description: "专为计算机、人工智能、电子信息等新工科专业打造。聚焦CCF-A/B类会议及SCI期刊科研产出，提供从课题选题、实验设计到论文发表的全流程学术指导，助力冲击清北华五。",
    color: "from-blue-600 to-purple-600"
  },
  HARVEST: {
    name: "桃李计划 (Harvest Project)",
    tagline: "全学科保研 · 综合背景提升",
    description: "覆盖文理工商医全学科。依托十年保研大数据，提供个性化择校定位、文书深度润色及面试（单面/群面）实战演练，精准匹配10000+名校导师资源。",
    color: "from-purple-600 to-pink-600"
  }
};
