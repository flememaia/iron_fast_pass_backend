const { Schema, model } = require("mongoose");

const EstabSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true},
  passwordHash: { type: String, required: true },
  fotoUrl: [{ type: String, trim: true }],
  telefone: { type: String, trim: true },
  redeSocialUrl: { type: String, trim: true },
  rua: { type: String },
  bairro: { type: String },
  cidade: { type: String },
  numero: { type: String },
  estado: { type: String },
  cep: { type: String },
  localizacaoUrl: { type: String },
  rank: { type: Number, trim: true, max: 5, min: 0 },
  cnpj: { type: Number, trim: true, required: true },
  horarioDeFuncionamento: { type: String },
  reservaId: [{ type: Schema.Types.ObjectId, ref: "Reserva" }],  
  agendaId: [{ type: Schema.Types.ObjectId, ref: "Agenda" }],    
});

const EstabModel = model("Estabelecimento", EstabSchema);

module.exports = EstabModel;