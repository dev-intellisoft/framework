/**
 * Created by wellington on 21/07/2017.
 */


import Loader from './loader'

class Controller extends Loader
{
    constructor()
    {
        super()
        this.load('input')
    }

    is_post()
    {
        return request.method === 'POST'
    }

    is_get()
    {
        return request.method === 'GET'
    }

    is_delete()
    {
        return request.method === 'DELETE'
    }

    is_put()
    {
        return request.method === 'PUT'
    }
}


export default Controller
