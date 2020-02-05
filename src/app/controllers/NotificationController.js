import Notification from './../schemas/notification';
import User from './../models/User';

class NotificationController {
  async index(req, res) {
    const checkProvider = await User.findOne({
      where: { id: req.userId, provider: true }
    });

    if (!checkProvider) {
      return res.status(401).json({
        message: 'Only providers can load notifications'
      });
    }

    const notifications = await Notification.find({
      user: req.userId
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.status(200).json(notifications);
  }

  async update(req, res) {
    const idToUpdate = req.params.id;
    const notitication = await Notification.findByIdAndUpdate(idToUpdate, {
      read: true,
      new: true
    });
    return res.status(200).json(notitication);
  }
}

export default new NotificationController();
