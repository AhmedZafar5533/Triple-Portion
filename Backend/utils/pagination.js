/**
 * Paginates a Mongoose query
 * @param {Model} model - Mongoose model
 * @param {Object} query - Mongoose query object
 * @param {Object} options - Pagination options { page, limit, populate, sort }
 * @returns {Promise<Object>} - { results, total, page, totalPages }
 */
const paginate = async (model, query = {}, { page = 1, limit = 10, populate = '', sort = { createdAt: -1 } } = {}) => {
  const p = Math.max(1, parseInt(page));
  const l = Math.max(1, parseInt(limit));
  const skip = (p - 1) * l;

  const results = await model.find(query)
    .sort(sort)
    .skip(skip)
    .limit(l)
    .populate(populate)
    .lean();

  const total = await model.countDocuments(query);

  return {
    results,
    total,
    page: p,
    totalPages: Math.ceil(total / l)
  };
};

module.exports = { paginate };
