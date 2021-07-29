const router = require("express").Router();

const AgendaModel = require("../models/Agenda.model");
const isAuthenticated = require("../middlewares/isAuthenticated");
const attachCurrentUser = require("../middlewares/attachCurrentUser");
const UserModel = require("../models/User.model");
const AvaliarEstabModel = require("../models/AvaliarEstab.model");

//Criar = Criar uma avaliação do estabelecimento (usuário cliente autenticado)
//":id" refere-se ao id da agenda, que vai estar no parâmetro de rota
router.post(
  "/agenda/:id/avaliarestab",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      //Extrair o "id" da Agenda do parâmeto de rota => desestruturação de obj
      const { id } = req.params;
      //Extrai informações do usuário logado e salva em loggedInUser
      const loggedInUser = req.currentUser;

      const newAvaliarEstab = await AvaliarEstabModel.create({
        userId: loggedInUser._id,
        agendaId: id,
        ...req.body,
      });

      // Insere o id da avaliação do estabelecimento recém-criada na Agenda
      const updatedAgenda = await AgendaModel.findOneAndUpdate(
        { _id: id }, //procura a agenda pelo id = parametro de rota
        { $push: { avaliarEstabId: newAvaliarEstab._id } },
        { new: true }
      );

      // Insere o id da avaliação do estabelecimento recém-criada na Agenda
      const updatedUser = await UserModel.findOneAndUpdate(
        { _id: loggedInUser._id }, //procura o user pela currentuser
        { $push: { avaliarEstabId: newAvaliarEstab._id } },
        { new: true }
      );

      if (updatedAgenda && updatedUser) {
        return res.status(201).json(newAvaliarEstab);
      }

      return res.status(404).json({
        error:
          "Não foi possível gravar a avaliação do estabelecimento pois a Agenda não foi encontrada.",
      });
    } catch (err) {
      next(err);
    }
  }
);

//FRONT => RENDERIZAR TODAS AS AVALIAÇÕES DO ESTABELECIMENTO DO USUÁRIO NO CLIENT.PROFILE
//cRud = Read todas as AVALIAÇÕES DO ESTABELECIMENTO (usuário autenticado é o usuário)
router.get(
  "/avaliarestab",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      //Extrai informações do usuário logado e salva em loggedInUser
      const loggedInUser = req.currentUser;

      const avaliarestab = await AvaliarEstabModel.find({
        userId: loggedInUser._id,
      }).populate("agendaId");

      return res.status(201).json(avaliarestab);
    } catch (err) {
      next(err);
    }
  }
);

//cRud = Read avaliação do estabelecimento Específica (usuário autenticado é o usuário)
// :id => id de uma avaliação do estabelecimento especifica
router.get(
  "/avaliarestab/:id",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      //Extrai informações do usuário logado e salva em loggedInUser
      const loggedInUser = req.currentUser;

      const avaliarestab = await AvaliarEstabModel.findOne({
        _id: id,
      }).populate("agendaId");

      return res.status(201).json(avaliarestab);
    } catch (err) {
      next(err);
    }
  }
);

//crUd = Update avaliação do estabelecimento Específica (usuário autenticado é o usuário)
//":id" refere-se ao id da avaliação do estabelecimento específica, que vai estar no parâmetro de rota
router.put(
  "/avaliarestab/:id",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      //Extrai informações do usuário logado e salva em loggedInUser
      const loggedInUser = req.currentUser;

      const avaliarEstabUpdated = await AvaliarEstabModel.findOneAndUpdate(
        { _id: id },
        { $set: { ...req.body } },
        { new: true }
      );

      if (avaliarEstabUpdated) {
        return res.status(201).json(avaliarEstabUpdated);
      }
      return res
        .status(404)
        .json({ error: "Avaliação do estabelecimento não encontrada" });
    } catch (err) {
      next(err);
    }
  }
);

//cruD = Delete avaliação do estabelecimento (usuário autenticado é o usuário) => opção de alterar status para "Cancelada pelo usuário"
//":id" refere-se ao id da agenda, que vai estar no parâmetro de rota
router.put(
  "/avaliarestab/:id",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      //Extrair o "id" da Agenda do parâmeto de rota => desestruturação de obj
      const { id } = req.params;
      //Extrai informações do usuário logado e salva em loggedInUser
      const loggedInUser = req.currentUser;

      const avaliarestab = await AvaliarEstabModel.findOne({
        _id: id,
      }).populate("agendaId");

      const deletionAvaliarEstab = await AvaliarEstabModel.findOneAndUpdate(
        { _id: id },
        { $set: { ...req.body } },
        { new: true }
      );

      if (avaliarEstabUpdated) {
        return res.status(201).json(avaliarEstabUpdated);
      }

      return res
        .status(404)
        .json({ error: "Avaliação do estabelecimento não encontrada" });
    } catch (err) {
      next(err);
    }
  }
);

//cruD = Delete avaliação do estabelecimento (usuário autenticado é o usuário)
//":id" refere-se ao id da agenda, que vai estar no parâmetro de rota
router.delete(
  "/avaliarestab/:id",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      //Extrair o "id" da Agenda do parâmeto de rota => desestruturação de obj
      const { id } = req.params;
      //Extrai informações do usuário logado e salva em loggedInUser
      const loggedInUser = req.currentUser;

      const avaliarEstab = await AvaliarEstabModel.findOne({
        _id: id,
      }).populate("agendaId");

      const deletionAvaliarEstab = await AvaliarEstabModel.deleteOne({
        _id: id,
      });

      if (deletionAvaliarEstab.n > 0) {
        // Remover o id da Avaliação do Estab em questão da referência da Agenda e do Usuário
        // Deletar o id da Avaliação do Estab  na Agenda
        const updatedAgenda = await AgendaModel.findOneAndUpdate(
          { _id: agendaId._id }, //procura a agenda pelo id = parametro de rota
          { $pull: { avaliarEstabId: deletionAvaliarEstab._id } },
          { new: true }
        );

        // Deletar o id da Avaliação do Estab no usuário
        const updatedUser = await UserModel.findOneAndUpdate(
          { _id: loggedInUser._id }, //procura o user pela currentuser
          { $pull: { avaliarEstabId: deletionAvaliarEstab._id } },
          { new: true }
        );

        if (updatedAgenda && updatedUser) {
          return res.status(201).json(deletionAvaliarEstab);
        }
        return res.status(404).json({
          error:
            "Não foi possível remover esta Avaliação do Estabelecimento, pois a Agenda e/ou Usuário não foi encontrado.",
        });
      }
      return res
        .status(404)
        .json({ error: "Avaliação do Estabelecimento não encontrada." });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
