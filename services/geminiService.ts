import { GoogleGenAI, Modality } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const editImageWithGemini = async (
  prompt: string,
  mainImage: { data: string; mimeType: string },
  referenceImage: { data: string; mimeType: string } | null,
  aspectRatio: string,
  lightingStyle: string,
  cameraPerspective: string
): Promise<string> => {
  const parts: any[] = [];
  
  const sceneDetails = `The lighting should be '${lightingStyle}' and the camera perspective should be '${cameraPerspective}'.`;

  let fullPrompt;

  if (referenceImage) {
    parts.push({ inlineData: { data: referenceImage.data, mimeType: referenceImage.mimeType } });
    parts.push({ inlineData: { data: mainImage.data, mimeType: mainImage.mimeType } }); // This is now pre-padded
    fullPrompt = `You are an expert product photographer. You have two images: the first is a style reference, the second is the main product pre-padded to the desired final output aspect ratio of ${aspectRatio}. Your task is to recreate the scene from the style reference, but place the product from the second image into it. ${sceneDetails} The final generated image MUST perfectly match the dimensions and ${aspectRatio} aspect ratio of the second image. Fill any empty space (like black bars) by extending the environment from the reference image. The user's specific creative instructions are: "${prompt}".`;
  } else {
    parts.push({ inlineData: { data: mainImage.data, mimeType: mainImage.mimeType } }); // This is pre-padded
    fullPrompt = `You are an expert product photographer. The provided image contains a product and has been pre-padded with black bars to the desired final aspect ratio of ${aspectRatio}. Your task is to create a professional product photograph. ${sceneDetails} You MUST completely replace the black bars with a photorealistic background and environment that matches the user's instructions. The final image MUST retain the exact dimensions and ${aspectRatio} aspect ratio of the input image. The user's specific creative instructions are: "${prompt}".`;
  }
  
  parts.push({ text: fullPrompt });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: { parts },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData?.data) {
      return part.inlineData.data;
    }
  }
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.text) {
      throw new Error(`Model responded with text instead of an image: "${part.text}"`);
    }
  }

  throw new Error('Image generation failed. The model did not return a valid image.');
};

export const generatePromptFromImage = async (
  image: { data: string; mimeType: string }
): Promise<string> => {
  const imagePart = {
    inlineData: {
      data: image.data,
      mimeType: image.mimeType,
    },
  };
  const textPart = {
    text: 'Analyze this product mockup scene. Generate a concise, descriptive prompt about the environment, lighting, and style. This will be used to guide an AI in placing a new product into this exact scene.',
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
  });

  const text = response.text;
  if (text) {
    return text.trim();
  }

  throw new Error('Failed to generate prompt from the reference image.');
};

export const analyzeProductColor = async (
  image: { data: string; mimeType: string }
): Promise<string> => {
  const imagePart = {
    inlineData: {
      data: image.data,
      mimeType: image.mimeType,
    },
  };
  const textPart = {
    text: `Analyze the product in this image. Generate a complete and detailed prompt for a professional and beautiful product photoshoot. The prompt should describe the ideal background, scene, and lighting effects that would complement this specific product. The prompt should be ready to be used directly by an image generation AI. For example: 'A minimalist shot of the product on a clean, off-white surface with soft, diffused morning light creating gentle shadows.'`,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
  });

  const text = response.text;
  if (text) {
    return text.trim();
  }

  throw new Error('Failed to analyze product color.');
};


export const generateMagicPrompt = async (
  image: { data: string; mimeType: string },
  mood: string
): Promise<string> => {
  const imagePart = {
    inlineData: {
      data: image.data,
      mimeType: image.mimeType,
    },
  };
  const textPart = {
    text: `You are an expert art director and professional product photographer. Analyze the product in this image. Generate a single, highly detailed, and imaginative prompt for a professional photoshoot with a strong '${mood}' mood. This prompt should be ready to be used by an image generation AI. Describe the scene, the background, the specific lighting, the camera angle, the style, and any special effects to evoke the chosen mood. Be creative and aim for a visually stunning result. For example, for a 'Dark & Moody' mood: 'A macro shot of the watch on a dark, wet slate rock, with cinematic, moody lighting catching the texture of the rock and the gleam of the metal. The background is a misty, out-of-focus forest. Photorealistic style.'`,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
  });

  const text = response.text;
  if (text) {
    return text.trim();
  }

  throw new Error('Failed to generate magic prompt.');
};