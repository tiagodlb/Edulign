import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body || !body.question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      store: true,
      messages: [
        {
          role: 'system',
          content:
            'Você é um assistente especializado em responder questões de simulados. Forneça respostas detalhadas e explicativas.'
        },
        {
          role: 'user',
          content: `Responda a seguinte questão de simulado: "${body.question}"`
        }
      ]
    })

    return NextResponse.json({
      text: response.choices[0].message.content || ''
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}
