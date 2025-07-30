const imagekit = require('../utils/image')

function profileUrl(userId, profileBuffer){
    return new Promise(async (resolve, reject) => {
        try {
            const folderPath = `recipie_reccomandation/${userId}`
            const listFiles = await imagekit.listFiles({
                path: folderPath,
                limit: 1
            });
            if (listFiles.length > 0) {
                await imagekit.deleteFile(listFiles[0].fileId);
            }
            const uploadResult = await imagekit.upload({
                file: profileBuffer,
                fileName: `${userId}_${Date.now()}`,
                folder: `folderPath/${userId}`
            });
            resolve(uploadResult);
        } catch(error) {
            reject(error)
        }
    })
}

module.exports = profileUrl;