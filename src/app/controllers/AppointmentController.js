import Appointment from './../models/Appointment';
import User from './../models/User';
import * as Yup from 'yup';

class AppoimentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      date: Yup.date().required(),
      provider_id: Yup.number().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        message: 'Invalid Fields!'
      });
    }

    const { provider_id, date } = req.body;
    console.log(provider_id);
    //Check if a provider_id is a true provider
    const checkProvider = await User.findOne({
      where: { id: provider_id, provider: true }
    });
    if (!checkProvider) {
      return res.status(401).json({
        message: 'This user is not a provider'
      });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date
    });

    return res.json(appointment);
  }
}
export default new AppoimentController();
