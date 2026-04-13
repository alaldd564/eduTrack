import json
import requests
from typing import Optional

# Ollama API 설정
OLLAMA_BASE_URL = "http://localhost:11434"
MODEL_NAME = "mistral"  # 또는 "neural-chat", "orca-mini" 등


def get_ai_recommendation(
    student_name: str,
    overall_progress: int,
    overall_understanding: int,
    weak_chapters: list[dict],
    recent_submissions: list[dict],
) -> Optional[str]:
    """
    올라마를 이용한 AI 기반 학습 추천 생성
    
    Args:
        student_name: 학생 이름
        overall_progress: 전체 진도율 (0-100)
        overall_understanding: 전체 이해도 (0-100)
        weak_chapters: 약점 단원 리스트 [{'name': '단원명', 'understanding': 50}]
        recent_submissions: 최근 과제 제출 현황 [{'title': '과제명', 'score': 80}]
    
    Returns:
        AI 생성 추천 텍스트
    """
    try:
        # 프롬프트 구성
        weak_chapters_text = "\n".join(
            [f"- {ch['name']}: 이해도 {ch['understanding']}%" for ch in weak_chapters]
        )
        recent_submissions_text = "\n".join(
            [f"- {sub['title']}: {sub.get('score', '미제출')}점" for sub in recent_submissions]
        )

        prompt = f"""학생 {student_name}의 학습 현황을 분석하여 맞춤형 학습 조언을 제공하세요:

학습 현황:
- 전체 진도율: {overall_progress}%
- 전체 이해도: {overall_understanding}%

약점 단원:
{weak_chapters_text if weak_chapters_text else "없음"}

최근 과제 제출:
{recent_submissions_text if recent_submissions_text else "없음"}

다음 형식으로 조언하세요:
1. 우선 공부할 부분 (구체적인 단원명)
2. 학습 방법 (어떻게 공부할지)
3. 목표 설정 (이 주의 목표)
4. 격려 메시지

간결하고 실질적인 조언을 주세요."""

        # 올라마 API 호출
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False,
                "temperature": 0.7,
            },
            timeout=30,
        )

        if response.status_code == 200:
            result = response.json()
            return result.get("response", "").strip()
        else:
            return None
    except Exception as e:
        print(f"Error calling Ollama: {e}")
        return None
