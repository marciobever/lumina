// components/Pagination.tsx
import Link from 'next/link'

export default function Pagination({
  page,
  hasNext,
}: {
  page: number
  hasNext: boolean
}) {
  const prevPage = Math.max(1, page - 1)
  const nextPage = page + 1

  return (
    <nav className="pager">
      <Link
        href={`/perfis?page=${prevPage}`}
        aria-disabled={page <= 1}
        className={`pager-btn ${page <= 1 ? 'is-disabled' : ''}`}
      >
        ← Anterior
      </Link>

      <span className="pager-info">
        Página <strong>{page}</strong>
      </span>

      <Link
        href={`/perfis?page=${nextPage}`}
        aria-disabled={!hasNext}
        className={`pager-btn ${!hasNext ? 'is-disabled' : ''}`}
      >
        Próxima →
      </Link>
    </nav>
  )
}