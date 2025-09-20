export interface Model {
  value: string;
  label: string;
  supportsVision?: boolean;
}

export const models: Model[] = [
  { value: "gemma2-9b-it", label: "💎 Gemma 2 - 9B IT" },
  { value: "llama-3.1-8b-instant", label: "⚡ Llama 3.1 - 8B Instant" },
  { value: "llama-3.3-70b-versatile", label: "🦙 Llama 3.3 - 70B Versatile" },
  {
    value: "deepseek-r1-distill-llama-70b",
    label: "🔍 Deepseek R1 Llama - 70B",
  },
  {
    value: "meta-llama/llama-4-maverick-17b-128e-instruct",
    label: "⚡ Llama 4 Maverick - 17B 128e 📷",
    supportsVision: true,
  },
  {
    value: "meta-llama/llama-4-scout-17b-16e-instruct",
    label: "🦙 Llama 4 Scout - 17B 16e 📷",
    supportsVision: true,
  },
  {
    value: "moonshotai/kimi-k2-instruct-0905",
    label: "🌙 Moonshot Kimi K2 Instruct",
  },
  { value: "openai/gpt-oss-120b", label: "🤖 OpenAI GPT OSS - 120B" },
  { value: "openai/gpt-oss-20b", label: "🤖 OpenAI GPT OSS - 20B" },
  { value: "qwen/qwen3-32b", label: "🐦 Qwen Qwen3 - 32B" },
  { value: "compound-beta", label: "🧪 Compound Beta" },
  { value: "compound-beta-mini", label: "🧪 Compound Beta Mini" },
];

export const getModelByValue = (value: string): Model | undefined => {
  return models.find((model) => model.value === value);
};
