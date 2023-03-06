'use strict';

module.exports = function(Followships) {
    
    Followships.getIds = async function(mapValue, id) {
        const mappings = getMappings(mapValue, id)
        let ret = []

        const records = await Followships.find({where: mappings.filter})
        const length = records.length
        for (var i = 0; i < length; i++) {
            ret.push(records[i][mappings.key])
        }

        return ret
    }

    function getMappings(mapValue, id) {
        const mappings = {
            followers: {
                filter: {followedId: id},
                key: 'followerId'
            },
            following: {
                filter: {followerId: id},
                key: 'followedId'
            }
        }
        return mappings[mapValue]
    }
};
