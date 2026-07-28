const CertificateRepository = require('../repositories/certificate.repository');
const { toPublicUrl } = require('../utils/fileUrl');
const { requireFound } = require('../utils/helpers');

const repo = new CertificateRepository();

const getAll = async () => repo.findAll();

const getById = async (id) =>
  requireFound(await repo.findById(id), 'Certificate not found');

const create = async (body, file) => {
  const image = file ? toPublicUrl('certificates', file.filename) : null;
  return repo.create({ ...body, image });
};

const update = async (id, body, file) => {
  requireFound(await repo.findById(id), 'Certificate not found');
  const image = file ? toPublicUrl('certificates', file.filename) : undefined;
  return requireFound(await repo.update(id, { ...body, image }), 'Certificate not found');
};

const remove = async (id) =>
  requireFound(await repo.deleteById(id), 'Certificate not found');

module.exports = { getAll, getById, create, update, remove };
