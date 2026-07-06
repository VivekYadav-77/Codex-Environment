export function notFound(req, res) {
    res.status(404).json({ error: 'Not found' })
}

export function errorMiddleware(err, req, res, next) {
    const statusCode = err.statusCode || err.status || 500
    const payload = { error: err.message || 'Something went wrong' }

    if (process.env.NODE_ENV !== 'production' && err.details) {
        payload.details = err.details
    }

    console.error(err)
    res.status(statusCode).json(payload)
}
