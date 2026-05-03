import { useEffect, useRef, useState } from 'react'

const USERS_API = 'https://jsonplaceholder.typicode.com/users'

type User = {
  id: number
  name: string
  username: string
  email: string
  company: {
    name: string
    catchPhrase: string
    bs: string
  }
}

function getAvatarUrl(user: User) {
  const email = encodeURIComponent(user.email)
  return `https://i.pravatar.cc/128?u=${email}`
}

type UserListProps = {
  users: User[]
  openUserId: number | null
  onNameClick: (id: number) => void
}

function UserList({ users, openUserId, onNameClick }: UserListProps) {
  if (users.length === 0) {
    return (
      <div className="empty">
        <p className="emptyTitle">No matches</p>
      </div>
    )
  }

  return (
    <ul className="list">
      {users.map((user) => {
        const isOpen = openUserId === user.id
        const nameId = `name-${user.id}`
        const panelId = `company-${user.id}`
        return (
          <li key={user.id} className={`card${isOpen ? ' card--open' : ''}`}>
            <div className="cardMain">
              <div className="avatar avatar--photo">
                <img
                  src={getAvatarUrl(user)}
                  alt=""
                  width={40}
                  height={40}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="cardBody">
                <button
                  type="button"
                  className="cardNameBtn"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  id={nameId}
                  onClick={() => onNameClick(user.id)}
                >
                  <span className="cardNameText">{user.name}</span>
                  <span
                    className={`cardChevron${isOpen ? ' cardChevron--open' : ''}`}
                    aria-hidden="true"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
                <p className="cardMeta">{user.email}</p>
                <p className="cardMeta">@{user.username}</p>
              </div>
            </div>
            {isOpen && (
              <div
                className="companyPanel"
                id={panelId}
                role="region"
                aria-labelledby={nameId}
              >
                <div className="companyInner">
                  <p className="companyName">{user.company.name}</p>
                  <p className="companyTagline">{user.company.catchPhrase}</p>
                </div>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default function App() {
  const [users, setUsers] = useState<User[]>([])
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [openUserId, setOpenUserId] = useState<number | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchUsers() {
      setLoading(true)
      setErrorMessage(null)
      try {
        const response = await fetch(USERS_API, { signal: controller.signal })
        if (!response.ok) {
          setErrorMessage('Could not load users.')
          return
        }
        const data: User[] = await response.json()
        setUsers(data)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }
        setErrorMessage('Something went wrong. Check your connection.')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
    return () => controller.abort()
  }, [])

  function handleRetry() {
    setLoading(true)
    setErrorMessage(null)
    fetch(USERS_API)
      .then((response) => {
        if (!response.ok) {
          setErrorMessage('Could not load users.')
          return
        }
        return response.json() as Promise<User[]>
      })
      .then((data) => {
        if (data) setUsers(data)
      })
      .catch(() => {
        setErrorMessage('Something went wrong. Check your connection.')
      })
      .finally(() => setLoading(false))
  }

  const search = searchText.trim().toLowerCase()
  let listToShow = users
  if (search) {
    listToShow = users.filter((u) => u.name.toLowerCase().includes(search))
  }

  function closeSearch() {
    setSearchOpen(false)
    setSearchText('')
  }

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus()
    }
  }, [searchOpen])

  useEffect(() => {
    if (!searchOpen) return

    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setSearchText('')
      }
    }
    document.addEventListener('keydown', onEscape)
    const before = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onEscape)
      document.body.style.overflow = before
    }
  }, [searchOpen])

  function toggleUser(id: number) {
    if (openUserId === id) {
      setOpenUserId(null)
    } else {
      setOpenUserId(id)
    }
  }

  return (
    <div className="page page--frontogic">
      <div className="pageShell">
        <header className="siteHeader">
          <a href="#" className="logo" onClick={(e) => e.preventDefault()}>
            <span className="logo__accent">Fr</span>
            <span className="logo__rest">ontogic</span>
          </a>
          <div className="siteHeader__tools">
            <button
              type="button"
              className={`siteHeader__iconBtn${searchOpen ? ' siteHeader__iconBtn--active' : ''}`}
              aria-expanded={searchOpen}
              aria-controls="search-drawer"
              aria-label="Open search"
              onClick={() => {
                setMenuOpen(false)
                setSearchOpen(true)
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className="siteHeader__menuBtn"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </header>

        {errorMessage && !loading && (
          <div className="heroError" role="alert">
            <p>{errorMessage}</p>
            <button type="button" className="btnHeroOutline" onClick={handleRetry}>
              Try again
            </button>
          </div>
        )}

        <main className="hero">
          <h1 className="hero__title">
            <span className="hero__line hero__line--dark">
              Transforming Businesses
            </span>
            <span className="hero__line hero__line--blue">
              With Cutting-Edge IT
            </span>
          </h1>
          <p className="hero__sub">
            From Cloud Solutions to AI-driven Development, we provide
            high-performance technology strategies to help your business scale
            globally.
          </p>
          <div className="hero__ctas">
            <a className="btnHeroPrimary" href="#consult">
              Free Consultation
            </a>
            <a
              className="btnHeroOutline"
              href="https://frontogicdev.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Our Work
            </a>
          </div>
        </main>

        <footer className="siteFooter siteFooter--frontogic">
          <a
            className="siteLink siteLink--muted"
            href="https://frontogicdev.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            frontogic
          </a>
        </footer>
      </div>

      {menuOpen && (
        <>
          <div
            className="flyoutBackdrop"
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="flyoutMenu" aria-label="Menu">
            <button type="button" className="flyoutMenu__link">
              EN
            </button>
            <button
              type="button"
              className="flyoutMenu__link"
              onClick={() => {
                setMenuOpen(false)
                setSearchOpen(true)
              }}
            >
              Search
            </button>
            <button type="button" className="flyoutMenu__link">
              Notifications
            </button>
            <button type="button" className="flyoutMenu__link">
              Support
            </button>
            <button type="button" className="flyoutMenu__link">
              Contact Us
            </button>
          </nav>
        </>
      )}

      {searchOpen && (
        <>
          <div
            className="searchDrawer__backdrop"
            aria-hidden="true"
            onClick={closeSearch}
          />
          <div
            id="search-drawer"
            className="searchDrawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-drawer-title"
          >
            <div className="searchDrawer__header">
              <h2 id="search-drawer-title" className="searchDrawer__title">
                Search people
              </h2>
              <button
                type="button"
                className="searchDrawer__close"
                onClick={closeSearch}
                aria-label="Close search"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="searchDrawer__fieldWrap">
              <label className="srOnly" htmlFor="drawer-search">
                Search by name
              </label>
              <div className="searchField searchField--drawer">
                <span className="searchIcon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <input
                  ref={searchInputRef}
                  id="drawer-search"
                  className="searchInput searchInput--drawer"
                  type="search"
                  placeholder="How can I help?"
                  autoComplete="off"
                  spellCheck={false}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <p className="searchDrawer__hint">
                Type a name to filter the directory.
              </p>
            </div>

            <div className="searchDrawer__body">
              {!loading && !errorMessage && (
                <>
                  <span className="srOnly" aria-live="polite">
                    {search
                      ? `${listToShow.length} match${listToShow.length === 1 ? '' : 'es'}`
                      : `${users.length} people`}
                  </span>
                  <UserList
                    users={listToShow}
                    openUserId={openUserId}
                    onNameClick={toggleUser}
                  />
                </>
              )}
              {loading && (
                <div className="skeletonBlock" aria-busy="true">
                  <ul className="skeletonList">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <li key={i} className="skeletonCard">
                        <span className="skeletonAvatar" />
                        <span className="skeletonLines">
                          <span className="skeletonLine skeletonLine--short" />
                          <span className="skeletonLine skeletonLine--long" />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
