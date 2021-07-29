const router = require("express").Router();

const AgendaModel = require("../models/Agenda.model");
const isAuthenticated = require("../middlewares/isAuthenticated");
const attachCurrentUser = require("../middlewares/attachCurrentUser");
const UserModel = require("../models/User.model");
const AvaliarAppModel = require("../models/AvaliarApp.model");

//Criar = Criar uma avaliação do app (usuário cliente autenticado)
//":id" refere-se ao id da agenda, que vai estar no parâmetro de rota
//verificar se realmente estará linkado com a agenda
router.post(
  "/agenda/:id/avaliarapp",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      //Extrair o "id" da Agenda do parâmeto de rota => desestruturação de obj
      const { id } = req.params;
      //Extrai informações do usuário logado e salva em loggedInUser
      const loggedInUser = req.currentUser;

      const newAvaliarApp = await AvaliarAppModel.create({
        userId: loggedInUser._id,
        agendaId: id,
        ...req.body,
      });

      // Insere o id da avaliação do app recém-criada na Agenda
      const updatedAgenda = await AgendaModel.findOneAndUpdate(
        { _id: id }, //procura a agenda pelo id = parametro de rota
        { $push: { avaliarAppId: newAvaliarApp._id } },
        { new: true }
      );

      // Insere o id da avaliação do app recém-criada na Agenda
      const updatedUser = await UserModel.findOneAndUpdate(
        { _id: loggedInUser._id }, //procura o user pela currentuser
        { $push: { avaliarAppId: newAvaliarApp._id } },
        { new: true }
      );

      if (updatedAgenda && updatedUser) {
        return res.status(201).json(newAvaliarApp);
      }

      return res.status(404).json({
        error:
          "Não foi possível gravar a avaliação do app pois a Agenda não foi encontrada.",
      });
    } catch (err) {
      next(err);
    }
  }
);

//FRONT => RENDERIZAR TODAS AS AVALIAÇÕES DO APP DO USUÁRIO NO CLIENT.PROFILE
//cRud = Read todas as AVALIAÇÕES DO APP (usuário autenticado é o usuário)
router.get(
  "/avaliarapp",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      //Extrai informações do usuário logado e salva em loggedInUser
      const loggedInUser = req.currentUser;

      const avaliarapp = await AvaliarAppModel.find({
        userId: loggedInUser._id,
      }).populate("agendaId");

      return res.status(201).json(avaliarapp);
    } catch (err) {
      next(err);
    }
  }
);

//cRud = Read avaliação do app Específica (usuário autenticado é o usuário)
// :id => id de uma avaliação do app especifica
router.get(
  "/avaliarapp/:id",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      //Extrai informações do usuário logado e salva em loggedInUser
      const loggedInUser = req.currentUser;

      const avaliarapp = await AvaliarAppModel.findOne({
        _id: id,
      }).populate("agendaId");

      return res.status(201).json(avaliarapp);
    } catch (err) {
      next(err);
    }
  }
);

//crUd = Update avaliação do app Específica (usuário autenticado é o usuário)
//":id" refere-se ao id da avaliação do app específica, que vai estar no parâmetro de rota
router.put(
  "/avaliarapp/:id",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      //Extrai informações do usuário logado e salva em loggedInUser
      const loggedInUser = req.currentUser;

      const avaliarappUpdated = await AvaliarAppModel.findOneAndUpdate(
        { _id: id },
        { $set: { ...req.body } },
        { new: true }
      );

      if (avaliarappUpdated) {
        return res.status(201).json(avaliarappUpdated);
      }
      return res.status(404).json({ error: "Avaliação do app não encontrada" });
    } catch (err) {
      next(err);
    }
  }
);

//cruD = Delete avaliação do app (usuário autenticado é o usuário) => opção de alterar status para "Cancelada pelo usuário"
//":id" refere-se ao id da agenda, que vai estar no parâmetro de rota
router.put(
  "/avaliarapp/:id",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      //Extrair o "id" da Agenda do parâmeto de rota => desestruturação de obj
      const { id } = req.params;
      //Extrai informações do usuário logado e salva em loggedInUser
      const loggedInUser = req.currentUser;

      const avaliarapp = await AvaliarAppModel.findOne({
        _id: id,
      }).populate("agendaId");

      const deletionavaliarapp = await AvaliarAppModel.findOneAndUpdate(
        { _id: id },
        { $set: { ...req.body } },
        { new: true }
      );

      if (avaliarappUpdated) {
        return res.status(201).json(avaliarappUpdated);
      }

      return res.status(404).json({ error: "Avaliação do app não encontrada" });
    } catch (err) {
      next(err);
    }
  }
);

//cruD = Delete avaliação do app (usuário autenticado é o usuário)
//":id" refere-se ao id da agenda, que vai estar no parâmetro de rota
router.delete(
  "/avaliarapp/:id",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      //Extrair o "id" da Agenda do parâmeto de rota => desestruturação de obj
      const { id } = req.params;
      //Extrai informações do usuário logado e salva em loggedInUser
      const loggedInUser = req.currentUser;

      const avaliarapp = await AvaliarAppModel.findOne({
        _id: id,
      }).populate("agendaId");

      const deletionavaliarapp = await AvaliarAppModel.deleteOne({
        _id: id,
      });

      if (deletionavaliarapp.n > 0) {
        // Remover o id da Avaliação do App em questão da referência da Agenda e do Usuário
        // Deletar o id da Avaliação do App  na Agenda
        const updatedAgenda = await AgendaModel.findOneAndUpdate(
          { _id: agendaId._id }, //procura a agenda pelo id = parametro de rota
          { $pull: { avaliarAppId: deletionavaliarapp._id } },
          { new: true }
        );

        // Deletar o id da Avaliação do App no usuário
        const updatedUser = await UserModel.findOneAndUpdate(
          { _id: loggedInUser._id }, //procura o user pela currentuser
          { $pull: { avaliarAppId: deletionavaliarapp._id } },
          { new: true }
        );

        if (updatedAgenda && updatedUser) {
          return res.status(201).json(deletionavaliarapp);
        }
        return res.status(404).json({
          error:
            "Não foi possível remover esta Avaliação do App, pois a Agenda e/ou Usuário não foi encontrado.",
        });
      }
      return res
        .status(404)
        .json({ error: "Avaliação do App não encontrada." });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
