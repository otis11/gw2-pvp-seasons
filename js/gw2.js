export const API_BASE_URL = " https://api.guildwars2.com/v2"
export const PVP_SEASON_IDS_OLD_FORMAT = [
    '44B85826-B5ED-4890-8C77-82DDF9F2CF2B',
    '95D5B290-798A-421E-A919-1C2A75F74B72',
    'D1777261-555B-4B72-A27E-BDC96EC393D5',
    '2B2E80D3-0A74-424F-B0EA-E221500B323C'
]

export async function fetchLadderForSeasonNew(seasonId, region) {
    // ok for some reason page_size max is 200 so i need 2 request to fetch the full ladder ecksdee
    const promises = []
    const ladderPages = 2
    for (let i = 0; i < ladderPages; i++) {
        promises.push(
            fetch(`${API_BASE_URL}/pvp/seasons/${seasonId}/leaderboards/ladder/${region}?page=${i}&page_size=200`).then(res => res.json())
        )
    }
    const responses = await Promise.allSettled(promises)
    return responses.flatMap(res => res.value)
}

export async function fetchPvpSeasonIds() {
    return fetch(`${API_BASE_URL}/pvp/seasons`).then(res => res.json())
}

export async function fetchSeason(seasonId) {
    return fetch(`${API_BASE_URL}/pvp/seasons/${seasonId}`).then(res => res.json())
}