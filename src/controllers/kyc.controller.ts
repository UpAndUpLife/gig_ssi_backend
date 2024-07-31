import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import prisma from '../client';
import { DocumentType } from '@prisma/client';
import config from "../config/config";
import ApiError from '../utils/ApiError';

const verifyAadhar = catchAsync(async (req, res) => {

    const { aadhaar_number, mobile_number } = req.body;
    const user: any = req.user!;

    const resp = await fetch(`${config.deepvue.api_url}/verification/aadhaar?aadhaar_number=${aadhaar_number}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${global.deepvue_api_key}`,
            'x-api-key': config.deepvue.client_secret
        }
    })

    const jsn = await resp.json();


    if (jsn.statusCode === 200) {

        if (jsn.sub_code === "INVALID_AADHAAR_NUMBER") {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Aadhar Number');
        }

        let mb = String(mobile_number);
        if (jsn.data.last_digits !== mb.substring(mb.length - 3)) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Mobile Number');
        }

        let doc = await prisma.document.findFirst({
            where: {
                type: DocumentType.AADHAR,
                userId: user.id
            }
        });

        if (doc === null) {
            await prisma.document.create({
                data: {
                    type: DocumentType.AADHAR,
                    number: aadhaar_number,
                    userId: user.id,
                }
            })

            res.status(httpStatus.CREATED).send("VERIFIED");
            return;
        }

        // update the latest verified date
        await prisma.document.update({
           where: {id: doc?.id},
           data: {
            updatedAt: new Date()
           }
        })
        
        res.status(httpStatus.CREATED).send("VERIFIED");
        return;

    } else {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something went Wrong');
    }

});