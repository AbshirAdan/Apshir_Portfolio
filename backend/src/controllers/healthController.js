const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const getHealth = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(true, 'Server is healthy', {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    })
  );
});

module.exports = { getHealth };
