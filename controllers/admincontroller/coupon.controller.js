const Coupon = require('../../models/coupon.model');
const httpStatus = require('../../types/HTTP_STATUS');

const getCoupons = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

        const skip = (page - 1) * limit;

        const coupons = await Coupon.find()
            .skip(skip)
            .limit(limit);

        const totalCoupons = await Coupon.countDocuments();
        const totalPages = Math.ceil(totalCoupons / limit);

        res.status(httpStatus.OK).render('../views/admin/coupons', {
            coupons,
            currentPage: page,
            totalPages
        });
    } catch (error) {
        console.error(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Internal Server Error');
    }
};

const createCoupon = async (req, res) => {
    try {
        const { code, discount, minPrice, startDate, endDate } = req.body;

        if (
            !code ||
            discount < 0 ||
            discount > 100 ||
            minPrice < 0 ||
            new Date(startDate) < new Date() ||
            new Date(endDate) <= new Date(startDate)
        ) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Invalid input data'
            });
        }

        const changeCode = code.toUpperCase();
        const check = await Coupon.find({ code: changeCode });

        if (check.length > 0) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Coupon Code Already used'
            });
        }

        const coupon = new Coupon({
            code: changeCode,
            discount,
            minPrice,
            startDate,
            endDate
        });

        await coupon.save();
        res.status(httpStatus.CREATED).json({
            success: true,
            message: 'Coupon created successfully!'
        });
    } catch (error) {
        console.error(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// update coupon
const updateCoupon = async (req, res) => {
    try {
        const couponId = req.params.id;
        const { code, discount, minPrice, startDate, endDate } = req.body;

        if (
            !code ||
            discount < 0 ||
            discount > 100 ||
            minPrice < 0 ||
            new Date(startDate) < new Date() ||
            new Date(endDate) <= new Date(startDate)
        ) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Invalid input data'
            });
        }

        const changeCode = code.toUpperCase();

        const check = await Coupon.find({ code: changeCode, _id: { $ne: couponId } });
        if (check.length > 0) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Coupon Code Already used'
            });
        }

        const updatedCoupon = await Coupon.findByIdAndUpdate(
            couponId,
            {
                code: changeCode,
                discount,
                minPrice,
                startDate,
                endDate
            },
            { new: true }
        );

        if (!updatedCoupon) {
            return res.status(httpStatus.NOT_FOUND).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        res.status(httpStatus.OK).json({
            success: true,
            message: 'Coupon updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Server error'
        });
    }
};

// activate/deactivate coupon
const couponStatus = async (req, res) => {
    const couponId = req.params.id;
    const { active } = req.body;

    try {
        const coupon = await Coupon.findByIdAndUpdate(
            couponId,
            { active },
            { new: true }
        );

        if (!coupon) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Coupon not found'
            });
        }

        res.status(httpStatus.OK).json({
            message: 'Coupon updated successfully',
            coupon
        });
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Server error'
        });
    }
};

module.exports = {
    getCoupons,
    createCoupon,
    updateCoupon,
    couponStatus
};
