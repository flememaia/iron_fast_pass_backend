const { Schema, model } = require("mongoose");

const AgendaSchema = new Schema({
  nameEstab: { type: String, required: true, trim: true },
  evento: { type: String, required: true, trim: true },
  atracao: { type: String, required: true, trim: true },
  data: { type: Date },
  horario: { type: String, trim: true },
  limiteDeMesaDe4pessoas: { type: Number, required: true, trim: true },
  promocaoDoDia: { type: String, trim: true },
  taxa: { type: Number, required: true, trim: true },
  status: { type: String, trim: true, enum: ["Ativa", "Não Ativa"]},
  estabId: { type: Schema.Types.ObjectId, ref: "Estabelecimento"},
  reservaId: [{ type: Schema.Types.ObjectId, ref: "Reserva" }]
});

const AgendaModel = model("Agenda", AgendaSchema);

module.exports = AgendaModel;