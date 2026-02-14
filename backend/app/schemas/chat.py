from typing import Annotated

from pydantic import BaseModel, StringConstraints


class ChatInput(BaseModel):
    question: Annotated[
        str,
        StringConstraints(strip_whitespace=True, min_length=1, max_length=1000),
    ]


class ChatResponse(BaseModel):
    answer: str
