/**
 * Created by wellington on 24/07/2017.
 */

import Bootstrap from './bootstrap'
import Database from "./database"

module.exports =
{
    run: async () =>
    {

        global.constants = require(`${APP_PATH}/.conf/constants.json`)

        let fs = require('fs')

        let dotenv = require('dotenv').config()

        global.client_names = []
        let result = await new Database().query('SELECT LOWER(app_name) app_name FROM applications')
        result.forEach(value => client_names.push(value.app_name))

        let express = require('express')
        let cors = require('cors')
        let app = express()
        let helmet = require('helmet')
        let body_parser = require('body-parser')
        let  qt = require('quickthumb')
        let uploader = require(`express-fileupload`)

        let oauthserver = require('oauth2-server')
        app.oauth = oauthserver(
        {
            model: require(`${CORE_PATH}/oauth-pg`),
            grants: ['auth_code', 'password', 'refresh_token'],
            debug: true
        })

        // app.use(express.static(`${STATIC_PATH}`))
        // app.use('/images', qt.static(`${STATIC_PATH}/images`))
        // app.use('/media', qt.static(`${STATIC_PATH}/media`))
        app.use(`/uploads`, qt.static(`${STATIC_PATH}/uploads`))


        if (process.env.ssl == "true")
        {
            let port = process.env.server_port || 443

            let https = require('spdy')

            let credentials =
            {
                key: fs.readFileSync(process.env.ssl_key, process.env.ssl_charset),
                cert: fs.readFileSync(process.env.ssl_cert, process.env.ssl_charset),
                passphrase: process.env.ssl_pass
            }

            let https_server = https.createServer(credentials, app) //added

            https_server.listen(port)
            console.log(`######################################################################`)
            console.log(`#                      Welcome  to ${process.env.server_api_name}                           #`)
            console.log(`#      Descrption ${process.env.server_name}                            #`)
            console.log(`#      The server is running on port ${port} in SSL Mode                 #`)
            console.log(`######################################################################`)
        }
        else
        {
            let port = process.env.server_port || 80
            let http = require('http')
            let http_server = http.createServer(app)
            http_server.listen(port)

            console.log(`######################################################################`)
            console.log(`#                      Welcome  to ${process.env.server_api_name}                           #`)
            console.log(`#      Descrption ${process.env.server_name}                            #`)
            console.log(`#      The server is running on port ${port} in NO SSL Mode               #`)
            console.log(`######################################################################`)

            console.log(`The server was started at port ${port}`)
        }

        app.use(helmet())

        app.disable('x-powered-by')

        app.set('trust_proxy', true);



        app.use(cors())

        app.use(body_parser.json())
        app.use(body_parser.urlencoded({extended: false}))
        app.use(uploader())

        process.on(`uncaughtException`, function (err)
        {
            console.error(err)
            console.log("Node NOT Exiting...")
        })

        app.all(`/oauth/token`, app.oauth.grant())

        app.all('*',  (req, res, next) =>
        {
            if (new Bootstrap().is_public_route(req) || new Bootstrap().is_static_route(req))
                new Bootstrap().run(req, res)
            else
                next()
        })



        app.all(/^(?:(?!\/?.*uploads).*)/, app.oauth.authorise(), (req, res) =>
        {
            new Bootstrap().run(req, res)
        })

        app.use(app.oauth.errorHandler());


    }
}