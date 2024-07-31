import express from 'express';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import deepvueAPI from '../../middlewares/deepvue';
import { kycValidation } from '../../validations';
import { kycController } from '../../controllers';

const router = express.Router();

router
    .route('/aadhar-verify')
    .get(auth('verifyAadhar'), deepvueAPI(), validate(kycValidation.verifyAadhar), kycController.verifyAadhar);

router
    .route('/pan-verify')
    .get(auth('verifyPAN'), deepvueAPI(), validate(kycValidation.verifyPAN), kycController.verifyPAN);



export default router;

/**
 * @swagger
 * tags:
 *   name: KYC
 *   description: Worker KYC management Flow APIS
 */

/**
 * @swagger
 * /kyc/aadhar-verify:
 *   get:
 *     summary: Verify aadhar number exists
 *     description: Only Gig workers can call this.
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: aadhar_number
 *         schema:
 *           type: string
 *         description: Aadhar card number
 *       - in: query
 *         name: mobile_number
 *         schema:
 *           type: string
 *         description: Your phone Number
 *     responses:       
 *       "200":
 *         description: Aadhar successfully verified
 *       "400":
 *         description: Invalid Aadhar or Mobile Number
 *       "500":
 *         description: Deepvue API failed
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

 /**
 *  @swagger
 *  /kyc/pan-verify:
 *   get:
 *     summary: Verify PAN number exists for a given name
 *     description: Only Gig workers can call this.
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pan_number
 *         schema:
 *           type: string
 *         description: PAN card number
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Name on your PAN Card
 *     responses:       
 *       "200":
 *         description: PAN successfully verified
 *       "400":
 *         description: Invalid Pan Details
 *       "500":
 *         description: Deepvue API failed
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
