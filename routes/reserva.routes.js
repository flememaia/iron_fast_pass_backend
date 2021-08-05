const router = require("express").Router();

const AgendaModel = require("../models/Agenda.model");
const isAuthenticated= require("../middlewares/isAuthenticated");
const attachCurrentUser = require("../middlewares/attachCurrentUser");
const ReservaModel = require("../models/Reserva.model")
const UserModel = require("../models/User.model");
const attachCurrentEstab = require("../middlewares/attachCurrentEstab");
const EstabModel = require("../models/Estab.model");


//Criar = Criar uma reserva (usuário autenticado é o CLIENTE)
//":id" refere-se ao id da agenda, que vai estar no parâmetro de rota 
router.post("/agenda/:id/reserva", isAuthenticated, attachCurrentUser, async (req, res, next) => {
    try{
        //Extrair o "id" da Agenda do parâmeto de rota => desestruturação de obj
        const { id } = req.params;
      //Extrai informações do usuário logado e salva em loggedInUser
      const loggedInUser = req.currentUser;

      //Pegar a agenda para extrairmos o id do estabelecimento => estabId => agenda.estabId
      const agenda = await AgendaModel.findOne({
        _id: id,
      })

      // estabId => agenda.estabId
      const newReserva = await ReservaModel.create({
        userId: loggedInUser._id,
        agendaId: id,
        estabId: agenda.estabId,
        //não tem como preencher os detalhes abaixo, pq não estão no modelo. Podemos renderizar no FRONT.
        // nameEstab: agenda.nameEstab, 
        // evento: agenda.evento,
        // atracao: agenda.atracao,
        // data: agenda.data,
        // promocaoDoDia:agenda.promocaoDoDia,
        // taxa: agenda.taxa,
        ...req.body
      });

      const reserva = await ReservaModel.findOne({
        _id: newReserva._id,
      }).populate("agendaId");

      // Insere o id da reserva recém-criada na Agenda
      const updatedAgenda = await AgendaModel.findOneAndUpdate(
        { _id: id },//procura a agenda pelo id = parametro de rota
        { $push: { reservaId: newReserva._id } },
        { new: true }
      );

      // Insere o id da reserva recém-criada no usuário (cliente)
      const updatedUser = await UserModel.findOneAndUpdate(
        { _id: loggedInUser._id },//procura o user pela currentuser 
        { $push: { reservaId: newReserva._id } },
        { new: true }
      );

      // Insere o id da reserva recém-criada no estabelecimento 
      const updatedEstab = await EstabModel.findOneAndUpdate(
        { _id: agenda.estabId, },//procura o estabelecimento para gravar a reserva
        { $push: { reservaId: newReserva._id } },
        { new: true }
      );

      if (updatedAgenda && updatedUser && updatedEstab) {
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

//FRONT => RENDERIZAR TODAS AS RESERVAS DO USUÁRIO NO CLIENT.PROFILE  
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


//cRud = Read ESTABELECIMENTO - Todas as Reservas do estabelecimento
router.get("/reserva_estab", isAuthenticated, attachCurrentEstab, async (req, res, next) => {
  try{
    //Extrai informações do usuário logado e salva em loggedInUser
    const loggedInUser = req.currentUser;

    const reserva = await ReservaModel.find({
      estabId: loggedInUser._id,
    })

    return res.status(201).json(reserva)

  } catch (err) {
      next(err)
  }
});

// //cRud = DETAILS - Read Reserva Específica (usuário autenticado é o usuário)
// //":id" refere-se ao id da reserva específica, que vai estar no parâmetro de rota 
// router.get("/reserva/:id", isAuthenticated, attachCurrentUser, async (req, res, next) => {
//   try{
//     const { id } = req.params
//     //Extrai informações do usuário logado e salva em loggedInUser
//     const loggedInUser = req.currentUser;

//     const reserva = await ReservaModel.findOne({_id: id})

//     if(reserva){
//       return res.status(201).json(reserva)
//     }  
//     return res.status(404).json({ error: "Reserva não encontrada" })
//   } catch (err) {
//       next(err)
//   }
// });

//cRud = DETAILS - Read Reserva Específica (usuário autenticado é o ESTABELECIMENTO)
//":id" refere-se ao id da reserva específica, que vai estar no parâmetro de rota 
router.get("/reserva/:id", async (req, res, next) => {
  try{
    const { id } = req.params

    const reserva = await ReservaModel.findOne({_id: id})

    if(reserva){
      return res.status(201).json(reserva)
    }  
    return res.status(404).json({ error: "Reserva não encontrada" })
  } catch (err) {
      next(err)
  }
});

// //crUd = Update Reserva Específica (usuário autenticado é o usuário)
// //":id" refere-se ao id da reserva específica, que vai estar no parâmetro de rota 
// router.put("/reserva/:id", isAuthenticated, attachCurrentUser, async (req, res, next) => {
//   try{
//     const { id } = req.params
//     //Extrai informações do usuário logado e salva em loggedInUser
//     const loggedInUser = req.currentUser;

//     const reservaUpdated = await ReservaModel.findOneAndUpdate(
//       {_id: id},
//       {$set: {...req.body}},
//       { new: true })

//     if(reservaUpdated){
//       return res.status(201).json(reservaUpdated)
//     }  
//     return res.status(404).json({ error: "Reserva não encontrada" })
//   } catch (err) {
//       next(err)
//   }
// });

//crUd = Update Reserva Específica (usuário autenticado é o usuário)
//":id" refere-se ao id da reserva específica, que vai estar no parâmetro de rota 
router.put("/reserva/:id", async (req, res, next) => {
  try{
    const { id } = req.params
    
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