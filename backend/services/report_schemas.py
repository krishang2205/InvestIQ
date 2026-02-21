from pydantic import BaseModel, Field
from typing import List, Optional

class StatusPill(BaseModel):
    label: str
    value: str
    type: str

class ExecutiveSummary(BaseModel):
    status: List[StatusPill]
    text: str

class SnapshotMetric(BaseModel):
    label: str
    value: str

class Snapshot(BaseModel):
    description: str
    domains: List[str]
    key_metrics: List[SnapshotMetric]

class ChartDataPoint(BaseModel):
    date: str
    price: float

class PriceBehavior(BaseModel):
    chartData: List[ChartDataPoint]
    interpretation: str

class TechnicalSignal(BaseModel):
    name: str
    status: str
    text: str

class SentimentPhase(BaseModel):
    score: int
    text: str

class ExplainabilityFactor(BaseModel):
    name: str
    value: int

class Explainability(BaseModel):
    factors: List[ExplainabilityFactor]
    text: str

class PeerStock(BaseModel):
    name: str
    price: str
    pe: str
    roe: str
    revenue: str

class StrategicOutlook(BaseModel):
    shortTerm: str
    longTerm: str

class AIReportResponse(BaseModel):
    version: str = "1.0"
    symbol: str
    company_name: str
    generated_at: str
    snapshot: Snapshot
    executiveSummary: ExecutiveSummary
    priceBehavior: PriceBehavior
    technicalSignals: List[TechnicalSignal]
    sentiment: SentimentPhase
    explainability: Explainability
    peerComparison: List[PeerStock]
    outlook: StrategicOutlook
