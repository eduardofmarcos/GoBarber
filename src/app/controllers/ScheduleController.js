import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import User from './../models/User';
import Appointment from './../models/Appointment';

class ScheduleController {
  async index(req, res) {
    const checkuserProvider = await User.findOne({
      where: { id: req.userId }
    });

    if (!checkuserProvider.provider) {
      return res.status(400).json({ message: 'User is not a provider!' });
    }

    const { date } = req.query;
    const parsedDate = parseISO(date);

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)]
        }
      },
      order: ['date']
    });
    return res.status(200).json(appointments);
  }
}

export default new ScheduleController();
