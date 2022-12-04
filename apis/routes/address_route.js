const express = require('express');

const router = express.Router();


const { address_controller } = require('../controllers');

/**
 * @swagger
 * tags:
 *   name: Address
 *   description: The user managing API
 */
/**
 * @swagger
 * /api/address/provinces:
 *   get:
 *     summary: List provinces
 *     tags: [Address]
 *     responses:
 *       200:
 *         description: List provinces
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 *
 */
router.get('/provinces', address_controller.provinceList);

/**
 * @swagger
 * /api/address/districts:
 *   get:
 *     summary: List districts by province code
 *     tags: [Address]
 *     parameters:
 *     - in: query
 *       name: provinceCode
 *       type: string
 *       description: province code
 *     responses:
 *       200:
 *         description: List district by province code
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 *
 */
router.get('/districts', address_controller.districtList);

/**
 * @swagger
 * /api/address/wards:
 *   get:
 *     summary: List ward by district code
 *     tags: [Address]
 *     parameters:
 *     - in: query
 *       name: districtCode
 *       type: string
 *       description: district code
 *     responses:
 *       200:
 *         description: List ward by district code
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 *
 */
router.get('/wards', address_controller.wardList);

module.exports = router;