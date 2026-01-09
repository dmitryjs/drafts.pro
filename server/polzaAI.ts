import OpenAI from "openai";

const polzaAI = new OpenAI({
  baseURL: "https://api.polza.ai/api/v1",
  apiKey: process.env.POLZA_AI_API_KEY,
});

export interface ResumeAnalysis {
  score: number;
  feedbackItems: {
    title: string;
    description: string;
    isPositive: boolean;
  }[];
}

export interface TestRecommendations {
  overallFeedback: string;
  recommendations: {
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }[];
  suggestedResources: {
    title: string;
    type: string;
  }[];
}

export async function analyzeResume(resumeText: string, sphere: string): Promise<ResumeAnalysis> {
  const sphereNames: Record<string, string> = {
    product: "Продакт дизайн",
    uxui: "UX/UI дизайн",
    graphic: "Графический дизайн",
    "3d": "3D дизайн",
    motion: "Моушн дизайн",
  };

  const sphereName = sphereNames[sphere] || sphere;

  const prompt = `Ты HR-эксперт и карьерный консультант для дизайнеров. Проанализируй резюме дизайнера в сфере "${sphereName}".

Резюме:
${resumeText}

Оцени резюме по шкале от 0 до 100 и дай детальную обратную связь.

Ответь в формате JSON:
{
  "score": <число от 0 до 100>,
  "feedbackItems": [
    {
      "title": "<короткий заголовок пункта>",
      "description": "<подробное описание на 1-2 предложения>",
      "isPositive": <true если это сильная сторона, false если зона роста>
    }
  ]
}

Дай 4-6 пунктов обратной связи (как положительных, так и отрицательных). Сначала положительные, потом отрицательные.
Отвечай только JSON, без дополнительного текста.`;

  try {
    const completion = await polzaAI.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: Math.min(100, Math.max(0, parsed.score || 50)),
        feedbackItems: parsed.feedbackItems || [],
      };
    }
  } catch (error) {
    console.error("Error analyzing resume with Polza AI:", error);
  }

  return {
    score: 70,
    feedbackItems: [
      {
        title: "Анализ недоступен",
        description: "Не удалось проанализировать резюме. Попробуйте позже.",
        isPositive: false,
      },
    ],
  };
}

export interface FreeTextEvaluation {
  questionId: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface FreeTextEvaluationResult {
  evaluations: FreeTextEvaluation[];
  totalScore: number;
  maxTotalScore: number;
}

export async function evaluateFreeTextAnswers(
  sphere: string,
  answers: { questionId: string; question: string; answer: string; maxScore: number }[]
): Promise<FreeTextEvaluationResult> {
  const sphereNames: Record<string, string> = {
    product: "Продакт дизайн",
    uxui: "UX/UI дизайн",
    graphic: "Графический дизайн",
    "3d": "3D дизайн",
    motion: "Моушн дизайн",
  };

  const sphereName = sphereNames[sphere] || sphere;

  const questionsText = answers
    .map((a, i) => `${i + 1}. Вопрос: "${a.question}"\n   Ответ: "${a.answer}"\n   Максимум баллов: ${a.maxScore}`)
    .join("\n\n");

  const prompt = `Ты эксперт по дизайну в сфере "${sphereName}". Оцени ответы кандидата на открытые вопросы теста.

${questionsText}

Оцени каждый ответ по критериям:
- Полнота и глубина ответа
- Практическая применимость
- Понимание контекста и профессиональной терминологии
- Структурированность изложения

Ответь в формате JSON:
{
  "evaluations": [
    {
      "questionId": "<id вопроса>",
      "score": <число баллов от 0 до maxScore>,
      "feedback": "<краткий комментарий к оценке>"
    }
  ]
}

Будь строгим но справедливым. Пустые или нерелевантные ответы = 0 баллов.
Отвечай только JSON, без дополнительного текста.`;

  try {
    const completion = await polzaAI.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
    });

    const content = completion.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const evaluations: FreeTextEvaluation[] = (parsed.evaluations || []).map((e: any, idx: number) => {
        const answer = answers[idx];
        return {
          questionId: e.questionId || answer?.questionId || `fr-${idx + 1}`,
          score: Math.min(answer?.maxScore || 10, Math.max(0, e.score || 0)),
          maxScore: answer?.maxScore || 10,
          feedback: e.feedback || "",
        };
      });

      const totalScore = evaluations.reduce((sum, e) => sum + e.score, 0);
      const maxTotalScore = evaluations.reduce((sum, e) => sum + e.maxScore, 0);

      return { evaluations, totalScore, maxTotalScore };
    }
  } catch (error) {
    console.error("Error evaluating free text with Polza AI:", error);
  }

  // Fallback: return zero scores
  return {
    evaluations: answers.map(a => ({
      questionId: a.questionId,
      score: 0,
      maxScore: a.maxScore,
      feedback: "Не удалось оценить ответ",
    })),
    totalScore: 0,
    maxTotalScore: answers.reduce((sum, a) => sum + a.maxScore, 0),
  };
}

export async function generateTestRecommendations(
  sphere: string,
  testScore: number,
  incorrectTopics: string[]
): Promise<TestRecommendations> {
  const sphereNames: Record<string, string> = {
    product: "Продакт дизайн",
    uxui: "UX/UI дизайн",
    graphic: "Графический дизайн",
    "3d": "3D дизайн",
    motion: "Моушн дизайн",
  };

  const sphereName = sphereNames[sphere] || sphere;

  const prompt = `Ты карьерный консультант для дизайнеров. Пользователь прошёл тест по сфере "${sphereName}".

Результат теста: ${testScore}%
${incorrectTopics.length > 0 ? `Темы, в которых были ошибки: ${incorrectTopics.join(", ")}` : "Ошибок не было."}

Дай рекомендации по развитию на основе результатов теста.

Ответь в формате JSON:
{
  "overallFeedback": "<общий комментарий о результатах на 2-3 предложения>",
  "recommendations": [
    {
      "title": "<короткий заголовок рекомендации>",
      "description": "<подробное описание что изучить/улучшить>",
      "priority": "<high/medium/low>"
    }
  ],
  "suggestedResources": [
    {
      "title": "<название ресурса для обучения>",
      "type": "<книга/курс/статья/видео>"
    }
  ]
}

Дай 3-5 рекомендаций и 3-4 ресурса для обучения.
Отвечай только JSON, без дополнительного текста.`;

  try {
    const completion = await polzaAI.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        overallFeedback: parsed.overallFeedback || "",
        recommendations: parsed.recommendations || [],
        suggestedResources: parsed.suggestedResources || [],
      };
    }
  } catch (error) {
    console.error("Error generating recommendations with Polza AI:", error);
  }

  return {
    overallFeedback: "Не удалось сгенерировать рекомендации. Попробуйте позже.",
    recommendations: [],
    suggestedResources: [],
  };
}
