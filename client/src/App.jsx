import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

const ALL = 'All'

export default function App() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(ALL)
  const [cart, setCart] = useState({})
  const [purchasedIds, setPurchasedIds] = useState(new Set())
  const [checkoutBusy, setCheckoutBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/courses')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load courses')
        return r.json()
      })
      .then((data) => {
        if (!cancelled) setCourses(data.courses || [])
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Network error')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const categories = useMemo(() => {
    const s = new Set(courses.map((c) => c.category))
    return [ALL, ...[...s].sort()]
  }, [courses])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return courses.filter((c) => {
      if (category !== ALL && c.category !== category) return false
      if (!q) return true
      return (
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      )
    })
  }, [courses, query, category])

  const addToCart = useCallback((course) => {
    setCart((prev) => {
      if (prev[course.id]) return prev
      return { ...prev, [course.id]: course }
    })
  }, [])

  const cartItems = useMemo(
    () => Object.values(cart),
    [cart],
  )

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, c) => sum + c.price, 0),
    [cartItems],
  )

  const checkout = useCallback(async () => {
    if (cartItems.length === 0) return
    setCheckoutBusy(true)
    try {
      for (const c of cartItems) {
        const r = await fetch('/api/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId: c.id }),
        })
        if (!r.ok) throw new Error('Purchase failed')
      }
      setPurchasedIds((prev) => {
        const next = new Set(prev)
        cartItems.forEach((c) => next.add(c.id))
        return next
      })
      setCart({})
    } catch (e) {
      setError(e.message || 'Checkout failed')
    } finally {
      setCheckoutBusy(false)
    }
  }, [cartItems])

  if (loading) {
    return (
      <div className="app">
        <p className="status" role="status">
          Loading courses…
        </p>
      </div>
    )
  }

  if (error && courses.length === 0) {
    return (
      <div className="app">
        <p className="status error" role="alert">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="site-header">
        <div>
          <h1>Course Marketplace</h1>
          <p className="meta" style={{ margin: '0.35rem 0 0' }}>
            Browse courses and buy your next skill.
          </p>
        </div>
        <span className="badge" aria-label={`${courses.length} courses`}>
          {courses.length} courses
        </span>
      </header>

      <main>
        <div className="toolbar" style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="course-search" className="visually-hidden">
            Search courses
          </label>
          <input
            id="course-search"
            className="search"
            type="search"
            placeholder="Search by title or topic…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          <div className="filters" role="group" aria-label="Category filter">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={cat === category ? 'active' : ''}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {cartItems.length > 0 && (
          <section className="cart-panel" aria-labelledby="cart-heading">
            <h2 id="cart-heading">Your cart</h2>
            <ul className="cart-list">
              {cartItems.map((c) => (
                <li key={c.id}>
                  <span>{c.title}</span>
                  <span>${c.price}</span>
                </li>
              ))}
            </ul>
            <div className="cart-total">Total: ${cartTotal}</div>
            <button
              type="button"
              className="checkout-btn"
              disabled={checkoutBusy}
              onClick={checkout}
            >
              {checkoutBusy ? 'Processing…' : 'Complete purchase'}
            </button>
          </section>
        )}

        <section aria-labelledby="catalog-heading">
          <h2 id="catalog-heading" className="visually-hidden">
            Course catalog
          </h2>
          <div className="course-grid">
            {filtered.map((c) => {
              const owned = purchasedIds.has(c.id)
              const inCart = Boolean(cart[c.id])
              return (
                <article key={c.id} className="course-card">
                  <h3>{c.title}</h3>
                  <p className="meta">
                    {c.category} · {c.hours}h
                  </p>
                  <p className="price">${c.price}</p>
                  <button
                    type="button"
                    className="buy-btn"
                    disabled={owned || inCart}
                    onClick={() => addToCart(c)}
                  >
                    {owned ? 'Owned' : inCart ? 'In cart' : 'Add to cart'}
                  </button>
                </article>
              )
            })}
          </div>
        </section>

        {purchasedIds.size > 0 && (
          <section className="purchased-section" aria-labelledby="owned-heading">
            <h2 id="owned-heading">Your library</h2>
            <div className="purchased-tags">
              {courses
                .filter((c) => purchasedIds.has(c.id))
                .map((c) => (
                  <span key={c.id} className="tag">
                    {c.title}
                  </span>
                ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
