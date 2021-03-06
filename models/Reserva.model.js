const { Schema, model } = require("mongoose");

const ReservaSchema = new Schema({
  horario: { type: String, required: true, trim: true },
  quantidadeDePessoas: { type: Number, required: true, trim: true },
  status: { type: String, trim: true, enum: ["Aguardando Aprovação", "Aprovada", "Não Aprovada", 
  "Cancelada pelo Usuário", "Usuário Compareceu - emitir Avaliação", "Usuário Não Compareceu" ]},
  agendaId: { type: Schema.Types.ObjectId, ref: "Agenda" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  estabId: { type: Schema.Types.ObjectId, ref: "Estabelecimento" }
});

const ReservaModel = model("Reserva", ReservaSchema);
module.exports = ReservaModel;