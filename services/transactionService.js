// Módulo com as middlewares das rotas em routes
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const TransactionModel = require('../models/TransactionModel');
// const { findByIdAndRemove } = require('../models/TransactionModel');

// Lista os lançamentos (transações) de um mês
const getAll = async (req, res) => {
  const period = req.query.period;

  try {
    if (!period)
      res
        .status(400)
        .send('É necessário informar o período (yyyy-mm) desejado');

    const transactionsList = await TransactionModel.find({ yearMonth: period });

    // Array com valores dos lançamentos (usando valores positivos e negativos)
    // para calcular o saldo do mês em seguida
    const valuesArray = transactionsList.map(({ value, type }) => {
      let newValue = null;
      type == '+' ? (newValue = value) : (newValue = -1 * value);

      return newValue;
    });

    // balance e transactionsNumber poderiam ser calculados no client side
    const balance = valuesArray.reduce((acc, curr) => {
      return acc + curr;
    });

    res.send({
      transactionsNumber: transactionsList.length,
      balance,
      transactionsList,
    });
  } catch (error) {
    res.status(500).send('Erro ao listar lançamentos.');
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedTransaction = await TransactionModel.findByIdAndUpdate(
      { _id: id },
      req.body,
      {
        new: true,
      }
    );

    res.send(updatedTransaction);
  } catch (erro) {
    res.status(500).send('Erro ao atualizar lançamentos');
  }
};

const create = async (req, res) => {
  const {
    description,
    value,
    category,
    year,
    month,
    day,
    yearMonth,
    yearMonthDay,
    type,
  } = req.body;

  const newTransaction = new TransactionModel({
    description,
    value,
    category,
    year,
    month,
    day,
    yearMonth,
    yearMonthDay,
    type,
  });

  try {
    await newTransaction.save();

    res.send(newTransaction);
  } catch (error) {
    res.status(500).send('Erro ao criar novo lançamento');
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAccount = await TransactionModel.findByIdAndRemove({
      _id: id,
    });

    res.send('Lançamento excluído com sucesso!');
  } catch (error) {
    res.status(500).send('Erro ao excluir lançamento');
  }
};

module.exports = { getAll, update, create, remove };
