import Joi from "joi";

const createCourse = async (req, res, next) => {
  const Schema = Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    instructor: Joi.string().required(),
    price: Joi.number().required(),
    duration: Joi.number()
      .min(1)
      .message(
        "Course duaration can't be less than 1 week, and time is in week!"
      ),
    published: Joi.boolean().optional(),
  });
  try {
    await Schema.validateAsync(req.body);
    next();
  } catch (error) {
    res.send(error.details[0].message);
  }
};

export { createCourse };
