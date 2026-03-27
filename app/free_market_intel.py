from __future__ import annotations

import datetime as dt
import math
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import quote_plus
from xml.etree import ElementTree

import httpx

from app.utils import clamp


NEWS_KEYWORDS = {
    "fuel": ["fuel", "lpg", "gas", "petrol", "diesel", "energy"],
    "supply": ["shortage", "disruption", "port", "shipping", "logistics", "supply chain"],
    "demand": ["demand", "sales", "surge", "adoption", "switch"],
    "stress": ["inflation", "price rise", "affordability", "cost of living", "recession"],
    "volatility": ["war", "conflict", "sanction", "uncertainty", "volatility", "crisis"],
    "regulatory": ["regulation", "policy", "tax", "gst", "law", "ban", "compliance", "government"],
    "tech": ["tech", "ai", "innovation", "adoption", "digital", "modernization", "infrastructure"],
}


POSITIVE_TOKENS = {"growth", "surge", "up", "rise", "improving", "boost", "record"}
NEGATIVE_TOKENS = {"drop", "fall", "risk", "fear", "shortage", "crisis", "inflation", "war"}


@dataclass
class SourceDecision:
    google_news: bool
    reddit_rss: bool
    wiki_pageviews: bool
    pytrends: bool


def _source_selector(config: Dict[str, Any]) -> SourceDecision:
    scenario_tag = config["market"].get("scenario_tag", "stable_market")
    product = config["product"].get("name", "")

    use_news = True
    use_reddit = scenario_tag in {"geopolitical_crisis", "supply_chain_disruption", "energy_crisis", "recession"}
    use_wiki = True
    use_pytrends = bool(product)

    return SourceDecision(
        google_news=use_news,
        reddit_rss=use_reddit,
        wiki_pageviews=use_wiki,
        pytrends=use_pytrends,
    )


def _fetch_google_news(query: str, max_items: int = 20) -> List[str]:
    url = f"https://news.google.com/rss/search?q={quote_plus(query)}&hl=en-IN&gl=IN&ceid=IN:en"
    try:
        response = httpx.get(url, timeout=12.0)
        response.raise_for_status()
        root = ElementTree.fromstring(response.text)
    except Exception:
        return []

    texts: List[str] = []
    for item in root.findall(".//item")[:max_items]:
        title = (item.findtext("title") or "").strip()
        desc = (item.findtext("description") or "").strip()
        combined = f"{title}. {desc}".strip()
        if combined:
            texts.append(combined.lower())
    return texts


def _fetch_reddit_rss(query: str, max_items: int = 20) -> List[str]:
    url = f"https://www.reddit.com/search.rss?q={quote_plus(query)}&sort=new"
    headers = {"User-Agent": "tcd-gcgc-simulator/1.0"}
    try:
        response = httpx.get(url, timeout=12.0, headers=headers)
        response.raise_for_status()
        root = ElementTree.fromstring(response.text)
    except Exception:
        return []

    entries = root.findall(".//{http://www.w3.org/2005/Atom}entry")
    texts: List[str] = []
    for entry in entries[:max_items]:
        title = (entry.findtext("{http://www.w3.org/2005/Atom}title") or "").strip()
        content = (entry.findtext("{http://www.w3.org/2005/Atom}content") or "").strip()
        combined = f"{title}. {content}".strip()
        if combined:
            texts.append(combined.lower())
    return texts


def _fetch_wikipedia_pageviews(product: str) -> Tuple[float, bool]:
    normalized = quote_plus(product.replace(" ", "_"))
    now_utc = dt.datetime.now(dt.UTC)
    end = now_utc.strftime("%Y%m%d")
    start = (now_utc - dt.timedelta(days=14)).strftime("%Y%m%d")
    url = (
        "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/"
        f"en.wikipedia/all-access/user/{normalized}/daily/{start}/{end}"
    )
    try:
        response = httpx.get(url, timeout=12.0)
        response.raise_for_status()
        data = response.json()
    except Exception:
        return 0.5, False

    items = data.get("items", []) if isinstance(data, dict) else []
    if len(items) < 3:
        return 0.5, False

    values = [float(x.get("views", 0)) for x in items if isinstance(x, dict)]
    if not values:
        return 0.5, False

    recent = sum(values[-7:]) / max(1, min(7, len(values)))
    past = sum(values[:-7]) / max(1, len(values[:-7])) if len(values) > 7 else recent
    if past <= 0:
        return 0.5, False
    growth = (recent - past) / past
    return clamp(0.5 + growth), True


def _fetch_pytrends_signal(keywords: List[str]) -> Tuple[float, bool]:
    try:
        from pytrends.request import TrendReq  # type: ignore
    except Exception:
        return 0.5, False

    try:
        pytrends = TrendReq(hl="en-US", tz=330)
        pytrends.build_payload(keywords[:5], timeframe="now 7-d", geo="")
        interest = pytrends.interest_over_time()
        if interest.empty:
            return 0.5, False
        last_row = interest.tail(1)
        vals = [float(last_row[k].iloc[0]) for k in keywords[:5] if k in last_row.columns]
        if not vals:
            return 0.5, False
        return clamp(sum(vals) / (len(vals) * 100.0)), True
    except Exception:
        return 0.5, False


def _count_keywords(texts: List[str], words: List[str]) -> int:
    if not texts:
        return 0
    pattern = re.compile("|".join(re.escape(w) for w in words), re.IGNORECASE)
    return sum(len(pattern.findall(t)) for t in texts)


def _sentiment_score(texts: List[str]) -> float:
    if not texts:
        return 0.5
    pos = 0
    neg = 0
    for text in texts:
        tokens = re.findall(r"[a-zA-Z_]+", text.lower())
        pos += sum(1 for t in tokens if t in POSITIVE_TOKENS)
        neg += sum(1 for t in tokens if t in NEGATIVE_TOKENS)
    total = pos + neg
    if total == 0:
        return 0.5
    return clamp((pos - neg) / total * 0.5 + 0.5)


def _intensity(count: int, scale: float) -> float:
    return clamp(math.tanh(count / max(scale, 1.0)))


def _build_query(config: Dict[str, Any]) -> str:
    product = config["product"].get("name", "product")
    region = config["market"].get("region", "GLOBAL")
    scenario = config["market"].get("raw_scenario", "")
    return f"{product} {region} {scenario}".strip()


def fetch_free_market_intel(config: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    decision = _source_selector(config)
    query = _build_query(config)
    texts: List[str] = []
    sources_used: List[str] = []

    if decision.google_news:
        news = _fetch_google_news(query)
        if news:
            texts.extend(news)
            sources_used.append("google_news_rss")

    if decision.reddit_rss:
        reddit = _fetch_reddit_rss(query)
        if reddit:
            texts.extend(reddit)
            sources_used.append("reddit_rss")

    if not texts and not decision.wiki_pageviews and not decision.pytrends:
        return None

    fuel_hits = _count_keywords(texts, NEWS_KEYWORDS["fuel"])
    supply_hits = _count_keywords(texts, NEWS_KEYWORDS["supply"])
    demand_hits = _count_keywords(texts, NEWS_KEYWORDS["demand"])
    stress_hits = _count_keywords(texts, NEWS_KEYWORDS["stress"])
    volatility_hits = _count_keywords(texts, NEWS_KEYWORDS["volatility"])
    reg_hits = _count_keywords(texts, NEWS_KEYWORDS["regulatory"])
    tech_hits = _count_keywords(texts, NEWS_KEYWORDS["tech"])

    sentiment = _sentiment_score(texts)
    if decision.wiki_pageviews:
        wiki_signal, wiki_used = _fetch_wikipedia_pageviews(config["product"].get("name", ""))
    else:
        wiki_signal, wiki_used = 0.5, False
    if wiki_used:
        sources_used.append("wikipedia_pageviews")

    if decision.pytrends:
        trend_signal, trends_used = _fetch_pytrends_signal(
            [config["product"].get("name", ""), "fuel price", "shortage", "inflation"]
        )
    else:
        trend_signal, trends_used = 0.5, False
    if trends_used:
        sources_used.append("google_trends")

    market = {
        "fuel_price_index": clamp(0.35 + _intensity(fuel_hits, 18.0) * 0.55),
        "supply_disruption": clamp(0.2 + _intensity(supply_hits, 16.0) * 0.75),
        "demand_shift": clamp(0.3 + _intensity(demand_hits, 20.0) * 0.4 + 0.3 * wiki_signal + 0.2 * trend_signal),
        "market_volatility": clamp(0.25 + _intensity(volatility_hits, 16.0) * 0.7),
        "price_sensitivity": clamp(0.35 + _intensity(stress_hits, 18.0) * 0.6),
        "market_pressure": clamp(0.2 + 0.35 * _intensity(supply_hits + volatility_hits, 20.0) + 0.2 * _intensity(stress_hits, 18.0)),
        "consumer_stress": clamp(0.25 + _intensity(stress_hits, 18.0) * 0.6 + (0.5 - sentiment) * 0.2),
        "regulatory_risk": clamp(0.15 + _intensity(reg_hits, 10.0) * 0.8),
        "tech_maturity": clamp(0.4 + _intensity(tech_hits, 15.0) * 0.5 + 0.1 * wiki_signal),
        "sentiment_hype": clamp(sentiment * 0.7 + _intensity(demand_hits, 20.0) * 0.3),
    }

    if not texts and all(s in {"wikipedia_pageviews", "google_trends"} for s in sources_used):
        # Too little real-time narrative context, return None so fallback remains primary.
        return None

    key_events: List[str] = []
    if fuel_hits > 0:
        key_events.append("Fuel and energy pricing mentions are elevated in recent coverage.")
    if supply_hits > 0:
        key_events.append("Supply chain disruption signals detected in news/social feeds.")
    if demand_hits > 0:
        key_events.append("Demand-shift indicators appear in live headlines and discussions.")
    if stress_hits > 0:
        key_events.append("Affordability and inflation concerns are present in current discourse.")
    if not key_events:
        key_events.append("Live feeds show mixed but stable market signals.")

    summary = (
        "Live market snapshot built from free sources: "
        + ", ".join(sorted(set(sources_used)))
        + ". "
        + f"Sentiment signal is {sentiment:.2f} with demand signal {market['demand_shift']:.2f}."
    )

    return {**market, "summary": summary, "key_events": key_events[:5], "sources_used": sorted(set(sources_used))}
