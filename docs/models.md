# Model Catalog — Pvt.

> Last updated: 2026-03-02

## Curated Models

Small on-device GGUF models (<4B params) for mobile inference.

| Model                    | Creator         | Params | Q4 Size | Context | Key Trait                             | Released | Link                                                                                  |
| ------------------------ | --------------- | ------ | ------- | ------- | ------------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| Qwen3.5-0.8B             | Alibaba Cloud   | 0.8B   | ~0.5GB  | 262K    | Smallest multimodal, 201 langs        | Mar 2026 | [HF](https://huggingface.co/Qwen/Qwen3.5-0.8B)                                        |
| Qwen3.5-2B               | Alibaba Cloud   | 2B     | ~1.3GB  | 262K    | Best balance for mobile               | Mar 2026 | [GitHub](https://github.com/QwenLM/Qwen3.5)                                           |
| Qwen3.5-4B               | Alibaba Cloud   | 4B     | ~2.5GB  | 262K    | Highest quality Qwen for phone        | Mar 2026 | [HF](https://huggingface.co/Qwen/Qwen3.5-4B)                                          |
| LFM2.5-1.2B              | Liquid AI       | 1.2B   | ~0.8GB  | —       | Built for edge, fastest CPU inference | Jan 2026 | [Blog](https://www.liquid.ai/blog/lfm2-5-1-2b-thinking-on-device-reasoning-under-1gb) |
| SmolLM3-3B               | Hugging Face    | 3B     | ~1.8GB  | 128K    | Trained on 11.2T tokens, 6 langs      | Jul 2025 | [Blog](https://huggingface.co/blog/smollm3)                                           |
| Phi-4-mini               | Microsoft       | 3.8B   | ~2.5GB  | 128K    | Strong reasoning/math                 | Feb 2025 | [HF](https://huggingface.co/microsoft/Phi-4-mini-instruct)                            |
| Llama-3.2-1B             | Meta            | 1B     | ~0.7GB  | 128K    | Arm/Qualcomm optimized                | Sep 2024 | [Blog](https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/)   |
| Llama-3.2-3B             | Meta            | 3B     | ~1.8GB  | 128K    | Tool calling, multilingual            | Sep 2024 | [Blog](https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/)   |
| Gemma-3-1B               | Google DeepMind | 1B     | ~0.7GB  | 128K    | 140 langs, text-only                  | Mar 2025 | [Blog](https://deepmind.google/models/gemma/gemma-3/)                                 |
| Gemma-3-4B               | Google DeepMind | 4B     | ~2.5GB  | 128K    | Multimodal (text + vision)            | Mar 2025 | [Blog](https://huggingface.co/blog/gemma3)                                            |
| Ministral-3-3B           | Mistral AI      | 3B     | ~2GB    | —       | Reasoning + vision, Dec 2025          | Dec 2025 | [Blog](https://mistral.ai/news/mistral-3)                                             |
| DeepSeek-R1-Distill-1.5B | DeepSeek        | 1.5B   | ~1.1GB  | —       | Distilled from R1, strong reasoning   | Jan 2025 | [HF](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B)                |
| Nanbeige4.1-3B           | Nanbeige        | 3B     | ~1.8GB  | —       | Outperforms Qwen3-4B on reasoning     | Feb 2026 | [HF](https://huggingface.co/Nanbeige/Nanbeige4.1-3B)                                  |

### Tiers (for onboarding/settings model picker)

- **Light (~1GB):** Qwen3.5-0.8B, Gemma-3-1B, Llama-3.2-1B, LFM2.5-1.2B, DeepSeek-R1-Distill-1.5B
- **Standard (~2GB):** Qwen3.5-2B, SmolLM3-3B, Ministral-3-3B, Nanbeige4.1-3B, Llama-3.2-3B
- **Full (~2.5GB+):** Qwen3.5-4B, Gemma-3-4B, Phi-4-mini

### GGUF Source

All fetched from HuggingFace. Custom URL also supported.

### Notes

- Gemma 3 (regular) has GGUF; Gemma 3n (mobile-specific) uses LiteRT only
- Omitted (no sub-4B GGUF): MiniMax (10B+ MoE), GLM/Zhipu (9B+), Kimi/Moonshot (trillion-param MoE), BigPickle (alias for GLM-4.6)
