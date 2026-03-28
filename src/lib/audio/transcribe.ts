/**
 * Audio transcription using Groq Whisper Large v3
 * Replaces OpenAI Whisper for faster, cheaper Arabic audio transcription
 */

export async function transcribeArabicAudio(
  audioBuffer: Buffer,
  filename: string
): Promise<{ text: string; language: string }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured");
  }

  const file = new File([new Uint8Array(audioBuffer)], filename, {
    type: "audio/webm",
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", "whisper-large-v3");
  formData.append("language", "ar");
  formData.append("response_format", "json");

  const response = await fetch(
    "https://api.groq.com/openai/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq transcription failed: ${response.status} ${errorText}`);
  }

  const result = await response.json();

  return {
    text: result.text,
    language: "ar",
  };
}
