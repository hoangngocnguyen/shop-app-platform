from pydantic import BaseModel


class ProvinceResponse(BaseModel):
    code: str
    name: str


class WardResponse(BaseModel):
    code: str
    name: str
