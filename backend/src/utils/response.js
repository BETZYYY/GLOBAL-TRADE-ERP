/**
 * response.js – Consistent JSON response helpers
 */

const ok = (res, data, message = 'Success', statusCode = 200, meta = null) => {
  const body = { success: true, message, data };
  if (meta) body.pagination = meta;
  return res.status(statusCode).json(body);
};

const created = (res, data, message = 'Created successfully') =>
  ok(res, data, message, 201);

const fail = (res, message = 'An error occurred', statusCode = 400, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

const notFound = (res, entity = 'Data') =>
  fail(res, `${entity} not found.`, 404);

const forbidden = (res, message = 'Akses ditolak.') =>
  fail(res, message, 403);

const paginate = (page, limit, total) => ({
  page: +page,
  limit: +limit,
  total,
  totalPages: Math.ceil(total / limit),
});

module.exports = { ok, created, fail, notFound, forbidden, paginate };
