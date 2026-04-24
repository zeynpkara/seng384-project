from pydantic import BaseModel


class MessageResponse(BaseModel):
    message: str


class PaginationMeta(BaseModel):
    page: int
    limit: int
    total: int
    pages: int
