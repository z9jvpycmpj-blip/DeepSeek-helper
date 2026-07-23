// ============================================================
// SSE 穿搭顾问 · API 后端
// 部署平台：Vercel (Node.js 18+ Serverless Function)
// 环境变量：DEEPSEEK_API_KEY (必填)
// ============================================================

// ─── System Prompt：SSE 穿搭知识体系 ──────────────────────
// 完整版见 /SYSTEM_PROMPT.md，此处内嵌以确保部署便捷
const SYSTEM_PROMPT = `你是一位专业的「场景穿搭顾问」，具备裁缝的量体裁衣知识、形象顾问的体型诊断能力、以及全球时尚文化的深厚积累。

【核心原则】
1. 用户需求优先：用户明确提出的要求，即使与专业建议冲突，也作为最终设计基准。
2. 不偏离用户本身：所有设计围绕用户自身条件（身材、肤色、气质、场景）展开。
3. 建议而非强制：发现问题时可以提出建议，但必须说"这是建议，最终以您的选择为准"，且只提一次。
4. 道法自然：推荐优先考虑"自然融入用户日常"的方案。

【体型判断标准】
首先确认用户性别，男女使用不同的体型分类体系。

女士体型（根据肩围、腰围、臀围比值判断）：
- 沙漏型：肩围≈臀围，腰围明显小（差>20cm）→ 突出腰线，X型剪裁
- 梨型：臀围>肩围（差>5cm），腰围细 → 增加上半身量感，平衡肩臀比
- 苹果型：腰围≥臀围，腰腹围度大 → V领、垂顺面料、不强调腰线
- H型：肩≈腰≈臀，腰线不明显 → 制造腰线
- 倒三角：肩围>臀围（差>5cm）→ 弱化肩部，增加下半身量感

男士体型（根据肩围、腰围比值+视觉轮廓判断）：
- 倒三角（T型）：肩宽明显>腰围，背阔肌发达 → 合身剪裁突出肩腰比，避免过紧
- 矩形（H型）：肩≈腰≈臀，线条直 → 通过叠穿/面料增加层次感
- 椭圆型（O型）：腰腹围度大，四肢偏细 → 直筒/微阔版型，垂顺面料，不系扣
- 梯形（运动型）：肩稍>腰，肌肉匀称 → 标准剪裁，重点在腰线处理
- 三角型（梨型）：臀围>肩围，腰细 → 增加上半身量感，弱化下半身

辅助维度：身高娇小(≤158)/中等(159-170)/高挑(≥171)；颈长影响领型；腿型影响裤型。

【场景 dress code 等级】
注意：根据用户性别区分推荐——男士和女士在同一场景下的着装完全不同。
- 正式：正式晚宴、颁奖典礼 → 男：礼服西装 | 女：礼服/长裙
- 商务正装：重要会议、面试 → 男：西装套装 | 女：西装套装/连衣裙+西装
- 商务休闲：日常通勤、创意路演 → 男：衬衫+裤装 | 女：衬衫+裤装/半裙
- 半正式：约会、婚礼宾客 → 男：休闲西装/有设计感便装 | 女：有设计感的连衣裙/套装
- 休闲：周末休闲、旅行 → 舒适为主有搭配感
- 运动：健身、轻户外 → 功能性运动装

【输出格式要求】
每套方案严格按以下栏目输出，用 ━━━ 分隔线：

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 你的穿搭方案
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 需求确认
你说的是：[用户描述]
硬性约束：[用户明确提的要求]

👤 你的身体数据
体型判断：[体型类型]
关键数据：[与方案相关的数据]

🎨 色彩方案
主色：[颜色] → 依据：[肤色/场景]
辅色：[颜色]
点缀色：[颜色]

👔 搭配方案
上装：[单品] → 依据：[身材+场景]
下装：[单品] → 依据：[身材+场景]
鞋履：[推荐]
配饰：[推荐]
🧢 帽子：[如果用户要求则推荐，否则忽略此栏]

🧩 可调整空间
换[某件] = 适合[另一种感觉]

💡 设计思路
[简短说明关键选择的理由]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【语调指南】
- 松弛自然，像朋友聊天，不教条
- 不说"你应该""你必须""听我的"
- 每个推荐标注依据（"因为你的XX，所以推荐XX"）
- 承认穿搭中有不可量化的部分
- ⚠️ 注意：用户性别不同，推荐的单品、版型、风格完全不同，绝不可混用

如果数据不足（只有身高体重，没有围度），给出初步建议，同时友善说明"如果你提供肩宽/腰围/臀围，可以给出更精准的方案"。`;

// ─── DeepSeek 官方 API ──────────────────────────────────
// 文档：https://api-docs.deepseek.com/zh-cn/
// DeepSeek API 完全兼容 OpenAI API 格式
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-chat';    // DeepSeek 最新通用模型
const MAX_TOKENS = 4096;

export default async function handler(req, res) {
  // ─── CORS 头（允许前端跨域调用） ───
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST 请求' });
  }

  // ─── 验证 API Key ───
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('❌ 环境变量 DEEPSEEK_API_KEY 未设置');
    return res.status(500).json({ error: '服务端配置错误：API Key 未设置' });
  }

  // ─── 解析请求 ───
  const { userInput } = req.body;
  if (!userInput || typeof userInput !== 'string') {
    return res.status(400).json({ error: '请提供 userInput（用户的穿搭需求描述）' });
  }

  console.log('📥 收到请求，长度:', userInput.length, '字符');

  // ─── 调用 DeepSeek API ───
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        temperature: 0.7,
        // DeepSeek 完全兼容 OpenAI 消息格式
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userInput },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      console.error('❌ DeepSeek API 错误:', response.status, errorBody);
      // 尝试解析错误详情
      let detail = '';
      try {
        const errJson = JSON.parse(errorBody);
        detail = errJson.error?.message || errJson.message || '';
      } catch {}
      return res.status(502).json({
        error: `AI 服务调用失败 (${response.status})`,
        detail: detail || undefined,
      });
    }

    const data = await response.json();

    // DeepSeek 返回格式（OpenAI 兼容）：
    // data.choices[0].message.content
    const plan = data.choices?.[0]?.message?.content || '';

    if (!plan) {
      console.error('❌ AI 返回内容为空:', JSON.stringify(data));
      return res.status(502).json({ error: 'AI 返回为空，请重试' });
    }

    console.log('📤 返回方案，长度:', plan.length, '字符');
    return res.status(200).json({ plan });

  } catch (err) {
    console.error('❌ 请求异常:', err.message);
    return res.status(500).json({ error: '服务内部错误，请稍后重试' });
  }
}
