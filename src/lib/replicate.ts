import Replicate from 'replicate';
import { Buffer } from 'buffer';

// Helper function to convert ReadableStream to Base64 Data URL
async function streamToBase64(stream: ReadableStream): Promise<string> {
  const response = new Response(stream);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  // Assuming the stream contains PNG image data. Replicate's flux-schnell typically outputs PNG.
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// 基于开源项目的 FLUX.1 Krea 模型配置
export const FLUX_KREA_CONFIG = {
  // 模型参数 (来自 util.py)
  model_name: "black-forest-labs/flux-schnell", // Changed model name to flux-schnell
  params: {
    in_channels: 64,
    vec_in_dim: 768,
    context_in_dim: 4096,
    hidden_size: 3072,
    mlp_ratio: 4.0,
    num_heads: 24,
    depth: 19,
    depth_single_blocks: 38,
    axes_dim: [16, 56, 56],
    theta: 10_000,
    qkv_bias: true,
    guidance_embed: true,
  },
  // 推荐设置 (来自 inference.py 和 README)
  recommended: {
    width: 1024,
    height: 1024,
    guidance: 4.5,        // 3.5 - 5.0 范围
    num_steps: 28,        // 28 - 50 推荐
    seed: 42,
  },
  // 支持的分辨率 (必须是16的倍数)
  supported_resolutions: [
    { width: 1024, height: 1024 },
    { width: 1280, height: 1024 },
    { width: 1024, height: 1280 },
    { width: 1280, height: 768 },
    { width: 768, height: 1280 },
  ],
  // 参数范围
  ranges: {
    guidance: { min: 3.5, max: 5.0 },
    steps: { min: 20, max: 50 }, // Updated steps range
    width: { min: 512, max: 1280 },
    height: { min: 512, max: 1280 },
  }
}

export interface GenerationParams {
  prompt: string
  negative_prompt?: string // Add negative_prompt
  width?: number
  height?: number
  guidance?: number
  num_steps?: number
  seed?: number
}

// 验证参数是否符合模型要求
export function validateParams(params: GenerationParams): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // 检查提示词
  if (!params.prompt || params.prompt.trim().length === 0) {
    errors.push('Prompt is required')
  }
  
  if (params.prompt && params.prompt.length > 500) {
    errors.push('Prompt must be less than 500 characters')
  }

  // 检查负面提示词
  if (params.negative_prompt && params.negative_prompt.length > 500) {
    errors.push('Negative prompt must be less than 500 characters')
  }
  
  // 检查尺寸 (必须是16的倍数)
  if (params.width && params.width % 16 !== 0) {
    errors.push('Width must be a multiple of 16')
  }
  
  if (params.height && params.height % 16 !== 0) {
    errors.push('Height must be a multiple of 16')
  }
  
  // 检查参数范围
  if (params.guidance && (params.guidance < FLUX_KREA_CONFIG.ranges.guidance.min || params.guidance > FLUX_KREA_CONFIG.ranges.guidance.max)) {
    errors.push(`Guidance must be between ${FLUX_KREA_CONFIG.ranges.guidance.min} and ${FLUX_KREA_CONFIG.ranges.guidance.max}`)
  }
  
  if (params.num_steps && (params.num_steps < FLUX_KREA_CONFIG.ranges.steps.min || params.num_steps > FLUX_KREA_CONFIG.ranges.steps.max)) {
    errors.push(`Steps must be between ${FLUX_KREA_CONFIG.ranges.steps.min} and ${FLUX_KREA_CONFIG.ranges.steps.max}`)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// 标准化参数到推荐值
export function normalizeParams(params: GenerationParams): GenerationParams {
  const normalized = { ...params }
  
  // 确保尺寸是16的倍数
  if (normalized.width) {
    normalized.width = Math.round(normalized.width / 16) * 16
  }
  if (normalized.height) {
    normalized.height = Math.round(normalized.height / 16) * 16
  }
  
  // 应用默认值
  return {
    prompt: normalized.prompt.trim(),
    negative_prompt: normalized.negative_prompt?.trim(), // Normalize negative prompt
    width: normalized.width || FLUX_KREA_CONFIG.recommended.width,
    height: normalized.height || FLUX_KREA_CONFIG.recommended.height,
    guidance: normalized.guidance || FLUX_KREA_CONFIG.recommended.guidance,
    num_steps: normalized.num_steps || FLUX_KREA_CONFIG.recommended.num_steps,
    seed: normalized.seed || Math.floor(Math.random() * 1000000),
  }
}

export async function generateImage(params: GenerationParams) {
  try {
    // 验证参数
    const validation = validateParams(params)
    if (!validation.valid) {
      throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`)
    }
    
    // 标准化参数
    const normalizedParams = normalizeParams(params)
    
    console.log('Generating image with params:', normalizedParams)
    
    // 统一使用 Predictions REST API，稳定返回 URL
    const payload = {
      input: {
        prompt: normalizedParams.prompt,
        negative_prompt: normalizedParams.negative_prompt,
        width: normalizedParams.width,
        height: normalizedParams.height,
        guidance: normalizedParams.guidance,
        num_steps: normalizedParams.num_steps,
        seed: normalizedParams.seed,
      },
    };

    const createResp = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!createResp.ok) {
      const text = await createResp.text();
      throw new Error(`Failed to create prediction: ${createResp.status} ${text}`);
    }

    const created: any = await createResp.json();
    const getUrl: string | undefined = created?.urls?.get;
    let status: string | undefined = created?.status;

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    let imageUrl: string | null = null;

    // 轮询直到完成或失败（最多 60 次 ~ 60 秒）
    let attempts = 0;
    while (status && status !== 'succeeded' && status !== 'failed' && attempts < 60) {
      await sleep(1000);
      const pollResp = await fetch(getUrl!, {
        headers: { 'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN!}` },
      });
      const polled: any = await pollResp.json();
      status = polled?.status;
      if (status === 'succeeded') {
        const out = polled?.output;
        if (Array.isArray(out) && out.length > 0 && typeof out[0] === 'string') {
          imageUrl = out[0] as string;
        } else if (typeof out === 'string') {
          imageUrl = out as string;
        }
        break;
      } else if (status === 'failed') {
        throw new Error(`Prediction failed: ${polled?.error || 'unknown error'}`);
      }
      attempts++;
    }

    if (!imageUrl && status !== 'succeeded') {
      throw new Error('Prediction timed out before completion.');
    }

    if (!imageUrl) {
      throw new Error('No image generated or invalid image URL received.');
    }

    return imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

// 获取预估生成时间 (基于步数)
export function getEstimatedTime(steps: number): number {
  // 基于经验值：每步大约1-2秒
  return Math.round(steps * 1.5)
}

// 检查分辨率是否被支持
export function isSupportedResolution(width: number, height: number): boolean {
  return FLUX_KREA_CONFIG.supported_resolutions.some(
    res => res.width === width && res.height === height
  )
}