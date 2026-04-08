from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = Field(
        default="PAN India Real Estate Asking Price Projection Engine"
    )
    app_env: str = Field(default="development")
    app_version: str = Field(default="0.1.0")
    debug: bool = Field(default=True)

    api_host: str = Field(default="0.0.0.0")
    api_port: int = Field(default=9000)
    api_v1_prefix: str = Field(default="/api/v1")

    database_url: str = Field(default="sqlite:///./pan_india_price_projection.db")

    cors_allow_origins: str = Field(default="http://localhost:3000")
    cors_allow_methods: str = Field(default="*")
    cors_allow_headers: str = Field(default="*")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_allow_origins_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_allow_origins.split(",")
            if origin.strip()
        ]

    @property
    def cors_allow_methods_list(self) -> list[str]:
        return [
            method.strip()
            for method in self.cors_allow_methods.split(",")
            if method.strip()
        ]

    @property
    def cors_allow_headers_list(self) -> list[str]:
        return [
            header.strip()
            for header in self.cors_allow_headers.split(",")
            if header.strip()
        ]


settings = Settings()