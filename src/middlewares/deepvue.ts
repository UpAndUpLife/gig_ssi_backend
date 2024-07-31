import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import { NextFunction, Request, Response } from 'express';
import pick from '../utils/pick';
import Joi from 'joi';
import config from '../config/config';


const deepvueAPI = () => async (req: Request, res: Response, next: NextFunction) => {

    let now = new Date();

    
    let time_diff = (now.getTime() - global.deepvue_api_last_updated.getTime()) / (1000 * 60 * 60)
    
    if (time_diff > 24) {
        
        const data = new FormData();
        data.append('client_id', config.deepvue.client_id);
        data.append('client_secret', config.deepvue.client_secret);
        
        const resp = await fetch(config.deepvue.api_url + "/authorize", {
            method: "POST",
            body: data
        })
        
        const jsn = await resp.json();

        req.headers["deepvue_api_key"] = jsn["access_token"];
        global.deepvue_api_key = jsn["access_token"];
        global.deepvue_api_last_updated = new Date();
        return next()

    }

    req.headers["deepvue_api_key"] = global.deepvue_api_key;

    return next();
};

export default deepvueAPI;
