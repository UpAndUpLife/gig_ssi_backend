import Joi from 'joi';


const verifyAadhar = {
    query: Joi.object().keys({
        aadhaar_number: Joi.string(),
        mobile_number: Joi.string(),
    })
};

const verifyPAN = {
    query: Joi.object().keys({
        pan_number: Joi.string(),
        name: Joi.string(),
    })
};


export default {
    verifyAadhar,
    verifyPAN
};
