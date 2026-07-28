const express = require('express');
const validate = require('../middlewares/validate.middleware');
const parseBlogBody = require('../middlewares/parseBlogBody.middleware');
const { uploadBlog } = require('../middlewares/upload.middleware');
const { createBlogRules, updateBlogRules, blogIdRule } = require('../validators/blog.validator');
const blogController = require('../controllers/blog.controller');

const router = express.Router();

router.get('/', blogController.getAll);
router.get('/:slug', blogController.getOne);
router.post('/', uploadBlog.single('cover_image'), parseBlogBody, validate(createBlogRules), blogController.create);
router.put('/:id', uploadBlog.single('cover_image'), parseBlogBody, validate(updateBlogRules), blogController.update);
router.delete('/:id', validate(blogIdRule), blogController.remove);

module.exports = router;
