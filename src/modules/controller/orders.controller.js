import Orders from "../../modules/Model/Orders-modle.js";

export const getOrder = async (req, res, next) => {
  try {
    const doc = await Orders.find();
    if (!doc) {
      return res
        .status(500)
        .json({ success: true, message: "Order not found!" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Get orders successful!", data: doc });
  } catch (err) {
    next(err);
  }
};
