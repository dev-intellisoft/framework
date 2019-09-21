/**
 * Created by wellington on 08/08/2017.
 */

let logger = require(`${CORE_PATH}/logger`)

import Router from '../core/router'
import Init from './init'

class Bootstrap
{
    is_public_route = (req) =>
    {
        return new Router().is_public(req)
    }

    is_static_route = (req) =>
    {
        return new Router().is_static(req)
    }

    run = async (req,res) =>
    {
        global.request = req
        global.response = res

        let config = new Router().router(req)

        let class_name = config.class_name

        if (config.permission)
        {
            try
            {
                let controller = new Init(class_name)
                try
                {
                    let response = await controller[config.method]()

                    logger.access(req, res)

                    if(Buffer.isBuffer(response))
                    {
                        res.set('Content-type','application/pdf')
                        res.send(response).end()
                    }
                    else
                    {
                        res.set('Content-type','application/json')
                        res.json(response).end()
                    }
                }
                catch (ex)
                {
                    //todo module does not exists return and log
                    res.json({code:100, message:`No function '${config.method}' found in controller '${class_name}'!`}).end()
                }
            }
            catch (ex)
            {
                //todo module does not exists return and log
                res.json({code:100, message:`Controller '${class_name}' does not exists!`}).end()
            }
        }
        else
        {
            res.json({code:100, message:`Application '${config.applications.accessed}' have no permission!`}).end()
        }
    }


    get_params_names(func)
    {
        let strip_comments = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        let argument_names = /([^\s,]+)/g;

        let fn_str = func.toString().replace(strip_comments, '');
        let result = fn_str.slice(fn_str.indexOf('(')+1, fn_str.indexOf(')')).match(argument_names);

        if(result === null) result = [];

        return result;
    }
}

export default Bootstrap
