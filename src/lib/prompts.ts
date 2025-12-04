/**
 * AI 绘本生成提示词库
 * 统一管理所有 AI 模型的提示词，确保风格一致性和可维护性
 */

// 🎨 全局画风设定 (Magic Suffix)
// 把它加在所有生图 Prompt 的最后，保证风格高度统一
export const GLOBAL_STYLE_SUFFIX =
  ", children's book illustration style, watercolor texture, soft pastel colors, cute, simple lines, clean background, high quality, 4k, no text,温馨可爱,儿童绘本插画风格,简洁背景,适合3岁小朋友,卡通风格,无复杂背景,避免恐怖、暴力、黑暗元素"

// 📝 Prompt 1: 角色设计 (用于生成初始的角色参考图)
export const PROMPT_CHARACTER_DESIGN = (description: string) => `
Character Design Sheet for a children's book.
Character description: ${description}.
Poses: Front view, side view, happy face.
Style: ${GLOBAL_STYLE_SUFFIX}
`

// 🎬 Prompt 2: 故事分镜 (LLM 专用)
// Google Gemini 1.5 Flash 非常擅长处理长文本和 JSON
export const SYSTEM_PROMPT_STORYBOARD = `
你是一名专业儿童绘本编剧。
请根据用户输入的故事，拆分成 **严格 10 页** 的分镜脚本。
目标用户：3-7 岁儿童。
要求：
1. 提取每一页的关键画面场景。
2. 描述要简单、具体、画面感强（例如："小兔子坐在红色的椅子上吃胡萝卜"）。
3. 保持每页的情绪递进。
4. 确保画面描述适合 AI 生成图片。

请直接输出纯 JSON 数组，不要包含 Markdown 格式（如 \`\`\`json），格式如下：
[
  {
    "pageIndex": 1,
    "scene_description": "画面描述（用于AI生图）",
    "text": "绘本上的配文（用于排版）"
  }
]
`

// 🖼️ Prompt 3: 最终插图生成
export const PROMPT_PAGE_GENERATION = (characterDesc: string, sceneDesc: string) => `
Children's book illustration.
Character details (MUST KEEP CONSISTENT): ${characterDesc}.
Current Scene: ${sceneDesc}.
Style: ${GLOBAL_STYLE_SUFFIX}
`

// 👥 角色多角度生成提示词
export const PROMPT_CHARACTER_MULTI_ANGLE = (baseDescription: string) => [
  `${baseDescription} 全身像，简单背景，儿童绘本风格${GLOBAL_STYLE_SUFFIX}`,
  `${baseDescription} 半身像，微笑表情，友好可爱，儿童绘本风格${GLOBAL_STYLE_SUFFIX}`,
  `${baseDescription} 侧面像，玩耍姿势，动态感，儿童绘本风格${GLOBAL_STYLE_SUFFIX}`,
  `${baseDescription} 背影，可爱造型，温馨色彩，儿童绘本风格${GLOBAL_STYLE_SUFFIX}`,
  `${baseDescription} 正面像，惊讶表情，卡通风格，色彩鲜艳${GLOBAL_STYLE_SUFFIX}`,
  `${baseDescription} 坐姿，阅读或玩耍姿势，温馨场景，儿童绘本风格${GLOBAL_STYLE_SUFFIX}`
]

// 🎭 情绪化角色提示词
export const PROMPT_CHARACTER_EMOTIONS = (baseDescription: string) => ({
  happy: `${baseDescription} 开心地笑着，眼睛弯成月牙，充满快乐${GLOBAL_STYLE_SUFFIX}`,
  sad: `${baseDescription} 伤心地哭泣，眼泪汪汪，表情委屈${GLOBAL_STYLE_SUFFIX}`,
  surprised: `${baseDescription} 惊讶地张着嘴，眼睛睁得大大的${GLOBAL_STYLE_SUFFIX}`,
  angry: `${baseDescription} 生气地皱着眉头，脸颊鼓鼓的${GLOBAL_STYLE_SUFFIX}`,
  excited: `${baseDescription} 兴奋地跳起来，双手高举，充满活力${GLOBAL_STYLE_SUFFIX}`,
  sleepy: `${baseDescription} 困倦地打着哈欠，眼睛眯成一条线${GLOBAL_STYLE_SUFFIX}`
})

// 🌟 场景背景提示词
export const PROMPT_SCENE_BACKGROUNDS = {
  forest: "茂密的森林，高大的树木，阳光透过树叶洒下来，小动物在周围",
  garden: "美丽的花园，五颜六色的花朵，蝴蝶飞舞，小鸟唱歌",
  home: "温馨的家，柔软的沙发，温暖的灯光，玩具散落在地上",
  school: "明亮的教室，彩色的小椅子，黑板上的画，小朋友们认真学习",
  playground: "儿童游乐场，滑梯、秋千、跷跷板，孩子们开心玩耍",
  beach: "金色沙滩，蓝色大海，贝壳、海星，椰子树摇曳",
  magical: "魔法世界，彩虹、星星、城堡，奇幻的光芒",
  snowy: "雪白的冬日，雪花飘落，雪人、松树，温暖的小屋"
}

// 🎨 特殊效果提示词
export const PROMPT_SPECIAL_EFFECTS = {
  sparkle: "闪亮的星星，魔法光点，闪闪发光的效果",
  rainbow: "美丽的彩虹，七彩光芒，梦幻般的效果",
  night: "夜晚星空，月亮和星星，温暖的路灯",
  rain: "细雨绵绵，雨滴落下，彩虹出现",
  sunshine: "温暖的阳光，金色光芒，明亮欢快",
  bubbles: "彩色泡泡，梦幻透明，轻盈飘浮"
}

// 📚 故事主题提示词
export const PROMPT_STORY_THEMES = {
  friendship: "关于友谊的温暖故事，朋友之间互相帮助",
  adventure: "奇妙的冒险旅程，探索未知的世界",
  learning: "学习新知识，成长和进步的故事",
  family: "家庭的温暖，亲人之间的爱与关怀",
  courage: "勇敢面对困难，培养勇气和自信",
  kindness: "善良的心，帮助他人，传递温暖",
  creativity: "发挥想象力，创造美好的事物",
  responsibility: "学会承担责任，做个负责任的好孩子"
}

// 🔧 API 配置提示词
export const API_CONFIG_TIPS = {
  // Gemini 1.5 Flash 配置
  geminiFlash: {
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json", // 强制输出 JSON
      temperature: 0.7, // 适中的创造性
      topP: 0.8,
      topK: 40
    }
  },

  // Imagen 生成配置
  imagen: {
    aspectRatio: "1:1", // 正方形比例
    addSafetyFilter: true,
    sampleCount: 1, // 每次生成1张
    negativePrompt: "恐怖,暴力,黑暗,复杂背景,文字,水印,签名"
  },

  // 提示词优化技巧
  optimization: {
    characterFirst: "角色描述放在最前面，AI 对靠前的内容权重更高",
    consistentStyle: "使用统一的风格后缀确保画面一致性",
    concreteDescription: "使用具体、明确的画面描述，避免抽象概念",
    emotionalGuidance: "在场景描述中加入情绪指导",
    ageAppropriate: "确保内容适合3-7岁儿童"
  }
}

// 🛠️ 工具函数
export const PromptUtils = {
  // 组合提示词
  combinePrompts: (...prompts: string[]): string => {
    return prompts.filter(Boolean).join(' ').trim()
  },

  // 清理和标准化提示词
  cleanPrompt: (prompt: string): string => {
    return prompt
      .replace(/\s+/g, ' ') // 合并多余空格
      .replace(/，+/g, '，') // 合并多余中文逗号
      .replace(/,+/g, ',')   // 合并多余英文逗号
      .trim()
  },

  // 验证提示词长度（针对不同 API 的限制）
  validateLength: (prompt: string, maxLength: number = 1000): boolean => {
    return prompt.length <= maxLength
  },

  // 为角色添加场景和情绪
  createCharacterScene: (
    characterDesc: string,
    sceneDesc: string,
    emotion?: keyof typeof PROMPT_CHARACTER_EMOTIONS
  ): string => {
    let prompt = PROMPT_PAGE_GENERATION(characterDesc, sceneDesc)

    if (emotion && PROMPT_CHARACTER_EMOTIONS(characterDesc)[emotion]) {
      prompt = PromptUtils.combinePrompts(
        prompt,
        PROMPT_CHARACTER_EMOTIONS(characterDesc)[emotion]
      )
    }

    return PromptUtils.cleanPrompt(prompt)
  }
}

export default {
  GLOBAL_STYLE_SUFFIX,
  PROMPT_CHARACTER_DESIGN,
  SYSTEM_PROMPT_STORYBOARD,
  PROMPT_PAGE_GENERATION,
  PROMPT_CHARACTER_MULTI_ANGLE,
  PROMPT_CHARACTER_EMOTIONS,
  PROMPT_SCENE_BACKGROUNDS,
  PROMPT_SPECIAL_EFFECTS,
  PROMPT_STORY_THEMES,
  API_CONFIG_TIPS,
  PromptUtils
}