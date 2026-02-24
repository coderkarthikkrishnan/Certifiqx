/**
 * UserAvatar — shows photoURL if available, generic person icon otherwise.
 * Props:
 *   photoURL  – string | null
 *   name      – string (used for alt text only)
 *   size      – number (px, default 38)
 *   style     – extra inline styles for the wrapper
 *   className – extra class for the wrapper
 */
export default function UserAvatar({ photoURL, name = 'User', size = 38, style = {}, className = '' }) {
    const base = {
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--c-bg)',
        border: '1px solid var(--c-border)',
        ...style,
    }

    if (photoURL) {
        return (
            <div style={base} className={className}>
                <img
                    src={photoURL}
                    alt={name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={(e) => {
                        // If image fails to load, swap to fallback icon
                        e.target.style.display = 'none'
                        e.target.parentElement.setAttribute('data-fallback', '1')
                    }}
                />
            </div>
        )
    }

    // Generic person silhouette
    return (
        <div style={base} className={className}>
            <svg
                viewBox="0 0 24 24"
                fill="none"
                style={{ width: '60%', height: '60%', color: 'var(--c-text-faint)' }}
                stroke="currentColor"
                strokeWidth={1.5}
            >
                <circle cx="12" cy="8" r="3.5" />
                <path
                    strokeLinecap="round"
                    d="M4.5 20.5c0-4.142 3.358-7.5 7.5-7.5s7.5 3.358 7.5 7.5"
                />
            </svg>
        </div>
    )
}
