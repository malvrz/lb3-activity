'use strict';

const { AccessToken } = require("loopback");

module.exports = function(Tweet) {
    Tweet.patchTweets = async function(req, id, content){
        const accessToken = req.query.access_token
        
        return AccessToken.findById(accessToken).then(async access => {
            return Tweet.updateAll({_id: id, personId: access.userId}, {content})
        })
    }
    Tweet.remoteMethod(
        'patchTweets', {
            http: {
                path: '/:id',
                verb: 'patch'
            },
            accepts: [
                {arg: 'req', type: 'object', http: {source: 'req'}},
                {arg: 'id', type: 'string', required: true},
                {arg: 'content', type: 'string', required: true}
            ]
        }
    )

    Tweet.disableRemoteMethodByName('prototype.patchAttributes')
    Tweet.disableRemoteMethodByName('replaceById')
};
