import { arrowRightIcon } from "./search.js"
import { getLocation } from "./url.js"
import { sortArrayByKey } from "./sort.js"

let playerData
// structure so when passing it its a reference
const lastSortAttribute = {
    value: ''
}
const lastSortAttributeOld = {
    value: ''
}

export async function renderPlayer(player) {
    playerData = await fetch(`./static/players/${player}.json`).then(res => res.json())
    renderPlayerData()
}

function renderPlayerData() {
    // player name
    let htmlStringMain = `
    <div class="flex pb-10 flex-col">
        <div class="player-name pb-6">${playerData.eu.name}</div>
        <div class="flex flex-col fit">
            
    `
    // player stats seasons (wins, rank, rating ...)
    if (playerData.eu.rank) {
        htmlStringMain += `
        <div class="label seasons-played">${playerData.eu.seasonsPlayed.length} seasons played<span class="average-rank"></span></div>
        <div class="label">Avg. Rank<span class="average-rank">${playerData.eu.rank}</span></div>
        <div class="label">Avg. Rating<span class="average-rating">${Math.round(playerData.eu.rating)}</span></div>
        <div class="label">Wins<span class="total-wins">${playerData.eu.scores[1].value}</span></div>
        <div class="label">Losses<span class="total-losses">${playerData.eu.scores[2].value}</span></div>
        `
    }
    // player stats old seasons ()
    if (playerData.eu.oldRank) {
        htmlStringMain += `
        <div class="label"><span class="average-rating"></span></div>
        <div class="label seasons-played">${playerData.eu.oldSeasonsPlayed.length} old seasons played<span class="average-rank"></span></div>
        <div class="label">Avg. Rank<span class="average-rating">${Math.round(playerData.eu.oldRank)}</span></div>
        <div class="label">Avg. Prestige<span class="average-rating">${Math.round(playerData.eu.oldRating)}</span></div>
        `
    }

    // close player name divs
    htmlStringMain += `       
        </div>
    </div>`

    // render seasons in a table
    let htmlString = ``
    if (playerData.eu.seasonsPlayed.length > 0) {
        htmlString += `
        <div class="row table-header">
            <div  data-sort="name" class="season">Season</div>
            <div data-sort="rank">Rank</div>
            <div data-sort="rating">Rating</div>
        </div>`
    }
    for (let i = 0; i < playerData.eu.seasonsPlayed.length; i++) {
        const season = playerData.eu.seasonsPlayed[i]
        htmlString += `
        <div class="row">
            <a href="${getLocation() + '?season=' + season.id}" class="name season">${arrowRightIcon}${season.name}</a>
            <div class="rank">${season.rank}</div>
            <div class="rating">${season.rating}</div>
        </div>`
    }

    // render old seasons in a table
    if (playerData.eu.oldSeasonsPlayed.length > 0) {
        htmlString += `
        <div class="row table-header mt-6">
            <div class="season" data-sort="name">Season (old)</div>
            <div data-sort="rank">Rank</div>
            <div data-sort="rating">Prestige</div>
        </div>`
    }

    for (let i = 0; i < playerData.eu.oldSeasonsPlayed.length; i++) {
        const season = playerData.eu.oldSeasonsPlayed[i]
        htmlString += `
        <div class="row">
            <a href="${getLocation() + '?season=' + season.id}" class="name season">${arrowRightIcon}${season.name}</a>
            <div class="rank">${season.rank}</div>
            <div class="rating">${season.rating}</div>
        </div>`
    }
    document.getElementById('table').innerHTML = htmlString
    document.getElementById('main').innerHTML = htmlStringMain

    setTimeout(() => {
        document.querySelector('.row.table-header.mt-6')?.addEventListener('click', onTableHeaderClickOld)
        document.querySelector('.row.table-header')?.addEventListener('click', onTableHeaderClick)
    }, 0)
}

function onTableHeaderClick(e) {
    applyTableSort(
        playerData.eu.seasonsPlayed,
        e.target.getAttribute('data-sort'),
        lastSortAttribute
    )
}

function onTableHeaderClickOld(e) {
    applyTableSort(
        playerData.eu.oldSeasonsPlayed,
        e.target.getAttribute('data-sort'),
        lastSortAttributeOld
    )
}

function applyTableSort(arr, attr, lastAttr) {
    let order = 'desc'
    if (attr === lastAttr.value) {
        order = 'asc'
    }

    sortArrayByKey(arr, attr, order)
    renderPlayerData()

    if (attr === lastAttr.value) {
        lastAttr.value = ''
    } else {
        lastAttr.value = attr
    }
}