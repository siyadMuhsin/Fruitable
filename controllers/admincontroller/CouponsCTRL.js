const Coupon= require('../../models/CouponsModel')

const getCoupons= async(req,res)=>{

    try{
        const page= parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 5

        const skip= (page-1)*limit

        const coupons= await Coupon.find()
           .skip(skip)
           .limit(limit)

           const totalCoupons= await Coupon.countDocuments()
           const totalPages = Math.ceil(totalCoupons/limit)
        res.render('../views/admin/coupons',{
            coupons,
            currentPage:page,
            totalPages
        })
    }catch(error){
        console.log(error )
    }
}


const createCoupon= async (req,res)=>{


    try {
        const {code,discount,minPrice,startDate,endDate}=req.body

        if (!code || discount < 0 || discount > 100 || minPrice < 0 || new Date(startDate) < new Date() || new Date(endDate) <= new Date(startDate)) {
            return res.status(400).json({ success: false, message: 'Invalid input data' });
        }

        let changeCode= code.toUpperCase()
        const check = await Coupon.find({code:changeCode})
 
        if(check.length>0){
            if(check){
                return res.status(404).json({ success: false, message: 'Coupon Code Already used' });
            }

        }
        
        const coupon = new Coupon({
            code:changeCode,
            discount,
            minPrice,
            startDate,
            endDate
    
        })
        await coupon.save()
        res.status(201).json({ success: true, message: 'Coupon created successfully!' });
    
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
        
    }
   
}

// update coupons
const updateCoupon = async( req,res)=>{
  
    try {
        const couponId = req.params.id
        const {code,discount,minPrice,startDate,endDate}=req.body
        if (!code || discount < 0 || discount > 100 || minPrice < 0 || new Date(startDate) < new Date() || new Date(endDate) <= new Date(startDate)) {
            return res.status(400).json({ success: false, message: 'Invalid input data' });
        }
        let changeCode= code.toUpperCase()
      
        const check = await Coupon.find({code:changeCode})
        if(check){
            return res.status(404).json({ success: false, message: 'Coupon Code Already used' });
        }
       const updatedCoupon= await Coupon.findByIdAndUpdate(couponId,{
        code:changeCode,
        discount,
        minPrice,
        startDate,
        endDate
       },{new: true})
        
       if (!updatedCoupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    
    res.json({ success: true, message: 'Coupon updated successfully'});
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Server error' });
        
    }
}
// coupon activate and deactivate 
const couponStatus = async (req,res)=>{
    
    const couponId = req.params.id;
    const { active } = req.body;

    try {
      
        const coupon = await Coupon.findByIdAndUpdate(couponId, { active }, { new: true });  
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        res.status(200).json({ message: 'Coupon updated successfully', coupon });
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).json({ message: 'Server error' });
    }

}
module.exports={
    getCoupons,
    createCoupon,
    updateCoupon,
    couponStatus
}