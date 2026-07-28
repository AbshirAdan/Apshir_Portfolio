const ApiError = require('../../server/utils/ApiError');
const ApiResponse = require('../../server/utils/ApiResponse');
const HTTP = require('../../server/constants/httpStatus');

describe('ApiResponse', () => {
  it('creates success envelope with data', () => {
    const res = new ApiResponse(true, 'OK', { id: 1 });
    expect(res.success).toBe(true);
    expect(res.message).toBe('OK');
    expect(res.data).toEqual({ id: 1 });
  });

  it('omits data when null', () => {
    const res = new ApiResponse(true, 'Deleted', null);
    expect(res.data).toBeUndefined();
  });
});

describe('ApiError', () => {
  it('stores status code and validation errors', () => {
    const err = new ApiError(HTTP.UNPROCESSABLE, 'Validation failed', [
      { field: 'email', message: 'Invalid email' },
    ]);
    expect(err.statusCode).toBe(422);
    expect(err.errors).toHaveLength(1);
    expect(err.name).toBe('ApiError');
  });
});
