from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # GLM API
    glm_api_key: str
    glm_model: str = "glm-4"
    glm_base_url: str = "https://open.bigmodel.cn/api/paas/v4"

    # Database
    database_url: str = "sqlite+aiosqlite:///./knowledge_base.db"

    # Agent Settings
    max_iterations: int = 100
    learning_enabled: bool = True
    autonomy_level: str = "medium"

    # Security
    allowed_commands: str = "git,npm,pnpm,yarn,python,pytest,node"
    sandbox_mode: bool = False

    # UI
    ui_mode: str = "terminal"
    log_level: str = "INFO"

    @property
    def allowed_commands_list(self) -> list[str]:
        """Parse allowed commands into list."""
        return [cmd.strip() for cmd in self.allowed_commands.split(",")]


settings = Settings()
