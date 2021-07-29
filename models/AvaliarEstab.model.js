const { Schema, model } = require("mongoose");

const AvaliarEstabSchema = new Schema({
  comentario: { type: String, trim: true },
  avaliarAtendimento: {
    type: String,
    trim: true,
    required: true,
    enum: ["Insatisfatório", "Médio", "Bom", "Muito Bom"],
  },
  avaliarEstabelecimento: {
    type: String,
    trim: true,
    required: true,
    enum: ["Insatisfatório", "Médio", "Bom", "Muito Bom"],
  },
  agendaId: { type: Schema.Types.ObjectId, ref: "Agenda" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  estabId: { type: Schema.Types.ObjectId, ref: "Estabelecimento" },
});

const AvaliarEstabModel = model("AvaliarEstab", AvaliarEstabSchema);
module.exports = AvaliarEstabModel;
