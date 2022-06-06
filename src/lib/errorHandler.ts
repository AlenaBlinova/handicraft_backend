export class ErrorHandler extends Error {
    constructor(
        public code,
        public message
    ) {
        super();
    }
}

export const handleErrors = (err, req, res, next) => {
    console.error(err)
    const {code = 500, message} = err;
    return res.status(code).json({
        status:'error',
        message:message
    });
}