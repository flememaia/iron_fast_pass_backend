const { Schema, model } = require("mongoose");

const AvaliarAppSchema = new Schema({
  comentario: { type: String, trim: true },
  avaliarApp: {
    type: String,
    trim: true,
    required: true,
    enum: ["Insatisfatório", "Médio", "Bom", "Muito Bom"],
  },
  agendaId: { type: Schema.Types.ObjectId, ref: "Agenda" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  estabId: { type: Schema.Types.ObjectId, ref: "Estabelecimento" },
});

const AvaliarAppModel = model("AvaliarApp", AvaliarAppSchema);
module.exports = AvaliarAppModel;
