import { GoogleGenAI } from "@google/genai";
import type { RegulationFile } from "../types";

// --- API 키 설정 ---
// 아래 'YOUR_API_KEY' 부분을 실제 발급받은 Gemini API 키로 교체해주세요.
// 중요: 이 키는 외부에 노출되지 않도록 주의해야 합니다.
// 인트라넷과 같이 통제된 환경에서 사용하시는 것을 감안하여 수정했지만,
// 일반 웹에 배포할 경우 보안을 위해 서버 측에서 API를 호출하거나 Vite의 환경 변수 기능을 사용하는 것을 강력히 권장합니다.
const API_KEY = 'AIzaSyAWn0o_RguVg3VIrH7_tS4wEfCZfj1mc_Q';

// API 키가 설정되었는지 확인
if (!API_KEY || API_KEY === 'YOUR_API_KEY') {
  console.error("Gemini API 키가 설정되지 않았습니다. services/geminiService.ts 파일에서 API_KEY를 설정해주세요.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getChatbotResponse = async (question: string, regulations: RegulationFile[]): Promise<string> => {
  // 함수 호출 시점에서도 API 키 유효성 검사
  if (!API_KEY || API_KEY === 'YOUR_API_KEY') {
    return "API 키가 설정되지 않았습니다. 관리자에게 문의하거나 `services/geminiService.ts` 파일에서 API 키를 직접 설정해주세요.";
  }

  const model = 'gemini-2.5-flash';

  const regulationsContext = regulations.map(reg => `--- 문서: ${reg.name} ${reg.link ? `(링크: ${reg.link})` : ''} ---\n${reg.content}`).join('\n\n');

  const systemInstruction = `너는 직원들을 돕는 친절하고 상냥한 AI 동료 '생활백서봇'이야.
- 주어진 사내 규정 문서의 내용만을 바탕으로 질문에 답해줘.
- 항상 친절하고 이해하기 쉽게 설명해주는 게 중요해. 말투는 항상 '~해요', '~니다'체를 사용해줘.
- 만약 문서에 없는 내용을 물어보면, "제가 찾아봤는데, 그 내용은 규정 문서에 나와있지 않네요. 😅" 라고 솔직하고 부드럽게 말해줘.
- 답변의 근거가 되는 규정의 출처(문서명, 조, 항 등)를 명확하게 밝혀줘. 출처는 답변의 맨 마지막 줄에 표기해줘.
- 출처 표기 형식은 아래 규칙을 반드시 따라야 해.
  - 링크가 없는 경우: "출처: 문서명 제 O조 O항"
  - 링크가 있는 경우: "출처: 문서명 제 O조 O항 <strong><a href="링크 주소" target="_blank" rel="noopener noreferrer" style="text-decoration: underline;">[LINK]</a></strong>"
- 중요한 점: 링크의 <a> 태그는 '[LINK]' 텍스트에만 적용하고, '출처: ...' 부분에는 절대 링크를 걸지 마.
- 답변을 꾸밀 때는 <strong> 태그만 사용해서 중요한 부분을 강조할 수 있어. 절대로 ** 와 같은 마크다운은 사용하지 마.
- 목록을 표시해야 할 경우, 각 항목 앞에 하이픈(-)과 공백을 붙여서 일반 텍스트 줄로 만들어줘. 예를 들어, "- 첫 번째 항목". 절대로 <ul>이나 <li> 태그는 사용하지 마.`;
  
  const contents = `
[사내 규정 문서]
${regulationsContext}
---
[사용자 질문]
${question}
`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
      },
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
       return "API 키가 올바르지 않은 것 같습니다. `services/geminiService.ts` 파일에서 키를 다시 확인해주세요.";
    }
    return "죄송합니다, 답변을 생성하는 중에 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};
