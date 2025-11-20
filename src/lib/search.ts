// import User from "../models/user.model";
// import Post from "../models/post.model";
// import Shop from "../models/shop";
// import Product from "../models/product";

// import catchAsync from "../utils/catchAsync";
// import AppError from "../utils/appError";

// exports.searchForPost = catchAsync(async (req, res, next) => {
//   const { value } = req.body;

//   // Search for posts
//   const posts = await Post.find({ removed: false });
//   const filteredPosts = posts.filter((post) => {
//     return (
//       post.title.toLowerCase().trim().includes(value.toLowerCase()) ||
//       post.content.toLowerCase().trim().includes(value.toLowerCase())
//     );
//   });

//   // Search for users
//   const users = await User.find();
//   const filteredUsers = users.filter((user) => {
//     return (
//       user?.username?.toLowerCase().trim().includes(value.toLowerCase()) ||
//       user?.name?.toLowerCase().trim().includes(value.toLowerCase())
//     );
//   });

//   // Search for shops
//   const shops = await Shop.find();
//   const filteredShops = shops.filter((shop) => {
//     return (
//       shop?.name?.toLowerCase().trim().includes(value.toLowerCase()) ||
//       shop?.location?.toLowerCase().trim().includes(value.toLowerCase())
//     );
//   });

//   // Search for products
//   const products = await Product.find();
//   const filteredProducts = products.filter((product) => {
//     return (
//       product?.name?.toLowerCase().trim().includes(value.toLowerCase()) ||
//       product?.category?.toLowerCase().trim().includes(value.toLowerCase())
//     );
//   });

//   // Return all filtered data in the response
//   res.status(200).json({
//     success: true,
//     message: "Request Successful",
//     data: {
//       posts: filteredPosts,
//       users: filteredUsers,
//       shops: filteredShops,
//       products: filteredProducts,
//     },
//   });
// });
