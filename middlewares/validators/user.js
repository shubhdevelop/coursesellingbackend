import Joi from "joi";

const signUp = async (req, res, next) => {
  const Schema = Joi.object()
    .strict()
    .keys({
      fullname: Joi.string().required(),
      username: Joi.string()
        .required()
        .min(4)
        .max(20)
        .regex(/^[a-zA-Z0-9]+$/)
        .message(
          "Username must be between 4 and 20 characters long and contain only letters or numbers."
        ),
      email: Joi.string().required(),
      password: Joi.string().required(),
      phone: Joi.number().optional(),
      type: Joi.string().optional(),
    });

  try {
    await Schema.validateAsync(req.body);
    next();
  } catch (error) {
    console.error(`Error validating updateUser payload : ${error}`);
    res.send(error.details[0].message);
  }
};

const login = async (req, res, next) => {
  const Schema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });

  try {
    await Schema.validateAsync(req.body);
    next();
  } catch (error) {
    res.send(error.details[0].message);
  }
};

export { signUp, login };
