const ImageKit = require('imagekit')

const imagekit = new ImageKit({
    publicKey : process.env.IMAKEKIT_PUBLIC_KEY,
    privateKey : process.env.IMAKEKIT_PRIVATE_KEY,
    urlEndpoint : process.env.IMAGEKIT_URL_ENDPOINT
})

module.exports = imagekit