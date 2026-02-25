import pytest
from unittest.mock import patch, AsyncMock
from app.llm_service import breakdown_task, chat_with_buddy

class TestBreakdownTask:
    @pytest.mark.asyncio
    async def test_breakdown_task_success(self):
        mock_response = '''```json
{
    "subtasks": ["Step 1", "Step 2", "Step 3"],
    "encouragement": "You got this!"
}
```'''
        with patch('app.llm_service.call_llm', new_callable=AsyncMock) as mock_llm:
            mock_llm.return_value = mock_response
            result = await breakdown_task("Clean the house")
            assert "subtasks" in result
            assert "encouragement" in result
            assert len(result["subtasks"]) == 3
    
    @pytest.mark.asyncio
    async def test_breakdown_task_fallback_on_error(self):
        with patch('app.llm_service.call_llm', new_callable=AsyncMock) as mock_llm:
            mock_llm.side_effect = Exception("LLM error")
            result = await breakdown_task("Test task")
            # Should return fallback
            assert "subtasks" in result
            assert "encouragement" in result
            assert len(result["subtasks"]) > 0

class TestChatWithBuddy:
    @pytest.mark.asyncio
    async def test_chat_success(self):
        with patch('app.llm_service.call_llm', new_callable=AsyncMock) as mock_llm:
            mock_llm.return_value = "Great job! Keep going! 🎉"
            result = await chat_with_buddy("I finished my task!")
            assert "response" in result
            assert "encouragement" in result
    
    @pytest.mark.asyncio
    async def test_chat_fallback_on_error(self):
        with patch('app.llm_service.call_llm', new_callable=AsyncMock) as mock_llm:
            mock_llm.side_effect = Exception("LLM error")
            result = await chat_with_buddy("Hello")
            # Should return fallback
            assert "response" in result
            assert "encouragement" in result
