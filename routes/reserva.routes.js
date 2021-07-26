const router = require("express").Router();

const AgendaModel = require("../models/Agenda.model");
const isAuthenticated = require("../middlewares/isAuthenticated");
const attachCurrentUser = require("../middlewares/attachCurrentUser");
const ReservaModel = require("../models/Reserva.model")
const UserModel = require("../models/User.model")

//Criar = Criar uma reserva (usuário autenticado é o usuário)
//":id" refere-se ao id da agenda, que vai estar no parâmetro de rota 
router.post("/agenda/:id/reserva", isAuthenticated, attachCurrentUser, async (req, res, next) => {
    try{
        //Extrair o "id" da Agenda do parâmeto de rota => desestruturação de obj
        const { id } = req.params;
      //Extrai informações do usuário logado e salva em loggedInUser
      const loggedInUser = req.currentUser;

      const newReserva = await ReservaModel.create({
        userId: loggedInUser._id,
        agendaId: id,
        ...req.body
      });

      // Insere o id da reserva recém-criada na Agenda
      const updatedAgenda = await AgendaModel.findOneAndUpdate(
        { _id: id },//procura a agenda pelo id = parametro de rota
        { $push: { reservaId: newReserva._id } },
        { new: true }
      );

      // Insere o id da reserva recém-criada na Agenda
      const updatedUser= await UserModel.findOneAndUpdate(
        { _id: loggedInUser._id },//procura o user pela currentuser 
        { $push: { reservaId: newReserva._id } },
        { new: true }
      );

      if (updatedAgenda && updatedUser) {
        return res.status(201).json(newReserva)
      }

      return res.status(404).json({
        error:
          "Não foi possível gravar a reserva pois a Agenda não foi encontrada.",
      });

    } catch (err) {
        next(err)
    }
  });

//cRud = Read todas as reserva (usuário autenticado é o usuário)
router.get("/reserva", isAuthenticated, attachCurrentUser, async (req, res, next) => {
  try{

    //Extrai informações do usuário logado e salva em loggedInUser
    const loggedInUser = req.currentUser;

    const reserva = await ReservaModel.find({
      userId: loggedInUser._id,
    }).populate("agendaId");

    return res.status(201).json(reserva)

  } catch (err) {
      next(err)
  }
});


//cRud = Read Reserva Específica (usuário autenticado é o usuário)
router.get("/reserva/:id", isAuthenticated, attachCurrentUser, async (req, res, next) => {
  try{
    const { id } = req.params
    //Extrai informações do usuário logado e salva em loggedInUser
    const loggedInUser = req.currentUser;

    const reserva = await ReservaModel.findOne({
      _id: id,
    }).populate("agendaId");

    return res.status(201).json(reserva)

  } catch (err) {
      next(err)
  }
});

//crUd = Update Reserva Específica (usuário autenticado é o usuário)
//":id" refere-se ao id da reserva específica, que vai estar no parâmetro de rota 
router.put("/reserva/:id", isAuthenticated, attachCurrentUser, async (req, res, next) => {
  try{
    const { id } = req.params
    //Extrai informações do usuário logado e salva em loggedInUser
    const loggedInUser = req.currentUser;

    const reservaUpdated = await ReservaModel.findOneAndUpdate(
      {_id: id},
      {$set: {...req.body}},
      { new: true })

    if(reservaUpdated){
      return res.status(201).json(reservaUpdated)
    }  
    return res.status(404).json({ error: "Reserva não encontrada" })
  } catch (err) {
      next(err)
  }
});

//cruD = Delete reserva (usuário autenticado é o usuário) => opção de alterar status para "Cancelada pelo usuário"
//":id" refere-se ao id da agenda, que vai estar no parâmetro de rota 
router.put("/reserva/:id", isAuthenticated, attachCurrentUser, async (req, res, next) => {
  try{
      //Extrair o "id" da Agenda do parâmeto de rota => desestruturação de obj
      const { id } = req.params;
    //Extrai informações do usuário logado e salva em loggedInUser
    const loggedInUser = req.currentUser;

    const reserva = await ReservaModel.findOne({
      _id: id,
    }).populate("agendaId");

    const deletionReserva = await ReservaModel.findOneAndUpdate(
      { _id: id },
      {$set: {...req.body}},
      { new: true}
      );
      
    if(reservaUpdated){
      return res.status(201).json(reservaUpdated)
    }  
    
    return res.status(404).json({ error: "Reserva não encontrada" })
    
  } catch (err) {
      next(err)
  }
});


//cruD = Delete reserva (usuário autenticado é o usuário)
//":id" refere-se ao id da agenda, que vai estar no parâmetro de rota 
router.delete("/reserva/:id", isAuthenticated, attachCurrentUser, async (req, res, next) => {
  try{
      //Extrair o "id" da Agenda do parâmeto de rota => desestruturação de obj
      const { id } = req.params;
    //Extrai informações do usuário logado e salva em loggedInUser
    const loggedInUser = req.currentUser;

    const reserva = await ReservaModel.findOne({
      _id: id,
    }).populate("agendaId");

    const deletionReserva = await ReservaModel.deleteOne({ _id: id });

    if(deletionReserva.n > 0){
      // Remover o id da Reserva em questão da referência da Agenda e do Usuário
    // Deletar o id da reserva  na Agenda
    const updatedAgenda = await AgendaModel.findOneAndUpdate(
      { _id: agendaId._id },//procura a agenda pelo id = parametro de rota
      { $pull: { reservaId: deletionReserva._id } },
      { new: true }
    );

    // Deletar o id da reserva no usuário
    const updatedUser= await UserModel.findOneAndUpdate(
      { _id: loggedInUser._id },//procura o user pela currentuser 
      { $pull: { reservaId: deletionReserva._id } },
      { new: true }
    );

    if (updatedAgenda && updatedUser) {
      return res.status(201).json(deletionReserva)
    }
    return res.status(404).json({
      error:
        "Não foi possível remover esta reserva, pois a Agenda e/ou Usuário não foi encontrado.",
    });
  }
  return res.status(404).json({ error: "Reserva não encontrada." });
  } catch (err) {
      next(err)
  }
});

module.exports = router;