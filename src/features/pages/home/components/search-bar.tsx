'use client'

import { FormEvent, useState } from 'react'
import { Clock3, LoaderCircle, Search, TrendingUp } from 'lucide-react'

const recentSearches = [
    'https://www.youtube.com/watch?v=PgUXiprlg1k',
    'https://www.youtube.com/watch?v=z2fcWdoph4U',
    'https://www.youtube.com/watch?v=HFaxylC7bUc',
]

const popularChannels = [
    { name: 'freeCodeCamp.org', handle: '@freecodecamp', subscribers: '1.9M subscribers' },
    { name: 'Traversy Media', handle: '@TraversyMedia', subscribers: '2.42M subscribers' },
]

interface ChannelSearchProps {
    onSearch: (url: string) => void
    isRunning?: boolean
}

export function ChannelSearch({ onSearch, isRunning = false }: ChannelSearchProps) {
    const [query, setQuery] = useState('')
    const [focused, setFocused] = useState(false)

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (query.trim()) onSearch(query.trim())
        setFocused(false)
    }

    function chooseSuggestion(value: string) {
        setQuery(value)
        onSearch(value)
        setFocused(false)
    }

    const showSuggestions = focused && !isRunning

    return (
        <div className="relative mx-auto max-w-full">
            <form onSubmit={handleSubmit} className="relative mx-auto mt-9 max-w-2xl">
                <div className={`flex items-center gap-2 rounded-full border bg-background p-1.5 transition ${focused ? 'border-accent shadow-lg shadow-accent/10' : 'border-border hover:border-muted-foreground/50'}`}>
                    <Search aria-hidden="true" className="ml-3 size-4 shrink-0 text-muted-foreground" />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setTimeout(() => setFocused(false), 150)}
                        placeholder="Paste a YouTube video URL..."
                        aria-label="Paste a YouTube video URL"
                        disabled={isRunning}
                        className="min-w-125 flex-1 bg-transparent px-1 py-3 text-left text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!query.trim() || isRunning}
                        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isRunning ? (
                            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                        ) : (
                            <Search aria-hidden="true" className="size-4" />
                        )}
                        {isRunning ? "Working..." : "Search"}
                    </button>
                </div>

                {showSuggestions && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-3 overflow-hidden rounded-2xl border border-border bg-card text-left shadow-xl">
                        <div className="p-3">
                            <p className="flex items-center gap-2 px-2 pb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"><Clock3 aria-hidden="true" className="size-3" /> Recent</p>
                            {recentSearches.map((item) => <button key={item} type="button" onMouseDown={() => chooseSuggestion(item)} className="block w-full truncate rounded-lg px-2 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground">{item}</button>)}
                        </div>
                        <div className="border-t border-border p-3">
                            <p className="flex items-center gap-2 px-2 pb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"><TrendingUp aria-hidden="true" className="size-3" /> Popular channels</p>
                            {popularChannels.map((channel) => <button key={channel.handle} type="button" onMouseDown={() => chooseSuggestion(`https://www.youtube.com/${channel.handle}`)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-secondary"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">{channel.name[0]}</span><span className="min-w-0"><span className="block truncate text-sm font-medium text-foreground">{channel.name}</span><span className="block truncate text-xs text-muted-foreground">{channel.handle} · {channel.subscribers}</span></span></button>)}
                        </div>
                    </div>
                )}
            </form>

            {isRunning && (
                <p className="mt-4 text-xs text-muted-foreground">
                    Fetching transcript, summarizing, and building your exercise...
                </p>
            )}
        </div>
    )
}

export default ChannelSearch
