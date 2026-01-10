"""Knowledge base for storing and retrieving learned patterns."""

from typing import Any

from sqlalchemy import Column, Integer, String, Float, Text, JSON
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from config.settings import settings

Base = declarative_base()


class CodePattern(Base):
    """Stored code patterns learned from successful executions."""

    __tablename__ = "code_patterns"

    id = Column(Integer, primary_key=True, index=True)
    pattern_type = Column(String(100), nullable=False, index=True)
    code = Column(Text, nullable=False)
    description = Column(Text)
    usage_count = Column(Integer, default=0)
    success_rate = Column(Float, default=1.0)
    metadata = Column(JSON, default={})
    context = Column(Text)  # Context where this pattern is useful


class Solution(Base):
    """Stored solutions to common problems."""

    __tablename__ = "solutions"

    id = Column(Integer, primary_key=True, index=True)
    problem_type = Column(String(100), nullable=False, index=True)
    solution = Column(Text, nullable=False)
    description = Column(Text)
    effectiveness_score = Column(Float, default=1.0)
    usage_count = Column(Integer, default=0)
    metadata = Column(JSON, default={})


class UserPreference(Base):
    """User preferences learned from interactions."""

    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    preference_type = Column(String(100), nullable=False, index=True)
    value = Column(String(500), nullable=False)
    confidence = Column(Float, default=0.5)
    metadata = Column(JSON, default={})


class KnowledgeBase:
    """Knowledge base for storing and retrieving learned information."""

    def __init__(self, db_url: str | None = None) -> None:
        """Initialize knowledge base."""
        self.engine = create_async_engine(
            db_url or settings.database_url,
            echo=False,
        )
        self.async_session = sessionmaker(
            self.engine, class_=AsyncSession, expire_on_commit=False
        )

    async def initialize(self) -> None:
        """Initialize database tables."""
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    async def add_pattern(
        self,
        pattern_type: str,
        code: str,
        description: str,
        context: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> CodePattern:
        """Add a new code pattern to knowledge base."""
        async with self.async_session() as session:
            pattern = CodePattern(
                pattern_type=pattern_type,
                code=code,
                description=description,
                context=context,
                metadata=metadata or {},
            )
            session.add(pattern)
            await session.commit()
            await session.refresh(pattern)
            return pattern

    async def search_patterns(
        self,
        pattern_type: str | None = None,
        min_success_rate: float = 0.0,
        limit: int = 10,
    ) -> list[CodePattern]:
        """Search for patterns matching criteria."""
        async with self.async_session() as session:
            query = session.query(CodePattern)

            if pattern_type:
                query = query.filter(CodePattern.pattern_type == pattern_type)

            query = query.filter(CodePattern.success_rate >= min_success_rate)
            query = query.order_by(CodePattern.success_rate.desc(), CodePattern.usage_count.desc())
            query = query.limit(limit)

            result = await session.execute(query)
            return result.scalars().all()

    async def update_pattern_success(
        self,
        pattern_id: int,
        success: bool,
    ) -> None:
        """Update pattern success statistics."""
        async with self.async_session() as session:
            pattern = await session.get(CodePattern, pattern_id)
            if pattern:
                pattern.usage_count += 1
                total_score = pattern.success_rate * (pattern.usage_count - 1)
                pattern.success_rate = (total_score + (1 if success else 0)) / pattern.usage_count
                await session.commit()

    async def add_solution(
        self,
        problem_type: str,
        solution: str,
        description: str,
        metadata: dict[str, Any] | None = None,
    ) -> Solution:
        """Add a new solution to knowledge base."""
        async with self.async_session() as session:
            sol = Solution(
                problem_type=problem_type,
                solution=solution,
                description=description,
                metadata=metadata or {},
            )
            session.add(sol)
            await session.commit()
            await session.refresh(sol)
            return sol

    async def search_solutions(
        self,
        problem_type: str | None = None,
        limit: int = 10,
    ) -> list[Solution]:
        """Search for solutions."""
        async with self.async_session() as session:
            query = session.query(Solution)

            if problem_type:
                query = query.filter(Solution.problem_type == problem_type)

            query = query.order_by(
                Solution.effectiveness_score.desc(), Solution.usage_count.desc()
            )
            query = query.limit(limit)

            result = await session.execute(query)
            return result.scalars().all()

    async def update_solution_effectiveness(
        self,
        solution_id: int,
        was_helpful: bool,
    ) -> None:
        """Update solution effectiveness."""
        async with self.async_session() as session:
            solution = await session.get(Solution, solution_id)
            if solution:
                solution.usage_count += 1
                total_score = solution.effectiveness_score * (solution.usage_count - 1)
                solution.effectiveness_score = (
                    total_score + (1 if was_helpful else 0)
                ) / solution.usage_count
                await session.commit()

    async def set_preference(
        self,
        preference_type: str,
        value: str,
        confidence: float = 0.5,
        metadata: dict[str, Any] | None = None,
    ) -> UserPreference:
        """Set a user preference."""
        async with self.async_session() as session:
            pref = UserPreference(
                preference_type=preference_type,
                value=value,
                confidence=confidence,
                metadata=metadata or {},
            )
            session.add(pref)
            await session.commit()
            await session.refresh(pref)
            return pref

    async def get_preferences(
        self,
        preference_type: str | None = None,
    ) -> list[UserPreference]:
        """Get user preferences."""
        async with self.async_session() as session:
            query = session.query(UserPreference)

            if preference_type:
                query = query.filter(UserPreference.preference_type == preference_type)

            query = query.order_by(UserPreference.confidence.desc())

            result = await session.execute(query)
            return result.scalars().all()
