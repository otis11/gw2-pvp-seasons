import fs from 'fs'
import { PVP_SEASON_IDS_OLD_FORMAT, fetchPvpSeasonIds, fetchLadderForSeasonNew, API_BASE_URL, fetchSeason } from '../js/gw2.js'

async function fetchLadderForSeason(seasonId, region) {
    let ladder
    if (PVP_SEASON_IDS_OLD_FORMAT.includes(seasonId)) {
        ladder = await fetchLadderForSeasonOld(seasonId, region)
    } else {
        ladder = await fetchLadderForSeasonNew(seasonId, region)
    }

    return {
        ladder,
        id: seasonId
    }
}

async function fetchLadderForSeasonOld(seasonId, region) {
    // ok for some reason page_size max is 200 so i need 2 request to fetch the full ladder ecksdee and only one page
    return fetch(`${API_BASE_URL}/pvp/seasons/${seasonId}/leaderboards/legendary/${region}?page_size=200`).then(res => res.json())
}

async function fetchLadderForSeasonOldGuild(seasonId, region) {
    // ok for some reason page_size max is 200 so i need 2 request to fetch the full ladder ecksdee and only one page
    return fetch(`${API_BASE_URL}/pvp/seasons/${seasonId}/leaderboards/guild/${region}?page_size=200`).then(res => res.json())
}

function generatePlayerStatsFromSeasons(seasonLadders, seasons) {
    const players = {}

    function addPlayer(player, season) {
        if (players[player.name]) {
            if (PVP_SEASON_IDS_OLD_FORMAT.includes(season.id)) {
                players[player.name].oldRank += player.rank
                players[player.name].oldRating += player.scores[0].value,
                    players[player.name].oldSeasonsPlayed.push({
                        id: season.id,
                        name: season.name,
                        rank: player.rank,
                        rating: player.scores[0].value,
                    })
            } else {
                players[player.name].rating += player.scores[0].value,
                    players[player.name].seasonsPlayed.push({
                        id: season.id,
                        name: season.name,
                        rank: player.rank,
                        rating: player.scores[0].value,
                    })
                if (!players[player.name].scores[1]) players[player.name].scores.push({ value: 0 }, { value: 0 })
                players[player.name].scores[1].value += player.scores[1].value
                players[player.name].rank += player.rank
                players[player.name].scores[2].value += player.scores[2].value
            }

            if (new Date(player.date) > new Date(players[player.name].date)) {
                players[player.name].date = player.date
            }
        } else {
            players[player.name] = {
                name: player.name,
                rank: 0,
                oldRank: 0,
                rating: 0,
                seasonsPlayed: [],
                oldSeasonsPlayed: [],
                scores: player.scores,
                oldRating: 0,
            }
            if (PVP_SEASON_IDS_OLD_FORMAT.includes(season.id)) {
                players[player.name].oldRank = player.rank
                players[player.name].oldRating = player.scores[0].value,
                    players[player.name].oldSeasonsPlayed.push({
                        id: season.id,
                        name: season.name,
                        rank: player.rank,
                        rating: player.scores[0].value,
                    })
            } else {
                players[player.name].oldRank = player.rank
                players[player.name].rating = player.scores[0].value,
                    players[player.name].seasonsPlayed.push({
                        id: season.id,
                        name: season.name,
                        rank: player.rank,
                        rating: player.scores[0].value,
                    })
            }
        }
    }

    for (let i = 0; i < seasonLadders.length; i++) {
        for (let j = 0; j < seasonLadders[i].ladder.length; j++) {
            addPlayer(seasonLadders[i].ladder[j], seasons[seasonLadders[i].id])
        }
    }

    return Object.keys(players).map(k => ({
        ...players[k],
        rank: players[k].rank ? Math.round(players[k].rank / players[k].seasonsPlayed.length) : 0,
        oldRank: players[k].oldRank ? Math.round(players[k].oldRank / players[k].oldSeasonsPlayed.length) : 0,
        rating: Math.round(players[k].rating / players[k].seasonsPlayed.length),
        oldRating: Math.round(players[k].oldRating / players[k].oldSeasonsPlayed.length)
    }))
};

(async () => {
    const pvpSeasonIds = await fetchPvpSeasonIds()

    const seasons = {}
    for (const pvpSeasonId of pvpSeasonIds) {
        console.log('fetch season', pvpSeasonId)
        const season = await fetchSeason(pvpSeasonId)
        seasons[pvpSeasonId] = season
    }
    try {
        fs.mkdirSync('./static', {
            recursive: true,
        })
    } catch (e) { }
    fs.writeFileSync('./static/seasons.json', JSON.stringify(Object.values(seasons).map(v => ({
        name: v.name,
        id: v.id,
    }))))

    // eu
    const laddersEu = []
    try {
        fs.mkdirSync('./static/seasons/eu', {
            recursive: true,
        })
    } catch (e) { }
    for (const pvpSeasonId of pvpSeasonIds) {
        console.log('fetch ladder', pvpSeasonId, 'eu')
        const ladder = await fetchLadderForSeason(pvpSeasonId, 'eu')
        laddersEu.push(ladder)
        fs.writeFileSync(`./static/seasons/eu/${pvpSeasonId}.json`, JSON.stringify({ ladder, season: seasons[pvpSeasonId] }))
    }

    // na
    const laddersNa = []
    try {
        fs.mkdirSync('./static/seasons/na', {
            recursive: true,
        })
    } catch (e) { }
    for (const pvpSeasonId of pvpSeasonIds) {
        console.log('fetch ladder', pvpSeasonId, 'na')
        const season = await fetchSeason(pvpSeasonId)
        const ladder = await fetchLadderForSeason(pvpSeasonId, 'na')
        laddersNa.push(ladder)
        fs.writeFileSync(`./static/seasons/na/${pvpSeasonId}.json`, JSON.stringify({ ladder, season, id: pvpSeasonId }))
    }

    console.log('generating player data...')
    const statsEu = generatePlayerStatsFromSeasons(laddersEu, seasons)
    const statsNa = generatePlayerStatsFromSeasons(laddersNa, seasons)

    const playerStats = {}
    for (const stats of statsEu) {
        playerStats[stats.name] = {
            eu: stats
        }
    }
    for (const stats of statsNa) {
        if (playerStats[stats.name]) {
            playerStats[stats.name].na = stats
        } else {
            playerStats[stats.name] = {
                na: stats
            }
        }
    }

    try {
        fs.mkdirSync('./static/players', {
            recursive: true,
        })
    } catch (e) { }
    const playerNames = Object.keys(playerStats)
    for (const playerName of playerNames) {
        fs.writeFileSync(`./static/players/${playerName}.json`, JSON.stringify(playerStats[playerName]))
    }

    fs.writeFileSync('./static/players.json', JSON.stringify(Object.keys(playerStats)))

    console.log('Done!')
})()
