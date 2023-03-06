const { AccessToken } = require("loopback");

module.exports = function(Model, options) {
    Model.beforeRemote('**', async function(ctx) {
        const exclude = ['/login', '/signup']
        const { url, headers } = ctx.req

        if (! exclude.includes(url)) {
            const { authorization } = headers

            if (authorization) {
                const accessToken = authorization.replace('Bearer', '').replace(/\s/g, '')
                ctx.req.accessToken = await AccessToken.findById(accessToken)
                return
            }
            else {
                ctx.res.status(401).send('Authentication header required.')
                return
            }
        }
    })
    
}