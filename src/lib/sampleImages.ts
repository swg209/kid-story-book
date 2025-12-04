// "不要乱扔东西"主题绘本案例图片
export const sampleStorybookImages = [
  // 第1页：小兔子奇奇坐在地板上，周围堆满了各种玩具
  'https://images.unsplash.com/photo-1587652395909-7c31de6df6a8?w=800&h=600&fit=crop&auto=format',

  // 第2页：奇奇正在专注地搭建积木，表情认真又快乐
  'https://images.unsplash.com/photo-1541140532224-b9053a559b3a?w=800&h=600&fit=crop&auto=format',

  // 第3页：奇奇把玩完的积木随手扔在地板上，玩具汽车被推到床底下
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format',

  // 第4页：奇奇躺在地板上，周围散落着各种玩具，他玩累了在打哈欠
  'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&h=600&fit=crop&auto=format',

  // 第5页：兔妈妈走进房间，看到满地玩具，温柔但略带担忧地看着奇奇
  'https://images.unsplash.com/photo-1573164713988-8db5a9ad64f2?w=800&h=600&fit=crop&auto=format',

  // 第6页：兔妈妈蹲下来，指着房间角落的彩色玩具箱，对奇奇说着什么
  'https://images.unsplash.com/photo-1587652395909-7c31de6df6a8?w=800&h=600&fit=crop&auto=format',

  // 第7页：奇奇好奇地看着玩具箱，耳朵竖起来认真听妈妈解释
  'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&h=600&fit=crop&auto=format',

  // 第8页：奇奇开始收拾玩具，把积木小心地放回玩具箱，动作认真
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format',

  // 第9页：整洁的房间，所有玩具都在玩具箱里整齐排列，奇奇站在一旁拍手
  'https://images.unsplash.com/photo-1541140532224-b9053a559b3a?w=800&h=600&fit=crop&auto=format',

  // 第10页：兔妈妈抱着奇奇，两人一起看着干净的房间，奇奇脸上露出自豪的笑容
  'https://images.unsplash.com/photo-1573164713988-8db5a9ad64f2?w=800&h=600&fit=crop&auto=format'
]

// 角色卡案例图片
export const sampleCharacterImages = [
  'https://images.unsplash.com/photo-1587652395909-7c31de6df6a8?w=400&h=600&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=400&h=600&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1541140532224-b9053a559b3a?w=400&h=600&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1573164713988-8db5a9ad64f2?w=400&h=600&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1587652395909-7c31de6df6a8?w=400&h=600&fit=crop&auto=format'
]

// 根据描述匹配案例图片
export function getSampleImageForDescription(description: string, index: number): string {
  // 基于描述关键词匹配案例图片
  if (description.includes('奇奇') || description.includes('小兔子')) {
    if (description.includes('玩具') || description.includes('积木')) {
      return sampleStorybookImages[index % sampleStorybookImages.length]
    }
    if (description.includes('妈妈') || description.includes('母亲')) {
      return sampleStorybookImages[Math.min(index + 4, sampleStorybookImages.length - 1)]
    }
  }

  // 默认使用索引对应的图片
  return sampleStorybookImages[index % sampleStorybookImages.length]
}