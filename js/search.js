import { getLocation } from "./url.js"

export const arrowRightIcon = '<svg height="16" viewBox="0 0 9 16" width="9" xmlns="http://www.w3.org/2000/svg"><path d="m8.6124 8.1035-2.99 2.99a.5.5 0 0 1 -.7071-.7071l2.1366-2.1364h-6.316a.5.5 0 0 1 0-1h6.316l-2.1368-2.1367a.5.5 0 0 1 .7071-.7071l2.99 2.99a.5.5 0 0 1 .0002.7073z"></path></svg>'
const categoryMaxResults = 5
const results = {}
const searchFieldElement = document.getElementById('searchfield')
const searchResultContainerElement = document.getElementById('search-result-container')

export function setSearchResults(key, r) {
    // r = [{ value: string, link: string }]
    results[key] = r
}

function applySearch(searchString) {
    if (searchString === null) {
        searchResultContainerElement.innerHTML = ''
        return
    }

    searchString = searchString.toLowerCase()

    const categories = Object.keys(results)
    let htmlString = ''
    for (const category of categories) {
        const filtered = results[category].filter(r => r.value.toLowerCase().includes(searchString))
        const maxIterations = Math.min(categoryMaxResults, filtered.length)
        if (maxIterations > 0) {
            htmlString += `<div class="searchfield-result-category">${category}</div>`
            for (let i = 0; i < maxIterations; i++) {
                htmlString += `<a class="searchfield-result" href="${filtered[i].link}">${arrowRightIcon}${filtered[i].value}<a/>`
            }
        }
    }
    searchResultContainerElement.innerHTML = htmlString
}

searchFieldElement.addEventListener('input', (e) => {
    applySearch(e.target.value)
})

searchFieldElement.addEventListener('blur', (e) => {
    // timeout so link click still registers
    setTimeout(() => {
        applySearch(null)
    }, 135)
})

searchFieldElement.addEventListener('focus', (e) => {
    applySearch('')
})

fetch('./static/players.json')
    .then(res => res.json())
    .then(res => setSearchResults(
        'Players', res.map(p => ({ value: p, link: getLocation() + '?player=' + p }))
    ))
fetch('./static/seasons.json')
    .then(res => res.json())
    .then(res => setSearchResults(
        'Seasons',
        [{ value: 'Latest Pvp League Season', link: getLocation() + '?season=latest' },
        ...res.map(s => ({ value: s.name, link: getLocation() + '?season=' + s.id }))]
    ))

