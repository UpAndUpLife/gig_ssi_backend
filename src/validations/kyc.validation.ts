import Joi from 'joi';


const verifyAadhar = {
    query: Joi.object().keys({
        aadhaar_number: Joi.string(),
        mobile_number: Joi.string(),
    })
};


export default {
    verifyAadhar
};
