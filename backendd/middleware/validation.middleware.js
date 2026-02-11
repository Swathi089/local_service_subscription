module.exports = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    res.status(400).json({
      message: "Validation failed",
      errors: err.errors || err.message
    });
  }
};
