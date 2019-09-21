/**
 * Created by wellington on 07/04/17.
 *
 *
 * May 10, 2017
 * Changed the database to return the PG object
 *
 */

let logger = require(`${CORE_PATH}/logger`)

class  Database
{
    async query(sql)
    {
        console.log(`SQL->${sql}`)
        return new Promise(function (resolve, reject)
        {
            let user = `${process.env.db_user || process.env.USER}`
            let pass = `${process.env.db_pass || ''}`
            let host = `${process.env.db_host || 'localhost'}`
            let base = `${process.env.db_base || ''}`

            if(!process.env.db_user) logger.error(`Your '.env' file seem to have no database users '${process.env.USER}' will be take`)
            if(!process.env.db_pass) logger.error(`It seems in '.env' file have no password for database user '${user}', blank will be taken as default!`)
            if(!process.env.db_host) logger.error(`No hostname was specified in your '.env' file '${host}' will be taken`)
            if(!process.env.db_base) logger.error(`It seems you have no database set in your '.env' file blank will be taken`)

            let Pool = require('pg').Pool
            let config =
            {
                user:user,
                password:pass,
                host:host,
                database:base,
                max:10,
                idleTimeoutMillis: 1000,
            }

            let pool = new Pool(config)

            pool.on('error', function(e, client)
            {
                console.log(e)
                console.log(client)
                // if a client is idle in the pool
                // and receives an error - for example when your PostgreSQL server restarts
                // the pool will catch the error & let you handle it here
            });

            pool.query(sql, function(err, result)
            {
                if (err)
                {
                    logger.log_query(sql)

                    logger.error(`You have some error while try to run "${sql}" in your database!`)
                    resolve(err);
                }
                else
                {
                    if ( typeof result === undefined ) resolve([])

                    logger.log_query(sql)
                    resolve(result.rows)
                }

            });
        })
    }
}

export  default  Database


