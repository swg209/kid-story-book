# Gemini Nano Banana Pro 绘本生图提示词

## 角色生图提示词

### 小兔子奇奇角色卡生成
```
A cute white rabbit character for children's picture book, long floppy ears, wearing a red small vest and blue shorts, friendly smile, standing pose, clean line art, soft pastel colors, rounded shapes, gentle and warm illustration style, suitable for 3-year-old children, simple background, high quality digital art, children's book illustration style.
```

## 绘本页面生图提示词

### 第1页：开场场景
```
Children's picture book illustration, a cute white rabbit with long ears sitting on a colorful playroom floor, surrounded by various toys (building blocks, toy cars, dolls), the rabbit is wearing a red vest and blue shorts, happy expression on his face, bright and warm lighting, soft pastel colors, simple clean lines, inviting atmosphere for toddlers, 4:3 aspect ratio, gentle art style suitable for 3-year-old children.
```

### 第2页：专注玩耍
```
Children's picture book illustration, cute white rabbit character focused on stacking colorful building blocks, concentrated and happy expression, wearing red vest and blue shorts, clean and bright playroom background, soft lighting, warm pastel color palette, simple composition, educational and nurturing atmosphere, suitable for 3-year-old children, 4:3 aspect ratio, gentle illustration style.
```

### 第3页：开始凌乱
```
Children's picture book illustration, cute white rabbit carelessly tossing building blocks on the floor, pushing toy cars under the bed, room becoming messy, rabbit wearing red vest and blue shorts, casual expression, playroom showing signs of disorganization, soft pastel colors, simple background, gentle learning moment illustration, 4:3 aspect ratio, suitable for 3-year-old children's book.
```

### 第4页：玩累了
```
Children's picture book illustration, cute white rabbit lying on the floor surrounded by scattered toys, yawning sleepily, wearing red vest and blue shorts, tired but content expression, messy playroom background, soft warm lighting, pastel colors, gentle bedtime atmosphere, simple composition, 4:3 aspect ratio, suitable for 3-year-old children's storybook.
```

### 第5页：妈妈出现
```
Children's picture book illustration, mother rabbit entering the playroom, looking at the messy floor with gentle concern, cute white rabbit sitting among toys, mother rabbit wearing soft pastel dress, warm motherly expression, caring atmosphere, soft lighting, gentle colors, loving family moment, simple background, 4:3 aspect ratio, suitable for 3-year-old children's book.
```

### 第6页：温柔教导
```
Children's picture book illustration, mother rabbit kneeling down to the white rabbit's level, pointing to a colorful toy box in the corner, gentle teaching moment, both characters wearing soft colors, mother with patient expression, rabbit listening attentively, warm lighting in cozy playroom, pastel color palette, educational and nurturing atmosphere, 4:3 aspect ratio, suitable for 3-year-old children.
```

### 第7页：好奇学习
```
Children's picture book illustration, cute white rabbit looking curiously at colorful toy box, long ears perked up, attentive learning expression, wearing red vest and blue shorts, bright clean playroom background, soft lighting, warm colors, moment of discovery and understanding, simple composition, educational children's book style, 4:3 aspect ratio.
```

### 第8页：开始整理
```
Children's picture book illustration, cute white rabbit carefully putting building blocks into toy box, focused and diligent expression, wearing red vest and blue shorts, colorful toy box with various toys, clean playroom setting, soft warm lighting, pastel colors, positive action moment, children learning responsibility, simple background, 4:3 aspect ratio, suitable for educational children's book.
```

### 第9页：整洁成果
```
Children's picture book illustration, perfectly clean and organized playroom, all toys neatly stored in colorful toy box, cute white rabbit standing proudly with hands clapping, happy and accomplished expression, wearing red vest and blue shorts, bright cheerful atmosphere, soft pastel colors, sense of achievement, simple composition, 4:3 aspect ratio, suitable for 3-year-old children's educational book.
```

### 第10页：温馨结局
```
Children's picture book illustration, mother rabbit hugging the cute white rabbit, both looking at the clean room together, rabbit wearing red vest and blue shorts with proud happy expression, warm mother-child bonding moment, clean organized playroom background, soft loving atmosphere, pastel color palette, gentle lighting, emotional connection, simple composition, 4:3 aspect ratio, heartwarming children's book illustration.
```

## 通用生图参数配置

### 推荐参数
```json
{
  "prompt": "[上述具体提示词]",
  "num_images": 1,
  "aspect_ratio": "4:3",
  "output_format": "png",
  "resolution": "1K",
  "sync_mode": false
}
```

### 角色生图参数
```json
{
  "prompt": "[角色卡提示词]",
  "num_images": 1,
  "aspect_ratio": "2:3",
  "output_format": "png",
  "resolution": "1K",
  "sync_mode": false
}
```

## 提示词优化要点

### 1. 角色一致性
- 始终包含 "cute white rabbit with long ears, wearing red vest and blue shorts"
- 保持表情和动作的连贯性
- 使用 "gentle art style suitable for 3-year-old children"

### 2. 场景描述
- 明确场景：playroom, toy box, clean room等
- 描述光线：soft lighting, warm atmosphere
- 指定色彩：pastel colors, bright and cheerful

### 3. 情感表达
- 每页都要明确角色的情绪状态
- 用动作来配合故事发展
- 保持温馨积极的整体基调

### 4. 技术参数
- 4:3 比例适合绘本展示
- 1K 分辨率保证清晰度
- PNG 格式便于后续处理

## 批量生图策略

### 顺序生成建议
1. 先生成角色卡，确保角色形象稳定
2. 按页面顺序逐一生成，保持风格一致
3. 如果某页效果不理想，可单独重生成该页

### 风格统一技巧
- 所有提示词都包含相同的基础描述
- 使用一致的色彩和光线描述
- 保持 "children's picture book illustration style" 核心风格