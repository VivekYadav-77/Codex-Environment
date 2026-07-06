const sortDeep = (value) => {
    if (Array.isArray(value)) return value.map(sortDeep).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
    if (value && typeof value === 'object') {
        return Object.keys(value).sort().reduce((acc, key) => {
            acc[key] = sortDeep(value[key])
            return acc
        }, {})
    }
    return value
}

export function normalizeValue(value, compareMode = 'exact') {
    if (compareMode === 'unordered') return sortDeep(value)
    return value
}

export function valuesEqual(actual, expected, compareMode) {
    return JSON.stringify(normalizeValue(actual, compareMode)) === JSON.stringify(normalizeValue(expected, compareMode))
}
