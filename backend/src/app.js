const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');

const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const { ensureDir } = require('./middleware/upload');

ensureDir(path.join(config.upload.dir, 'cv'));
ensureDir(path.join(config.upload.dir, 'images'));

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(config.upload.dir));

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
