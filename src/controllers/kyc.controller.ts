import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import prisma from '../client';
import { DocumentType, Question, QuestionType, Role } from '@prisma/client';
import config from "../config/config";
import ApiError from '../utils/ApiError';
import pick from '../utils/pick';
import { randomInt } from 'crypto';


const verifyAadhar = catchAsync(async (req, res) => {

    const aadhar_number = req.query.aadhar_number as string;
    const mobile_number = req.query.mobile_number as string;
    const user: any = req.user!;

    const aadharSplit = aadhar_number.split("");
    const sum = aadharSplit.reduce((acc, num) => acc + parseInt(num, 10), 0);

    // const resp = await fetch(`${config.deepvue.api_url}/verification/aadhaar?aadhaar_number=${aadhar_number}`, {
    //     method: "GET",
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${req.headers["deepvue_api_key"]}`,
    //         'x-api-key': config.deepvue.client_secret
    //     },
    // })


    // const jsn = await resp.json();

    let doc = await prisma.document.findFirst({
        where: {
            type: DocumentType.AADHAR,
            userId: user.id
        }
    });


    if (doc === null) {
        doc = await prisma.document.create({
            data: {
                type: DocumentType.AADHAR,
                number: aadhar_number,
                userId: user.id,
            }
        })


        // generate sum of all digits in aadhar card
        await prisma.question.create({
            data: {
                type: QuestionType.AADHAR_SUM,
                documentId: doc.id,
                proof: "",
                answer: sum.toString()
            }
        })

        // generate question for last 4 digits in aadhar card
        await prisma.question.create({
            data: {
                type: QuestionType.AADHAR_LAST_FOUR_DIGITS,
                documentId: doc.id,
                proof: "",
                answer: aadhar_number.slice(aadhar_number.length - 4 ,aadhar_number.length).toString()
            }
        })

        res.status(httpStatus.CREATED).send("VERIFIED");
    }

    else {
        // update the latest verified date
        await prisma.document.update({
            where: { id: doc?.id },
            data: {
                updatedAt: new Date()
            }
        })


        // update sum of all digits in aadhar card
        await prisma.question.updateMany({
            where: {
                documentId: doc.id,
                type: QuestionType.AADHAR_SUM
            },
            data: {
                answer: sum.toString()
            }
        })

        // update question for last 4 digits in aadhar card
        await prisma.question.updateMany({
            where: {
                documentId: doc.id,
                type: QuestionType.AADHAR_LAST_FOUR_DIGITS
            },
            data: {
                answer: aadhar_number.slice(aadhar_number.length -4 ,aadhar_number.length).toString()
            }
        })

        res.status(httpStatus.CREATED).send("VERIFIED");
    }




    // if (jsn.code === 200) {

    //     if (jsn.sub_code !== "SUCCESS") {
    //         throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Aadhar Number');
    //     }

    //     let mb = String(mobile_number);
    //     if (jsn.data.last_digits !== mb.substring(mb.length - 3)) {
    //         throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Mobile Number');
    //     }

    //     let doc = await prisma.document.findFirst({
    //         where: {
    //             type: DocumentType.AADHAR,
    //             userId: user.id
    //         }
    //     });

    //     if (doc === null) {
    //         await prisma.document.create({
    //             data: {
    //                 type: DocumentType.AADHAR,
    //                 number: aadhar_number,
    //                 userId: user.id,
    //             }
    //         })

    //         res.status(httpStatus.CREATED).send("VERIFIED");
    //         return;
    //     }

    //     // update the latest verified date
    //     await prisma.document.update({
    //         where: { id: doc?.id },
    //         data: {
    //             updatedAt: new Date()
    //         }
    //     })

    //     res.status(httpStatus.CREATED).send("VERIFIED");
    //     return;

    // } else {
    //     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something went Wrong');
    // }

});


const verifyPAN = catchAsync(async (req, res) => {

    const pan_number = req.query.pan_number as string;
    const name = req.query.name as string;
    const user: any = req.user!;

    let doc = await prisma.document.findFirst({
        where: {
            type: DocumentType.PAN,
            userId: user.id
        }
    });

    if (doc === null) {
        doc = await prisma.document.create({
            data: {
                type: DocumentType.PAN,
                number: pan_number,
                userId: user.id,
            }
        })

        // generate question for last 4 digits in PAN card
        await prisma.question.create({
            data: {
                type: QuestionType.PAN_LAST_4_DIGITS,
                documentId: doc.id,
                proof: "",
                answer: pan_number.slice(pan_number.length - 4 ,pan_number.length).toString()
            }
        })

        res.status(httpStatus.CREATED).send("VERIFIED");
    }

    else {

        // update the latest verified date
        await prisma.document.update({
            where: { id: doc?.id },
            data: {
                updatedAt: new Date()
            }
        })


        // generate question for last 4 digits in PAN card
        await prisma.question.updateMany({
            where: {
                documentId: doc.id,
                type: QuestionType.PAN_LAST_4_DIGITS
            },
            data: {
                answer: pan_number.slice(pan_number.length - 4 , pan_number.length).toString()
            }
        })



        res.status(httpStatus.CREATED).send("VERIFIED");
    }



    // const resp = await fetch(`${config.deepvue.api_url}/verification/panbasic?pan_number=${pan_number}&name=${name}`, {
    //     method: "GET",
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${req.headers["deepvue_api_key"]}`,
    //         'x-api-key': config.deepvue.client_secret
    //     },
    // })


    // const jsn = await resp.json();



    // if (jsn.code === 200) {

    //     if (jsn.data.status !== "VALID") {
    //         throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Pan Details');
    //     }

    //     if (jsn.data.name_information.match_score < 60) {
    //         throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Name');
    //     }

    //     let doc = await prisma.document.findFirst({
    //         where: {
    //             type: DocumentType.PAN,
    //             userId: user.id
    //         }
    //     });

    //     if (doc === null) {
    //         await prisma.document.create({
    //             data: {
    //                 type: DocumentType.PAN,
    //                 number: pan_number,
    //                 userId: user.id,
    //             }
    //         })

    //         res.status(httpStatus.CREATED).send("VERIFIED");
    //         return;
    //     }

    //     // update the latest verified date
    //     await prisma.document.update({
    //         where: { id: doc?.id },
    //         data: {
    //             updatedAt: new Date()
    //         }
    //     })

    //     res.status(httpStatus.CREATED).send("VERIFIED");
    //     return;

    // } else {
    //     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something went Wrong');
    // }

});



const creditScore = catchAsync(async (req, res) => {

    const user: any = req.user!;

    let currDate = new Date();
    console.log(currDate, config.reverify_time)

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

    console.log(verified_docs);

    res.status(httpStatus.CREATED).send({
        credit_score: verified_docs.length * 5,
        verified_docs: verified_docs.map((doc) => doc.type),
        unverified_docs: unverified_docs.map((doc) => doc.type)
    });


});



const getQuestion = catchAsync(async (req, res) => {

    const userId: string = req.query.userId!.toString();

    if (typeof userId !== typeof "") {
        res.status(400).send({
            message: "Expected user ID"
        })
        return; 
    }

    const user = await prisma.user.findFirst({
        where:{
            id: parseInt(userId)
        }
    });

    if (user === null || user.role !== Role.GIG_WORKER) {
        res.status(400).send({
            message: "User does not exist"
        })
        return; 
    }


    const random_question = [QuestionType.AADHAR_LAST_FOUR_DIGITS, QuestionType.AADHAR_SUM, QuestionType.PAN_LAST_4_DIGITS]
    const _randomInt = Math.floor(Math.random() * 3);


    let question = "";
    let answer = "";
    let doc:  Question | null = null;
    console.log(_randomInt)

    switch (random_question[_randomInt]) {
        case QuestionType.AADHAR_LAST_FOUR_DIGITS:
            console.log("AADHAR_LAST_FOUR_DIGITS")
            question = "last 4 digits of your Aadhar"
            doc = await prisma.question.findFirst({
                where: {
                    document: {
                        userId: user.id
                    },
                    type: QuestionType.AADHAR_LAST_FOUR_DIGITS
                }
            })

            answer = doc?.answer!
            break;

        case QuestionType.AADHAR_SUM:
            console.log("AADHAR_SUM")
            question = "Enter Sum of your Aadhar Number"
            doc = await prisma.question.findFirst({
                where: {
                    document: {
                        userId: user.id
                    },
                    type: QuestionType.AADHAR_SUM
                }
            })
            
            answer = doc?.answer!
            break;

        case QuestionType.PAN_LAST_4_DIGITS:
            console.log("PAN_LAST_4_DIGITS")
            question = "last 4 digits of your PAN"
            doc = await prisma.question.findFirst({
                where: {
                    document: {
                        userId: user.id
                    },
                    type: QuestionType.PAN_LAST_4_DIGITS
                }
            })

            answer = doc?.answer!
            break;
            
    }

    // get trust score of gig worker 
    let currDate = new Date();
    console.log(currDate, config.reverify_time)

    currDate.setSeconds(currDate.getSeconds() - (config.reverify_time))

    const verified_docs = await prisma.document.findMany({
        where: {
            userId: user.id,
            updatedAt: {
                gte: currDate
            }
        }
    })

    res.status(httpStatus.CREATED).send({
        question,
        answer,
        user,
        trust_score: verified_docs.length * 5
    });


});





export default {
    verifyAadhar,
    verifyPAN,
    creditScore,
    getQuestion
};