import Appointment from './../models/Appointment';
import notification from './../schemas/notification';
import User from './../models/User';
import File from './../models/File';
import pt from 'date-fns/locale/pt';
import Mail from './../../lib/Mail';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import * as Yup from 'yup';

class AppoimentController {
  //show appointments

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

  //create appointment
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
    //console.log(provider_id);
    //Check if a provider_id is a true provider
    const checkProvider = await User.findOne({
      where: { id: provider_id, provider: true }
    });

    if (!checkProvider) {
      return res.status(401).json({
        message: 'This user is not a provider'
      });
    }

    if (provider_id === req.userId) {
      return res.status(401).json({
        message: 'You can not create a appointment to yourself :)'
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
    console.log(hourStart);
    const appointment = await Appointment.create({
      user_id: req.userId, // que nao é um provider
      provider_id,
      date: hourStart
    });

    //create notify

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

  async delete(req, res) {
    //console.log(req.params.id);
    const appointmentToCancel = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email']
        },
        {
          model: User,
          as: 'user',
          attributes: ['name']
        }
      ]
    });
    //console.log(appointmentToCancel);
    if (appointmentToCancel.user_id !== req.userId)
      return res.status(401).json({
        message: 'You do not have the permission to cancel this appointment'
      });

    const dateWithSub = subHours(appointmentToCancel.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        message: 'You can not cancel an appointment less than 2 hours to go! '
      });
    }

    appointmentToCancel.canceled_at = new Date();

    await appointmentToCancel.save();

    await Mail.sendMail({
      to: `${appointmentToCancel.provider.name} <${appointmentToCancel.provider.email}>`,
      subject: 'Agendamento cancelado',
      template: 'cancelattions',
      context: {
        provider: appointmentToCancel.provider.name,
        user: appointmentToCancel.user.name,
        date: format(
          appointmentToCancel.date,
          "'dia' dd 'de' MMMM',' 'as' H:mm'h'",
          { locale: pt }
        )
      }
    });

    return res.status(200).json(appointmentToCancel);
  }
}
export default new AppoimentController();
