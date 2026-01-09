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
  isGibberish?: boolean;
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

  const prompt = `Ты — Head of Design с 15+ годами опыта в ${sphereName}. Твоя задача — оценить ответы кандидата на открытые вопросы теста.

${questionsText}

ВАЖНЫЕ ПРАВИЛА ОЦЕНКИ:
1. Если ответ содержит случайные буквы, бессмысленный набор символов, или не имеет отношения к вопросу — это 0 баллов. Укажи в feedback: "Ответ не содержит осмысленного содержания. Это засчитывается как незнание темы."
2. Если ответ слишком короткий (менее 20 символов) — максимум 20% от maxScore.
3. Если ответ поверхностный без конкретики — максимум 40% от maxScore.

Критерии оценки качественных ответов:
- Полнота и глубина (понимает ли кандидат суть?)
- Практическая применимость (приводит ли примеры из практики?)
- Профессиональная терминология (использует ли правильные термины?)
- Структурированность (логично ли изложено?)

Ответь в формате JSON:
{
  "evaluations": [
    {
      "questionId": "<id вопроса>",
      "score": <число баллов от 0 до maxScore>,
      "feedback": "<развёрнутый комментарий: что хорошо, что плохо, что нужно изучить>",
      "isGibberish": <true если ответ бессмысленный/случайные символы, false иначе>
    }
  ]
}

Будь строгим как настоящий Head of Design на собеседовании.
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
          isGibberish: e.isGibberish || false,
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
  incorrectTopics: string[],
  gibberishAnswers: string[] = []
): Promise<TestRecommendations> {
  const sphereNames: Record<string, string> = {
    product: "Продакт дизайн",
    uxui: "UX/UI дизайн",
    graphic: "Графический дизайн",
    "3d": "3D дизайн",
    motion: "Моушн дизайн",
  };

  const sphereName = sphereNames[sphere] || sphere;

  const gibberishInfo = gibberishAnswers.length > 0 
    ? `\n\nВНИМАНИЕ: Кандидат вводил бессмысленные ответы (случайные буквы/символы) на следующие вопросы: ${gibberishAnswers.join(", ")}. Это показывает либо несерьёзное отношение, либо полное незнание темы. Укажи это в оценке.`
    : "";

  const prompt = `Ты — Head of Design с 15+ годами опыта в ${sphereName}. Ты только что провёл собеседование с кандидатом и оценил его тест.

Результат теста: ${testScore}%
${incorrectTopics.length > 0 ? `Темы, в которых были ошибки или некачественные ответы: ${incorrectTopics.join(", ")}` : "Ошибок не было."}${gibberishInfo}

ТВОЯ ЗАДАЧА:
1. Дать честную оценку уровня кандидата
2. Указать конкретные пробелы в знаниях
3. Дать пошаговый план развития с конкретными действиями
4. Порекомендовать реальные ресурсы для обучения

ВАЖНО:
- Если результат < 30% — кандидат слаб, нужна базовая подготовка
- Если были бессмысленные ответы — укажи, что это показывает незнание материала
- Будь конкретным: не "изучи UX", а "изучи методы юзабилити-тестирования: A/B тесты, коридорные тесты, think-aloud протокол"

Ответь в формате JSON:
{
  "overallFeedback": "<честная оценка уровня кандидата и его перспектив на 3-4 предложения>",
  "recommendations": [
    {
      "title": "<конкретная тема для изучения>",
      "description": "<что именно изучить, какие навыки отработать, какие инструменты освоить>",
      "priority": "<high/medium/low>"
    }
  ],
  "suggestedResources": [
    {
      "title": "<реальное название книги/курса/ресурса>",
      "type": "<книга/курс/статья/видео>"
    }
  ]
}

Дай 3-5 рекомендаций (по приоритету) и 3-4 проверенных ресурса.
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
