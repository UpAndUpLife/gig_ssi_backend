import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import prisma from '../client';
import { DocumentType } from '@prisma/client';
import config from "../config/config";
import ApiError from '../utils/ApiError';
import pick from '../utils/pick';

const verifyAadhar = catchAsync(async (req, res) => {

    const aadhar_number = req.query.aadhar_number as string;
    const mobile_number = req.query.mobile_number as string;
    const user: any = req.user!;


    const resp = await fetch(`${config.deepvue.api_url}/verification/aadhaar?aadhaar_number=${aadhar_number}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${req.headers["deepvue_api_key"]}`,
            'x-api-key': config.deepvue.client_secret
        },
    })


    const jsn = await resp.json();


    if (jsn.code === 200) {

        if (jsn.sub_code !== "SUCCESS") {
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
                    number: aadhar_number,
                    userId: user.id,
                }
            })

            res.status(httpStatus.CREATED).send("VERIFIED");
            return;
        }

        // update the latest verified date
        await prisma.document.update({
            where: { id: doc?.id },
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


const verifyPAN = catchAsync(async (req, res) => {

    const pan_number = req.query.pan_number as string;
    const name = req.query.name as string;
    const user: any = req.user!;

    const resp = await fetch(`${config.deepvue.api_url}/verification/panbasic?pan_number=${pan_number}&name=${name}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${req.headers["deepvue_api_key"]}`,
            'x-api-key': config.deepvue.client_secret
        },
    })


    const jsn = await resp.json();


    if (jsn.code === 200) {

        if (jsn.data.status !== "VALID") {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Pan Details');
        }

        if (jsn.data.name_information.match_score < 60) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Name');
        }

        let doc = await prisma.document.findFirst({
            where: {
                type: DocumentType.PAN,
                userId: user.id
            }
        });

        if (doc === null) {
            await prisma.document.create({
                data: {
                    type: DocumentType.PAN,
                    number: pan_number,
                    userId: user.id,
                }
            })

            res.status(httpStatus.CREATED).send("VERIFIED");
            return;
        }

        // update the latest verified date
        await prisma.document.update({
            where: { id: doc?.id },
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



const creditScore = catchAsync(async (req, res) => {

    const user: any = req.user!;

    let currDate = new Date();
    console.log(currDate,config.reverify_time)

    currDate.setSeconds(currDate.getSeconds() - (config.reverify_time))

    const verified_docs = await prisma.document.findMany({
        where: {
            userId: user.id,
            updatedAt: {
                gte: currDate
            }
        }
    })

    const unverified_docs = await prisma.document.findMany({
        where: {
            userId: user.id,
            updatedAt: {
                lt: currDate
            }
        }
    })
    

    res.status(httpStatus.CREATED).send({
        credit_score: verified_docs.length * 5,
        verified_docs: verified_docs.map((doc) => doc.type),
        unverified_docs: unverified_docs.map((doc) => doc.type)
    });


});

export default {
    verifyAadhar,
    verifyPAN,
    creditScore
};