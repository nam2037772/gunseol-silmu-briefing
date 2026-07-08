import { useCallback, useEffect, useMemo, useState } from 'react'

interface NewsItem {
  source: string
  category: string
  title: string
  date: string
  url: string
  tags?: string[]
}

interface Meta {
  lastFetchedAt: string
  totalItems: number
}

const ALL = '전체'

const KNOWN_CATEGORIES = ['최신공지', '정책·제도', '안전', '건설기술', '법령·고시', '공공기관', 'AI·디지털']

function parseNewsDate(value: string) {
  const parsed = new Date(`${value}T00:00:00+09:00`)
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime()
}

function formatUpdatedAt(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Seoul',
  }).format(date)
}

function NewsBoard() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [sourceFilter, setSourceFilter] = useState(ALL)
  const [categoryFilter, setCategoryFilter] = useState(ALL)
  const [keyword, setKeyword] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const load = useCallback(() => {
    setStatus('loading')
    const bust = `?t=${Date.now()}`

    Promise.all([
      fetch(`${import.meta.env.BASE_URL}data/news.json${bust}`).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      }),
      fetch(`${import.meta.env.BASE_URL}data/meta.json${bust}`)
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
    ])
      .then(([newsData, metaData]) => {
        if (!Array.isArray(newsData)) throw new Error('Invalid news data')
        setItems(newsData)
        setMeta(metaData && typeof metaData === 'object' ? metaData : null)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  const sources = useMemo(
    () => [ALL, ...new Set(items.map((item) => item.source).sort((a, b) => a.localeCompare(b, 'ko-KR')))],
    [items],
  )
  const categories = useMemo(
    () => [ALL, ...new Set([...KNOWN_CATEGORIES, ...items.map((item) => item.category)])],
    [items],
  )

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    return items
      .filter((item) => sourceFilter === ALL || item.source === sourceFilter)
      .filter((item) => categoryFilter === ALL || item.category === categoryFilter)
      .filter((item) => !q || item.title.toLowerCase().includes(q))
      .sort((a, b) => parseNewsDate(b.date) - parseNewsDate(a.date) || a.title.localeCompare(b.title, 'ko-KR'))
  }, [items, sourceFilter, categoryFilter, keyword])

  return (
    <section className="board" aria-labelledby="news-board-title">
      <div className="board__toolbar">
        <div>
          <h2 id="news-board-title" className="board__title">공식소식 목록</h2>
          <p className="board__updated">
            {meta ? `마지막 업데이트: ${formatUpdatedAt(meta.lastFetchedAt)} · ${meta.totalItems}건` : '마지막 업데이트 정보 없음'}
          </p>
        </div>
        <button type="button" className="board__refresh" onClick={() => setRefreshKey((key) => key + 1)}>
          새로고침
        </button>
      </div>

      <div className="board__filters">
        <select
          className="board__select"
          value={sourceFilter}
          onChange={(event) => setSourceFilter(event.target.value)}
          aria-label="출처 필터"
        >
          {sources.map((source) => (
            <option key={source} value={source}>
              {source === ALL ? '출처 전체' : source}
            </option>
          ))}
        </select>

        <select
          className="board__select"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          aria-label="카테고리 필터"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === ALL ? '카테고리 전체' : category}
            </option>
          ))}
        </select>

        <input
          type="text"
          className="board__search"
          placeholder="제목 키워드 검색"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          aria-label="키워드 검색"
        />
      </div>

      {status === 'loading' && <p className="board__empty">최신소식을 불러오는 중입니다.</p>}
      {status === 'error' && <p className="board__empty">최신소식을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>}
      {status === 'ready' && filtered.length === 0 && (
        <p className="board__empty">조건에 맞는 소식이 아직 없습니다.</p>
      )}

      {status === 'ready' && filtered.length > 0 && (
        <ul className="board__list">
          {filtered.map((item) => (
            <li key={item.url} className="news-card">
              <div className="news-card__meta">
                <span className="news-card__source">{item.source}</span>
                <span className="news-card__category">{item.category}</span>
                <time className="news-card__date" dateTime={item.date}>{item.date}</time>
              </div>
              <h3 className="news-card__title">{item.title}</h3>
              <a className="news-card__link" href={item.url} target="_blank" rel="noopener noreferrer">
                원문보기
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default NewsBoard
