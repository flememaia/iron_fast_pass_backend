const router = require("express").Router();

const AgendaModel = require("../models/Agenda.model");
const isAuthenticated = require("../middlewares/isAuthenticated");
const attachCurrentEstab = require("../middlewares/attachCurrentEstab")
const EstabModel = require("../models/Estab.model")
const ReservaModel = require('../models/Reserva.model')

//Crud = Criar uma agenda (usuário autenticado é o estabelecimento)
router.post("/agenda", isAuthenticated, attachCurrentEstab, async (req, res, next) => {
    try{
      //Extrai informações do usuário logado e salva em loggedInUser
      const loggedInUser = req.currentUser;

      const newAgenda = await AgendaModel.create({
        estabId: loggedInUser._id,
        ...req.body
      });

      // Insere o id da agenda recém-criada no estabelecimento
      const updatedEstab = await EstabModel.findOneAndUpdate(
        { _id: loggedInUser._id },
        { $push: { agendaId: newAgenda._id } },
        { new: true }
      );

      if (updatedEstab) {
        return res.status(201).json(newAgenda)
      }

      return res.status(404).json({
        error:
          "Não foi possível gravar a agenda pois o estabelecimento não foi encontrado.",
      });
    } catch (err) {
        next(err)
    }
});

//cRud = Visualizar agenda específica (usuário autenticado é o estabelecimento)
//":id" refere-se ao id da agenda, que vai estar no parâmetro de rota 
router.get("/agenda/:id", isAuthenticated, attachCurrentEstab, async (req, res, next) => {
  try{
    //Extrair o "id" da Agenda do parâmeto de rota => desestruturação de obj
    const { id } = req.params;

    const agenda = await AgendaModel.findOne({ _id: id }).populate("estabId");
    
    if(agenda){
      return res.status(200).json(agenda)
    }
    return res.status(404).json({ error: "Agenda não encontrada" })
  } catch (err) {
      next(err)
  }
});

//cRud = Visualizar todas as Agendas (usuário autenticado é o estabelecimento)
router.get("/agenda", isAuthenticated, attachCurrentEstab, async (req, res, next) => {
  try{

    //Extrai informações do usuário logado e salva em loggedInUser
    const loggedInUser = req.currentUser;

    const agenda = await AgendaModel.find({estabId: loggedInUser._id}).populate("estabId");
    
    return res.status(200).json(agenda)
  } catch (err) {
      next(err)
  }
});

//crUd = Atualizar Agenda (usuário autenticado é o estabelecimento)
//":id" refere-se ao id da agenda, que vai estar no parâmetro de rota 
router.put("/agenda/:id", isAuthenticated, attachCurrentEstab, async (req, res, next) => {
  try{
    //Extrair o "id" da Agenda do parâmeto de rota => desestruturação de obj
    const { id } = req.params;

    const updatedAgenda = await AgendaModel.findOneAndUpdate(
      { _id: id },
      {$set: {...req.body}},
      {new: true, runValidators: true}
      );

    if(updatedAgenda){
      return res.status(200).json(updatedAgenda)
    }
    return res.status(404).json({ error: "Agenda não encontrada" })
  } catch (err) {
      next(err)
  }
});

//cruD = Deletar agenda (usuário autenticado é o estabelecimento)
//":id" refere-se ao id da agenda, que vai estar no parâmetro de rota 
router.delete("/agenda/:id", isAuthenticated, attachCurrentEstab, async (req, res, next) => {
  try{
    //Extrair o "id" da Agenda do parâmeto de rota => desestruturação de obj
    const { id } = req.params;

    //Extrai informações do usuário logado e salva em loggedInUser
    const loggedInUser = req.currentUser;

    const agenda = await AgendaModel.findOne({ _id: id });

    const deletionAgenda = await AgendaModel.deleteOne({ _id: id });
    
    if (deletionAgenda.n > 0) {
      // Remover o id da Agenda em questão de referências do estabelecimento

    const updatedEstab = await EstabModel.findOneAndUpdate(
      { _id: loggedInUser._id },
      { $pull: { agendaId: id } }, // O pull remove o elemento da array dentro do banco
      { new: true }
    );

    if (updatedEstab) {
      return res.status(201).json(deletionAgenda)
    }

    return res.status(404).json({
      error:
        "Não foi possível remover esta agenda do estabelecimento, pois o estabelecimento não foi encontrado.",
    });
  }
  return res.status(404).json({ error: "Agenda não encontrada." });
  } catch (err) {
      next(err)
  }
});

module.exports = router;