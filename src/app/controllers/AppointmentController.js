import Appointment from './../models/Appointment';
import notification from './../schemas/notification';
import User from './../models/User';
import File from './../models/File';
import pt from 'date-fns/locale/pt';
import { startOfHour, parseISO, isBefore, format } from 'date-fns';
import * as Yup from 'yup';

class AppoimentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url']
            }
          ]
        }
      ]
    });
    return res.status(200).json(appointments);
  }

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

    const hourStart = startOfHour(parseISO(date));
    /** check for past dates**/
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({
        message: 'Past date are not permited!'
      });
    }
    /** check for date avalialibity**/

    const checkAvaliability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart
      }
    });

    if (checkAvaliability) {
      return res.status(400).json({
        message: 'Appointment is not avaliable at this time!'
      });
    }

    const appointment = await Appointment.create({
      user_id: req.userId, // que nao é um provider
      provider_id,
      date: hourStart
    });

    /** Notify service provider**/

    const user = await User.findByPk(req.userId);
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM',' 'as' H:mm'h'",
      { locale: pt }
    );

    await notification.create({
      content: `Você recebeu um agendamento de ${user.name} para o ${formattedDate}`,
      user: provider_id
    });
    return res.json(appointment);
  }
}
export default new AppoimentController();
