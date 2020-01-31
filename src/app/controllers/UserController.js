import User from './../models/User';

class UserController {
  async store(req, res) {
    const checkUserExist = await User.findOne({
      where: { email: req.body.email }
    });
    if (checkUserExist) {
      return res.status(400).json({
        message: 'User alredy exists'
      });
    }
    const { id, name, email, provider } = await User.create(req.body);
    return res.json({
      id,
      name,
      email,
      provider
    });
  }

  async update(req, res) {
    const { email, oldPassword } = req.body;
    const user = await User.findByPk(req.userId);
    console.log(user);

    if (email && email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({
          message: 'User already exists!'
        });
      }
    }
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ message: 'Password does not match!' });
    }

    const { id, name, provider } = await user.update(req.body);

    return res.status(201).json({
      id,
      name,
      email,
      provider
    });
  }
}
export default new UserController();
