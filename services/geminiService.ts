import { GoogleGenAI } from "@google/genai";
import type { RegulationFile } from "../types";

// -------------------------------------------------------------------
// VITE_GEMINI_API_KEY는 빌드 시점에 Vite에 의해 실제 키로 대체됩니다.
// 프로젝트 루트에 .env 파일을 만들고 VITE_GEMINI_API_KEY="실제-API-키" 형식으로 추가하세요.
// ⚠️ 경고: .env 파일은 절대 외부에 공유하거나 깃허브에 올리면 안 됩니다.
// -------------------------------------------------------------------
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY || API_KEY === "여기에-실제-GEMINI-API-키를-붙여넣으세요") {
  alert("경고: Gemini API 키가 설정되지 않았습니다. .env 파일을 확인해주세요. 챗봇이 작동하지 않을 수 있습니다.");
  console.error("VITE_GEMINI_API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getChatbotResponse = async (question: string, regulations: RegulationFile[]): Promise<string> => {
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
    return "죄송합니다, 답변을 생성하는 중에 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};
