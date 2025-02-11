// /api/generate/[questionId]/route.ts
import { OpenAI } from "openai";
import { NextResponse } from "next/server";

interface Question {
  id: string;
  enunciado: string;
  comando?: string;
  alternativas: Array<{
    texto: string;
    correta: boolean;
    justificativa: string;
  }>;
}

export async function POST(
  request: Request,
  { params }: { params: { questionId: string[] } }
) {
  try {
    const questionId = params.questionId[0];
    const body = await request.json();
    const question: Question = body.question;

    if (!questionId || !question) {
      return NextResponse.json(
        { error: "Question details are required" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Format the question details for the prompt
    const correctAnswer = question.alternativas.find((alt) => alt.correta);
    const questionDetails = `
Enunciado: ${question.enunciado}
${question.comando ? `Comando: ${question.comando}` : ""}

Alternativas:
${question.alternativas
  .map(
    (alt, idx) =>
      `${String.fromCharCode(65 + idx)}) ${alt.texto}${
        alt.correta ? " (Correta)" : ""
      }`
  )
  .join("\n")}

Resposta correta: ${correctAnswer?.texto}
Justificativa: ${correctAnswer?.justificativa}
    `.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um professor especializado em explicar questões de simulados. Forneça explicações detalhadas, passo a passo, que ajudem o aluno a compreender não apenas a resposta correta, mas também por que as outras alternativas estão incorretas.",
        },
        {
          role: "user",
          content: `Por favor, explique detalhadamente a seguinte questão:\n\n${questionDetails}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    if (!response.choices?.[0]?.message?.content) {
      throw new Error("No response generated");
    }

    return NextResponse.json({
      explanation: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
