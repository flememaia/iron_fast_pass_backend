const router = require("express").Router();
const bcrypt = require("bcryptjs");

const UserModel = require("../models/User.model");
const EstabModel = require("../models/Estab.model")
const generateToken = require("../config/jwt.config")
const isAuthenticated = require("../middlewares/isAuthenticated");
const attachCurrentUser = require("../middlewares/attachCurrentUser");
const uploader = require("../config/cloudinary.config")

const salt_rounds = 10;

// Crud (CREATE) - HTTP POST
// Criar um novo usuário
router.post("/signup", async (req, res) => {
  // Requisições do tipo POST tem uma propriedade especial chamada body, que carrega a informação enviada pelo cliente
  console.log(req.body);

  try {
    // Recuperar a senha que está vindo do corpo da requisição
    const { password, email } = req.body;

     // Verifica se o email é válido
     if (!email || !email.match(/[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/g)) {
      // O código 400 significa Bad Request
      return res.status(400).json({
        error: "E-mail é um campo obrigatório e deve ser um e-mail válido",
      });
    }

    // Verifica se a senha não está em branco ou se a senha não é complexa o suficiente
    if (
      !password ||
      !password.match(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/
      )
    ) {
      // O código 400 significa Bad Request
      return res.status(400).json({
        error: "Senha é obrigatória e deve conter ao menos uma letra maiúscula, uma minúscula, um número e um caractere especial e ter 8 caracteres de tamanho.",
      });
    }

    // Gera o salt
    const salt = await bcrypt.genSalt(salt_rounds);

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, salt);

    // Salva os dados de usuário no banco de dados (MongoDB) usando o body da requisição como parâmetro
    const result = await UserModel.create({
      ...req.body,
      passwordHash: hashedPassword,
    });

    // Responder o usuário recém-criado no banco para o cliente (solicitante). O status 201 significa Created
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    // O status 500 signifca Internal Server Error
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    // Extraindo o email e senha do corpo da requisição
    const { email, password } = req.body;

    // Pesquisar esse usuário no banco pelo email
    const user = await UserModel.findOne({ email });

    console.log(user);

    // Se o usuário não foi encontrado, significa que ele não é cadastrado
    if (!user) {
      return res
        .status(400)
        .json({ error: "This email is not yet registered in our website;" });
    }

    // Verificar se a senha do usuário pesquisado bate com a senha recebida pelo formulário

    if (await bcrypt.compare(password, user.passwordHash)) {
      // Gerando o JWT com os dados do usuário que acabou de logar
      const token = generateToken(user);

      return res.status(200).json({
        user: {
          name: user.name,
          email: user.email,
          _id: user._id
        },
        token,
      });
    } else {
      // 401 Significa Unauthorized
      return res.status(401).json({ error: "Wrong password or email" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

// cRud (READ) - HTTP GET
// Buscar dados do usuário
router.get("/profile", isAuthenticated, attachCurrentUser, (req, res) => {
  console.log(req.headers);

  try {
    // Buscar o usuário logado que está disponível através do middleware attachCurrentUser
    const loggedInUser = req.currentUser;

    if (loggedInUser) {
      // Responder o cliente com os dados do usuário. O status 200 significa OK
      return res.status(200).json(loggedInUser);
    } else {
      return res.status(404).json({ error: "User not found." });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

// crUd (UPDATE) - HTTP PUT
// Buscar dados do usuário e depois atualiza
router.put(
  "/profile",
  isAuthenticated,
  attachCurrentUser,
  async (req, res) => {
    try {
      // Buscar o usuário logado que está disponível através do middleware attachCurrentUser
      const loggedInUser = req.currentUser;

      if (req.body.password) {
        return res.status(400).json({
          error: "O campo senha não pode ser alterado por segurança!",
        });
      }

      const updatedUser = await UserModel.findOneAndUpdate(
        { _id: loggedInUser._id },
        { $set: { ...req.body } },
        { new: true }
      );

      return res.status(200).json(updatedUser);
    } catch (err) {
      // next(err);
    }
  });  

router.post('/upload', uploader.single('foto'), (req, res) => {
 if(!req.file){
   return res.status(500).json({ error: "Não foi possível completar o upload do arquivo"})
 }

 console.log(req.file)
 return res.status(201).json({ url: req.file.path})
})

router.get("/allestab_teste", async (req, res, next) => {
  try{
    const allEstab = await EstabModel.find();
    return res.status(200).json(allEstab)
  } catch (err) {
      next(err)
  }
});

//id do estabelecimento precisaria ver do parametro de rota, pq não deixei essa autenticada
router.get("/allestab_teste/:id", async (req, res) => {

  try {
    //Extrair o "id" do estabelecimento do parâmeto de rota => desestruturação de obj
    const { id } = req.params;

    const agenda = await EstabModel.find({_id: id});
    return res.status(200).json(agenda)
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});
module.exports = router;