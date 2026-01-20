function notFound(req, res) {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(status).json({
    message: err.message || "Server error",
  });
}

module.exports = { notFound, errorHandler };
