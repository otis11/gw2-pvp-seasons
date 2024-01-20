export function formatDate(dateString) {
    const date = new Date(dateString).getTime()
    const now = new Date().getTime()

    const diff = now - date
    const secondInMilliseconds = 1000
    const minuteInMilliseconds = secondInMilliseconds * 60
    const hourInMilliseconds = minuteInMilliseconds * 60
    const dayInMilliseconds = hourInMilliseconds * 24
    const weekInMilliseconds = dayInMilliseconds * 7
    const monthInMilliseconds = dayInMilliseconds * 30
    const yearInMilliseconds = dayInMilliseconds * 365
    if (diff < minuteInMilliseconds) {
        return 'now'
    }
    if (diff < hourInMilliseconds) {
        return Math.floor(diff / minuteInMilliseconds) + ' minutes ago'
    }
    if (diff < dayInMilliseconds) {
        return Math.floor(diff / hourInMilliseconds) + ' hours ago'
    }
    if (diff < weekInMilliseconds) {
        return Math.floor(diff / dayInMilliseconds) + ' days ago'
    }
    if (diff < monthInMilliseconds) {
        return Math.floor(diff / weekInMilliseconds) + ' weeks ago'
    }
    if (diff < yearInMilliseconds) {
        return Math.floor(diff / monthInMilliseconds) + ' months ago'
    }
    return Math.floor(diff / yearInMilliseconds) + ' years ago'
}