from datetime import datetime

from pydantic import BaseModel, ConfigDict


class VariableDefinitionResponse(BaseModel):
    id: int
    field_key: str
    display_name: str
    category: str
    description: str
    why_it_matters: str
    placeholder: str | None
    help_text: str | None
    allowed_values: list | dict | None
    unit: str | None
    min_value: float | None
    max_value: float | None
    default_value: str | None
    required_flag: bool
    editable_flag: bool
    input_type: str
    tooltip_text: str | None
    example: str | None
    formula_dependency: str | None
    output_impact: str | None
    sort_order: int | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)