const httpStatus = require('http-status');
const catchAsync = require('../utils/catch-async');
const CustomError = require('../utils/custom-error');
const { getProvinces, getDistrictsByProvinceCode, getWardsByDistrictCode } = require('sub-vn');

const provinceList = catchAsync(async (req, res, next) => {
    const result = getProvinces();
    return res.status(httpStatus.OK).json({
        success: true,
        datas: result,
    });
});

const districtList = catchAsync(async (req, res, next) => {
    const { provinceCode } = req.query;
    const result = getDistrictsByProvinceCode(provinceCode);
    return res.status(httpStatus.OK).json({
        success: true,
        datas: result,
    });
});

const wardList = catchAsync(async (req, res, next) => {
    const { districtCode } = req.query;
    const result = getWardsByDistrictCode(districtCode);
    return res.status(httpStatus.OK).json({
        success: true,
        datas: result,
    });
});

module.exports = {
    provinceList,
    districtList,
    wardList
};