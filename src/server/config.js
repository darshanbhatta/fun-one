module.exports= {
    privateKey: process.env.PRIVATE_KEY || 'sslcert/privkey.pem',
    certificate: process.env.CERTIFICATE || 'sslcert/fullchain.pem',
    httpsPort: process.env.HTTPS_PORT || 8080,
    httpPort: process.env.HTTP_PORT || 8080,
}