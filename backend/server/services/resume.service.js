const ResumeRepository = require('../repositories/resume.repository');
const ApiError = require('../utils/ApiError');
const { toPublicUrl, parseFilename } = require('../utils/fileUrl');
const { getPdfPageCount } = require('../utils/resumeMeta');
const { requireFound } = require('../utils/helpers');
const HTTP = require('../constants/httpStatus');

const repo = new ResumeRepository();

const serializeResume = (r) => {
  if (!r) return null;
  return {
    id: r.id,
    file_url: r.file_url,
    file_name: r.file_name || parseFilename(r.file_url) || 'resume.pdf',
    file_size: r.file_size ?? null,
    page_count: r.page_count ?? null,
    version: r.version || '1.0',
    description: r.description || null,
    is_active: Boolean(r.is_active),
    created_at: r.created_at,
    updated_at: r.updated_at || r.created_at,
  };
};

const getAll = async () => (await repo.findAll()).map(serializeResume);

const getActive = async () => {
  const resume = await repo.getActive();
  if (!resume) throw new ApiError(HTTP.NOT_FOUND, 'No active resume found');
  return serializeResume(resume);
};

const getActivePublic = async () => {
  const resume = await repo.getActive();
  return serializeResume(resume);
};

const broadcastUpdate = (action, resume) => {
  try {
    const { getIO } = require('../socket');
    const io = getIO();
    if (io) {
      io.emit('resume:update', { action, resume });
    }
  } catch (err) {
    console.error('[Socket Broadcast Error]:', err);
  }
};

const create = async (file, { version, description } = {}) => {
  if (!file) throw new ApiError(HTTP.BAD_REQUEST, 'Resume file required');

  const pageCount = file.path ? await getPdfPageCount(file.path) : null;

  const created = await repo.create({
    file_url: toPublicUrl('resumes', file.filename),
    file_name: file.originalname || parseFilename(file.filename),
    file_size: file.size || null,
    page_count: pageCount,
    version: version || '1.0',
    description: description || null,
  });

  const serialized = serializeResume(created);
  broadcastUpdate('upload', serialized);
  return serialized;
};

const update = async (id, { version, description }) => {
  const updated = requireFound(
    await repo.updateById(id, { version, description }),
    'Resume not found'
  );
  const serialized = serializeResume(updated);
  broadcastUpdate('update', serialized);
  return serialized;
};

const remove = async (id) => {
  requireFound(await repo.deleteById(id), 'Resume not found');
  const activeResume = await repo.getActive();
  const serialized = serializeResume(activeResume);
  broadcastUpdate('delete', serialized);
  return { ok: true };
};

module.exports = {
  getAll,
  getActive,
  getActivePublic,
  create,
  update,
  remove,
  serializeResume,
};
