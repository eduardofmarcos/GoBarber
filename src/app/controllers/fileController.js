import File from './../models/File';

class FileController {
  async store(req, res) {
    const name = req.file.originalname;
    const path = req.file.filename;

    const file = await File.create({
      name,
      path
    });
    res.status(201).json(file);
  }
}
export default new FileController();
