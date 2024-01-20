import { formatDate } from "./date.js"
import { fetchSeason, fetchLadderForSeasonNew, fetchPvpSeasonIds, PVP_SEASON_IDS_OLD_FORMAT } from "./gw2.js"
import { arrowRightIcon } from "./search.js"
import { sortArrayByKey, sortArrayByFunction } from "./sort.js"

let selectedSeason = {}
let lastSortAttribute = ''

export async function renderSeasonId(seasonId) {
    selectedSeason.eu = await fetch(`./static/seasons/eu/${seasonId}.json`).then(res => res.json())
    selectedSeason.na = await fetch(`./static/seasons/na/${seasonId}.json`).then(res => res.json())
    renderSeason(selectedSeason.eu.ladder.ladder, selectedSeason.eu.season)
}

export async function renderLatestSeason() {
    const latestSeasonId = (await fetchPvpSeasonIds()).at(-1)
    selectedSeason.eu = {
        ladder: {
            ladder: await fetchLadderForSeasonNew(latestSeasonId, 'eu')
        },
        season: await fetchSeason(latestSeasonId)
    }
    selectedSeason.na = {
        ladder: {
            ladder: await fetchLadderForSeasonNew(latestSeasonId, 'na')
        },
        season: await fetchSeason(latestSeasonId)
    }

    renderSeason(selectedSeason.eu.ladder.ladder, selectedSeason.eu.season)
};

export function renderSeason(players, season) {
    if (PVP_SEASON_IDS_OLD_FORMAT.includes(season.id)) {
        renderSeasonOld(players, season)
    } else {
        renderSeasonNew(players, season)
    }
}

function renderSeasonOld(players, season) {
    const isActive = new Date(season.end).getTime() > new Date().getTime()
    const htmlStringMain = `
    <div class="flex pb-10 flex-col">
        <div class="player-name pb-6">${season.name}</div>
        <div class="flex flex-col fit">
            <div class="label">Status<span class="status ${isActive ? 'status-active' : 'status-inactive'}">${isActive ? 'active' : 'inactive'}</span></div>
            <div class="label">Start<span class="start">${new Date(season.start).toDateString()}</span></div>
            <div class="label">End<span class="end">${new Date(season.end).toDateString()}</span></div>
        </div>
    </div>`
    let htmlString = `
    <div class="row table-header">
        <div class="rank" data-sort="rank">Rank</div>
        <div class="name" data-sort="name">Name</div>
        <div class="rating" data-sort="rating">Prestige</div>
        <div class="date" data-sort="date">Rank Reached</div>
    </div>`
    for (let i = 0; i < players.length; i++) {
        htmlString += `
            <div class="row">
                <div class="rank">${Math.round(players[i].rank)}</div>
                <a class="name" href="${window.location.origin + window.location.pathname + '?player=' + players[i].name}">${arrowRightIcon}${players[i].name}</a>
                <div class="rating">${Math.round(players[i].scores[0].value)}</div>
                <div class="date">${formatDate(players[i].date)}</div>
            </div>`
    }
    document.getElementById('table').innerHTML = htmlString
    document.getElementById('main').innerHTML = htmlStringMain

    setTimeout(() => {
        document.querySelector('.row.table-header').addEventListener('click', onTableRowClick)
    }, 0)
}

function renderSeasonNew(players, season) {
    const isActive = new Date(season.end).getTime() > new Date().getTime()
    // render season stuff
    const htmlStringMain = `
    <div class="flex pb-10 flex-col">
        <div class="player-name pb-6">${season.name}</div>
        <div class="flex flex-col fit">
            <div class="label">Status<span class="status ${isActive ? 'status-active' : 'status-inactive'}">${isActive ? 'active' : 'inactive'}</span></div>
            <div class="label">Start<span class="start">${new Date(season.start).toDateString()}</span></div>
            <div class="label">End<span class="end">${new Date(season.end).toDateString()}</span></div>
        </div>
    </div>`

    // render players table for season
    let htmlString = `
    <div class="row table-header">
        <div class="rank" data-sort="rank">Rank</div>
        <div class="name" data-sort="name">Name</div>
        <div class="rating" data-sort="rating">Rating</div>
        <div class="wins" data-sort="wins">Wins</div>
        <div class="losses" data-sort="losses">Losses</div>
        <div class="date" data-sort="date">Rank Reached</div>
    </div>`
    for (let i = 0; i < players.length; i++) {
        htmlString += `
            <div class="row">
                <div class="rank">${Math.round(players[i].rank)}</div>
                <a class="name" href="${window.location.origin + window.location.pathname + '?player=' + players[i].name}">${arrowRightIcon}${players[i].name}</a>
                <div class="rating">${Math.round(players[i].scores[0].value)}</div>
                <div class="wins">${players[i].scores[1].value}</div>
                <div class="losses">${players[i].scores[2].value}</div>
                <div class="date">${formatDate(players[i].date)}</div>
            </div>`
    }
    document.getElementById('table').innerHTML = htmlString
    document.getElementById('main').innerHTML = htmlStringMain

    setTimeout(() => {
        document.querySelector('.row.table-header').addEventListener('click', onTableRowClick)
    }, 0)
}

function onTableRowClick(e) {
    const attr = e.target.getAttribute('data-sort')
    let order = 'desc'
    if (attr === lastSortAttribute) {
        order = 'asc'
    }
    if (attr === 'rank') {
        sortArrayByKey(selectedSeason.eu.ladder.ladder, 'rank', order)
    }
    if (attr === 'name') {
        sortArrayByKey(selectedSeason.eu.ladder.ladder, 'name', order)
    }
    if (attr === 'rating') {
        sortArrayByFunction(selectedSeason.eu.ladder.ladder, (x) => x.scores[0].value, order)
    }
    if (attr === 'wins') {
        sortArrayByFunction(selectedSeason.eu.ladder.ladder, (x) => x.scores[1].value, order)
    }
    if (attr === 'losses') {
        sortArrayByFunction(selectedSeason.eu.ladder.ladder, (x) => x.scores[2].value, order)
    }
    if (attr === 'date') {
        sortArrayByFunction(selectedSeason.eu.ladder.ladder, (x) => new Date(x.date), order)
    }

    if (attr === lastSortAttribute) {
        lastSortAttribute = ''
    } else {
        lastSortAttribute = attr
    }
    renderSeason(selectedSeason.eu.ladder.ladder, selectedSeason.eu.season)
}