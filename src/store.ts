import type {API, LinkSession} from 'anchor-link'
import {derived, writable} from 'svelte/store'
import {loadAccount} from './account-cache'
import type {SessionLike} from './auth'

/** Set to true when app initialization completes. */
export const appReady = writable<boolean>(false)

/** Active anchor link session, aka logged in user. */
export const activeSession = writable<LinkSession | null>(null)

/** List of all available anchor link sessions. */
export const availableSessions = writable<SessionLike[]>([])

/** Current logged in users account. */
export const currentAccount = derived<typeof activeSession, API.v1.AccountObject | null>(
    activeSession,
    (session, set) => {
        if (!session) {
            set(null)
            return
        }
        let active = true
        loadAccount(session.auth.actor, session.chainId, (v) => {
            if (active) {
                set(v.account || null)
            }
        })
        return () => {
            active = false
        }
    },
    null
)
