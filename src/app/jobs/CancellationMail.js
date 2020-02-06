import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from './../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { appointmentToCancel } = data;
    console.log('a fila executou');
    await Mail.sendMail({
      to: `${appointmentToCancel.provider.name} <${appointmentToCancel.provider.email}>`,
      subject: 'Agendamento cancelado',
      template: 'cancelattions',
      context: {
        provider: appointmentToCancel.provider.name,
        user: appointmentToCancel.user.name,
        date: format(
          parseISO(appointmentToCancel.date),
          "'dia' dd 'de' MMMM',' 'as' H:mm'h'",
          { locale: pt }
        )
      }
    });
  }
}

export default new CancellationMail();
