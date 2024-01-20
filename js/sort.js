export function sortArrayByKey(arr, key, order = 'asc') {
    arr = arr.sort((a, b) => {
        if (a[key] < b[key]) return order === 'asc' ? -1 : 1
        if (a[key] > b[key]) return order === 'asc' ? 1 : -1
        return 0
    })
}

export function sortArrayByFunction(arr, fn, order = 'asc') {
    arr = arr.sort((a, b) => {
        if (fn(a) < fn(b)) return order === 'asc' ? -1 : 1
        if (fn(a) > fn(b)) return order === 'asc' ? 1 : -1
        return 0
    })
}