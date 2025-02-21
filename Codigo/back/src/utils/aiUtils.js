import axios from 'axios';

/**
 * Fetches an explanation for a question using an AI generative model
 * @param {string} questionText - The text of the question to explain
 * @returns {Promise<string>} The generated explanation from the AI
 */
export const fetchExplanationFromAI = async (questionText) => {
    try {
        // Configuração da API (substitua pela sua chave de API e endpoint)
        const API_KEY = process.env.AI_API_KEY; // Chave da API de IA
        const API_URL = 'https://api.example-ai.com/v1/generate'; // Endpoint da API

        if (!API_KEY) {
            throw new Error('Chave de API não configurada');
        }

        // Requisição à API de IA
        const response = await axios.post(
            API_URL,
            {
                prompt: `Explique detalhadamente a seguinte questão: "${questionText}"`,
                max_tokens: 200, // Limite de tokens na resposta
                temperature: 0.7, // Controla a criatividade da resposta
            },
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // Extrai a explicação gerada pela IA
        const explanation = response.data.choices[0].text.trim();
        return explanation;
    } catch (error) {
        console.error('Erro ao buscar explicação da IA:', error.message);
        throw new Error('Erro ao gerar explicação da questão');
    }
};