
exports.handleCustomErrors = (err,req,res,next)=>{
    if(err.status){
        res.status(err.status).send({message:err.message})
    }else next(err)
}

exports.handleSQLErrors = (err,req,res,next)=>{
    if (err.code){
        console.log(err)

        const errCodes = {
            '22P02': {status:400, msg:'Bad Request'},
            '23503': {status:404, msg:'Not Found'},
            '42703': {status:400, msg:'Bad Request'}
        }
        res.status(errCodes[err.code].status).send({message:errCodes[err.code].msg})
    }
    else next(err)
}

exports.handleMispelledPath = (req,res,next)=>{
    res.status(404).send({message:'Path not found'})
}

exports.handle500erros = (err,req,res,next)=>{
    console.log(err)
    res.status(500).send({message:'Internal Server Error'})
}